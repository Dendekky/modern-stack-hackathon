/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ai from "../ai.js";
import type * as authPersistence from "../authPersistence.js";
import type * as demo from "../demo.js";
import type * as emails from "../emails.js";
import type * as firecrawl from "../firecrawl.js";
import type * as knowledgeBase from "../knowledgeBase.js";
import type * as migration from "../migration.js";
import type * as tickets from "../tickets.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ai: typeof ai;
  authPersistence: typeof authPersistence;
  demo: typeof demo;
  emails: typeof emails;
  firecrawl: typeof firecrawl;
  knowledgeBase: typeof knowledgeBase;
  migration: typeof migration;
  tickets: typeof tickets;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
