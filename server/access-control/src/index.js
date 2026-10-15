import { createEngine, REASONS } from "./core/engine.js";
import {
  AccessControlError, ValidationError, NotFoundError, ConflictError, ForbiddenError,
} from "./errors.js";

/**
 * createAccessControl({
 *   adapter: createMongoAdapter(...) | createMemoryAdapter(),
 *   config: { enabled, disabledBehavior, ownerPolicy, audit, cache, tenant },
 *   logger
 * })
 */
export function createAccessControl({ adapter, config = {}, logger = null } = {}) {
  if (!adapter) throw new Error("createAccessControl requires an adapter");
  return createEngine({ repo: adapter, config, logger });
}

export { REASONS };
export {
  AccessControlError, ValidationError, NotFoundError, ConflictError, ForbiddenError,
};
export { createMongoAdapter } from "./adapters/mongodb/index.js";
export { createMemoryAdapter } from "./adapters/memory/index.js";
export { authorize } from "./adapters/express/authorize.js";
export { createAdminRouter } from "./adapters/express/admin.router.js";