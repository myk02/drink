/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as careerApplications from "../careerApplications.js";
import type * as crons from "../crons.js";
import type * as distributors from "../distributors.js";
import type * as donations from "../donations.js";
import type * as events from "../events.js";
import type * as flavors from "../flavors.js";
import type * as gyms from "../gyms.js";
import type * as http from "../http.js";
import type * as inquiries from "../inquiries.js";
import type * as newsletter from "../newsletter.js";
import type * as orders from "../orders.js";
import type * as payments from "../payments.js";
import type * as plans from "../plans.js";
import type * as products from "../products.js";
import type * as seed from "../seed.js";
import type * as subscriptions from "../subscriptions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  careerApplications: typeof careerApplications;
  crons: typeof crons;
  distributors: typeof distributors;
  donations: typeof donations;
  events: typeof events;
  flavors: typeof flavors;
  gyms: typeof gyms;
  http: typeof http;
  inquiries: typeof inquiries;
  newsletter: typeof newsletter;
  orders: typeof orders;
  payments: typeof payments;
  plans: typeof plans;
  products: typeof products;
  seed: typeof seed;
  subscriptions: typeof subscriptions;
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
