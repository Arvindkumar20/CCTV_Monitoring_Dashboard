// src/access-control-instance.js
import mongoose from "mongoose";
import {
  createAccessControl,
  createMongoAdapter,
} from "@internal/access-control";
import logger from "./config/logger.js";

// Ye ek hi instance poore app mein reuse hoga.
// Isko har route mein import karo, new mat banao.
export const ac = createAccessControl({
  adapter: createMongoAdapter({
    connection: mongoose,
    prefix: "ac_",          // collections: ac_grants, ac_roles, ...
  }),
  config: {
    enabled: true,
    disabledBehavior: "deny_all",         // fail-closed
    ownerPolicy: {
      enabled: true,
      permissions: ["*"],                 // owner ko default full access
    },
    audit: { enabled: true },
    tenant: { enabled: false },           // abhi single-tenant
  },
  logger,
});