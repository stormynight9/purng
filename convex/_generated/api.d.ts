/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as authAdapter from "../authAdapter.js";
import type * as crons from "../crons.js";
import type * as feedback from "../feedback.js";
import type * as migrations_backfillStats from "../migrations/backfillStats.js";
import type * as migrations_fixDates from "../migrations/fixDates.js";
import type * as migrations_importData from "../migrations/importData.js";
import type * as mutations from "../mutations.js";
import type * as pushSubscriptions from "../pushSubscriptions.js";
import type * as queries from "../queries.js";
import type * as sendPush from "../sendPush.js";
import type * as utils from "../utils.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  authAdapter: typeof authAdapter;
  crons: typeof crons;
  feedback: typeof feedback;
  "migrations/backfillStats": typeof migrations_backfillStats;
  "migrations/fixDates": typeof migrations_fixDates;
  "migrations/importData": typeof migrations_importData;
  mutations: typeof mutations;
  pushSubscriptions: typeof pushSubscriptions;
  queries: typeof queries;
  sendPush: typeof sendPush;
  utils: typeof utils;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
