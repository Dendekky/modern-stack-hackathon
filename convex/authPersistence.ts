import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Define the table names that Better Auth will use
const AUTH_TABLES = {
  authUsers: "authUsers",
  authSessions: "authSessions", 
  authAccounts: "authAccounts",
  authVerifications: "authVerifications",
  authRateLimits: "authRateLimits"
} as const;

type AuthTableName = keyof typeof AUTH_TABLES;

// Where clause type for filtering
const WhereClause = v.object({
  field: v.string(),
  value: v.any(),
  operator: v.optional(v.string()),
  connector: v.optional(v.union(v.literal("AND"), v.literal("OR")))
});

// Sort clause type
const SortClause = v.object({
  field: v.string(),
  direction: v.union(v.literal("asc"), v.literal("desc"))
});

// Helper function to evaluate where clauses
function matchesWhere(doc: any, whereClause: any): boolean {
  const { field, value, operator = "eq" } = whereClause;
  const docValue = doc[field];
  
  switch (operator.toLowerCase()) {
    case "eq":
      return docValue === value;
    case "ne":
      return docValue !== value;
    case "in":
      return Array.isArray(value) ? value.includes(docValue) : false;
    case "not_in":
      return Array.isArray(value) ? !value.includes(docValue) : false;
    case "gt":
      return docValue > value;
    case "gte":
      return docValue >= value;
    case "lt":
      return docValue < value;
    case "lte":
      return docValue <= value;
    case "contains":
      return typeof docValue === "string" && typeof value === "string" 
        ? docValue.includes(value) : false;
    case "starts_with":
      return typeof docValue === "string" && typeof value === "string"
        ? docValue.startsWith(value) : false;
    case "ends_with":
      return typeof docValue === "string" && typeof value === "string"
        ? docValue.endsWith(value) : false;
    default:
      return docValue === value;
  }
}

// Helper function to filter documents based on where clauses
function filterDocs(docs: any[], where?: any[]): any[] {
  if (!where || where.length === 0) {
    return docs;
  }
  
  return docs.filter(doc => {
    let result = true;
    let currentResult: boolean | null = null;
    
    for (const clause of where) {
      const clauseResult = matchesWhere(doc, clause);
      
      if (currentResult === null) {
        currentResult = clauseResult;
      } else if (clause.connector === "OR") {
        currentResult = currentResult || clauseResult;
      } else {
        currentResult = currentResult && clauseResult;
      }
    }
    
    return currentResult ?? true;
  });
}

// Helper function to sort documents
function sortDocs(docs: any[], sortBy?: any): any[] {
  if (!sortBy) return docs;
  
  const { field, direction } = sortBy;
  return docs.sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal === bVal) return 0;
    if (aVal == null) return direction === "asc" ? -1 : 1;
    if (bVal == null) return direction === "asc" ? 1 : -1;
    
    const comparison = aVal > bVal ? 1 : -1;
    return direction === "asc" ? comparison : -comparison;
  });
}

// Create a new record
export const create = mutation({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"), 
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    data: v.any()
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert(args.table as any, args.data);
    const created = await ctx.db.get(id);
    return created;
  }
});

// Find one record
export const findOne = query({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.array(WhereClause)
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = filterDocs(allDocs, args.where);
    return filtered[0] || null;
  }
});

// Find many records
export const findMany = query({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.optional(v.array(WhereClause)),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    sortBy: v.optional(SortClause)
  },
  handler: async (ctx, args) => {
    let docs = await ctx.db.query(args.table as any).collect();
    
    // Apply where filter
    if (args.where) {
      docs = filterDocs(docs, args.where);
    }
    
    // Apply sorting
    if (args.sortBy) {
      docs = sortDocs(docs, args.sortBy);
    }
    
    // Apply pagination
    if (args.offset) {
      docs = docs.slice(args.offset);
    }
    if (args.limit) {
      docs = docs.slice(0, args.limit);
    }
    
    return docs;
  }
});

// Count records
export const count = query({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.optional(v.array(WhereClause))
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = args.where ? filterDocs(allDocs, args.where) : allDocs;
    return filtered.length;
  }
});

// Update one record
export const update = mutation({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.array(WhereClause),
    data: v.any()
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = filterDocs(allDocs, args.where);
    const target = filtered[0];
    
    if (!target) return null;
    
    await ctx.db.patch(target._id, args.data);
    const updated = await ctx.db.get(target._id);
    return updated;
  }
});

// Update many records
export const updateMany = mutation({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.array(WhereClause),
    data: v.any()
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = filterDocs(allDocs, args.where);
    
    await Promise.all(
      filtered.map(doc => ctx.db.patch(doc._id, args.data))
    );
    
    return filtered.length;
  }
});

// Delete one record
export const deleteOne = mutation({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.array(WhereClause)
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = filterDocs(allDocs, args.where);
    const target = filtered[0];
    
    if (!target) return;
    
    await ctx.db.delete(target._id);
  }
});

// Delete many records
export const deleteMany = mutation({
  args: {
    table: v.union(
      v.literal("authUsers"),
      v.literal("authSessions"),
      v.literal("authAccounts"),
      v.literal("authVerifications"),
      v.literal("authRateLimits")
    ),
    where: v.array(WhereClause)
  },
  handler: async (ctx, args) => {
    const allDocs = await ctx.db.query(args.table as any).collect();
    const filtered = filterDocs(allDocs, args.where);
    
    await Promise.all(
      filtered.map(doc => ctx.db.delete(doc._id))
    );
    
    return filtered.length;
  }
});
