import { ConvexHttpClient } from "convex/browser";
import { createAdapterFactory } from "better-auth/adapters";
import { api } from "../../convex/_generated/api";

// Create Convex client for server-side operations
const getConvexUrl = () => {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL;
  if (!url) {
    throw new Error(
      "Missing CONVEX_URL or NEXT_PUBLIC_CONVEX_URL environment variable. " +
      "Please set one of these variables to your Convex deployment URL."
    );
  }
  return url;
};

const convexClient = new ConvexHttpClient(getConvexUrl());

// Map Better Auth models to Convex table names
const MODEL_TO_TABLE = {
  user: "authUsers",
  session: "authSessions", 
  account: "authAccounts",
  verification: "authVerifications",
  ratelimit: "authRateLimits",
} as const;

type BetterAuthModel = keyof typeof MODEL_TO_TABLE;

// Transform Better Auth where clauses to Convex format
function transformWhereClause(where: any[]) {
  return where.map(clause => ({
    field: clause.field,
    value: clause.value,
    operator: clause.operator || "eq",
    connector: clause.connector || "AND"
  }));
}

// Transform dates to timestamps for Convex
function transformDataForConvex(data: any) {
  const transformed = { ...data };
  
  // Convert Date objects to timestamps
  Object.keys(transformed).forEach(key => {
    if (transformed[key] instanceof Date) {
      transformed[key] = transformed[key].getTime();
    }
  });
  
  return transformed;
}

// Transform Convex data back to Better Auth format
function transformDataFromConvex(data: any) {
  if (!data) return null;
  
  const { _id, _creationTime, ...rest } = data;
  
  // Convert timestamps back to Date objects for specific fields
  const dateFields = ['createdAt', 'updatedAt', 'expiresAt', 'accessTokenExpiresAt', 'refreshTokenExpiresAt'];
  dateFields.forEach(field => {
    if (rest[field] && typeof rest[field] === 'number') {
      rest[field] = new Date(rest[field]);
    }
  });
  
  return rest;
}

export const convexAdapter = createAdapterFactory({
  config: {
    adapterId: "convex-adapter",
    adapterName: "Convex Adapter",
    supportsNumericIds: false,
    supportsDates: true,
    supportsBooleans: true,
    supportsJSON: true,
    transaction: false, // Convex handles transactions internally
  },
  adapter: ({ options, debugLog, schema, getFieldName, getModelName }) => {
    return {
      async create({ model, data }) {
        try {
          debugLog(`Creating ${model}:`, data);
          const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
          if (!tableName) {
            throw new Error(`Unknown model: ${model}`);
          }
          const transformedData = transformDataForConvex(data);
          
          const result = await convexClient.mutation(api.authPersistence.create, {
            table: tableName,
            data: transformedData
          });
          
          return transformDataFromConvex(result);
        } catch (error) {
          console.error(`Error creating ${model}:`, error);
          throw error;
        }
      },

      async findOne({ model, where }) {
        debugLog(`Finding one ${model}:`, where);
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = transformWhereClause(where);
        
        const result = await convexClient.query(api.authPersistence.findOne, {
          table: tableName,
          where: transformedWhere
        });
        
        return transformDataFromConvex(result);
      },

      async findMany({ model, where, limit, offset, sortBy }) {
        debugLog(`Finding many ${model}:`, { where, limit, offset, sortBy });
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = where ? transformWhereClause(where) : undefined;
        
        const results = await convexClient.query(api.authPersistence.findMany, {
          table: tableName,
          where: transformedWhere,
          limit,
          offset,
          sortBy
        });
        
        return results.map(transformDataFromConvex);
      },

      async count({ model, where }) {
        debugLog(`Counting ${model}:`, where);
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = where ? transformWhereClause(where) : undefined;
        
        return await convexClient.query(api.authPersistence.count, {
          table: tableName,
          where: transformedWhere
        });
      },

      async update({ model, where, update: updateData }) {
        debugLog(`Updating ${model}:`, { where, updateData });
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = transformWhereClause(where);
        const transformedData = transformDataForConvex(updateData);
        
        const result = await convexClient.mutation(api.authPersistence.update, {
          table: tableName,
          where: transformedWhere,
          data: transformedData
        });
        
        return transformDataFromConvex(result);
      },

      async updateMany({ model, where, update: updateData }) {
        debugLog(`Updating many ${model}:`, { where, updateData });
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = transformWhereClause(where);
        const transformedData = transformDataForConvex(updateData);
        
        return await convexClient.mutation(api.authPersistence.updateMany, {
          table: tableName,
          where: transformedWhere,
          data: transformedData
        });
      },

      async delete({ model, where }) {
        debugLog(`Deleting ${model}:`, where);
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = transformWhereClause(where);
        
        await convexClient.mutation(api.authPersistence.deleteOne, {
          table: tableName,
          where: transformedWhere
        });
      },

      async deleteMany({ model, where }) {
        debugLog(`Deleting many ${model}:`, where);
        const tableName = MODEL_TO_TABLE[model as BetterAuthModel];
        const transformedWhere = transformWhereClause(where);
        
        return await convexClient.mutation(api.authPersistence.deleteMany, {
          table: tableName,
          where: transformedWhere
        });
      }
    };
  }
});
