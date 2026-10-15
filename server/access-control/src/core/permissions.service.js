import { requireString } from "../utils/validate.js";
import { ConflictError, NotFoundError } from "../errors.js";

export function createPermissionsService(repo) {
  return {
    async register({ resourceType, key, description = null, tenantId = null }) {
      requireString(resourceType, "resourceType");
      requireString(key, "key");

      const existing = await repo.permissions.findByKey({ tenantId, resourceType, key });
      if (existing) {
        throw new ConflictError("Permission already registered", { resourceType, key });
      }

      return repo.permissions.create({ tenantId, resourceType, key, description });
    },

    async registerMany(items) {
      const results = [];
      for (const item of items) {
        try {
          results.push(await this.register(item));
        } catch (err) {
          if (err.code === "CONFLICT") {
            // idempotent — already registered is fine
            results.push(
              await repo.permissions.findByKey({
                tenantId: item.tenantId ?? null,
                resourceType: item.resourceType,
                key: item.key,
              })
            );
          } else {
            throw err;
          }
        }
      }
      return results;
    },

    async list({ tenantId = null, resourceType = null } = {}) {
      return repo.permissions.list({ tenantId, resourceType });
    },

    async exists({ tenantId = null, resourceType, key }) {
      const p = await repo.permissions.findByKey({ tenantId, resourceType, key });
      return !!p;
    },

    async remove({ tenantId = null, resourceType, key }) {
      const p = await repo.permissions.findByKey({ tenantId, resourceType, key });
      if (!p) throw new NotFoundError("Permission not found", { resourceType, key });
      return repo.permissions.delete({ tenantId, resourceType, key });
    },
  };
}