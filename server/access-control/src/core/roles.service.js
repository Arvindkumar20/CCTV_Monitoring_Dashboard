import { requireString, requireArray } from "../utils/validate.js";
import { ConflictError, NotFoundError } from "../errors.js";

export function createRolesService(repo, permissionsService) {
  return {
    async create({ key, name = null, description = null, scope = "resourceType", resourceType = null, permissions = [], tenantId = null }) {
      requireString(key, "key");
      requireArray(permissions, "permissions");

      if (scope === "resourceType") requireString(resourceType, "resourceType");
      if (scope === "global") resourceType = null;

      // validate permissions exist
      for (const p of permissions) {
        const ok = await permissionsService.exists({ tenantId, resourceType: p.resourceType, key: p.key });
        if (!ok) throw new NotFoundError("Permission not registered", p);
      }

      const existing = await repo.roles.findByKey({ tenantId, scope, resourceType, key });
      if (existing) throw new ConflictError("Role already exists", { key, scope, resourceType });

      return repo.roles.create({
        tenantId, key, name: name || key, description, scope, resourceType, permissions,
      });
    },

    async createMany(items) {
      const out = [];
      for (const item of items) {
        try {
          out.push(await this.create(item));
        } catch (err) {
          if (err.code === "CONFLICT") {
            out.push(await repo.roles.findByKey({
              tenantId: item.tenantId ?? null,
              scope: item.scope || "resourceType",
              resourceType: item.resourceType ?? null,
              key: item.key,
            }));
          } else throw err;
        }
      }
      return out;
    },

    async get({ key, scope = "resourceType", resourceType = null, tenantId = null }) {
      const role = await repo.roles.findByKey({ tenantId, scope, resourceType, key });
      if (!role) throw new NotFoundError("Role not found", { key });
      return role;
    },

    async list({ tenantId = null, resourceType = null } = {}) {
      return repo.roles.list({ tenantId, resourceType });
    },

    async update({ key, scope = "resourceType", resourceType = null, tenantId = null, patch }) {
      const role = await repo.roles.findByKey({ tenantId, scope, resourceType, key });
      if (!role) throw new NotFoundError("Role not found", { key });

      if (patch.permissions) {
        for (const p of patch.permissions) {
          const ok = await permissionsService.exists({ tenantId, resourceType: p.resourceType, key: p.key });
          if (!ok) throw new NotFoundError("Permission not registered", p);
        }
      }
      return repo.roles.update({ tenantId, scope, resourceType, key, patch });
    },

    async remove({ key, scope = "resourceType", resourceType = null, tenantId = null }) {
      const role = await repo.roles.findByKey({ tenantId, scope, resourceType, key });
      if (!role) throw new NotFoundError("Role not found", { key });
      return repo.roles.delete({ tenantId, scope, resourceType, key });
    },

    // used by engine during can()
    async getPermissionsForRole({ key, resourceType = null, tenantId = null }) {
      const role = await repo.roles.findByKey({
        tenantId,
        scope: resourceType ? "resourceType" : "global",
        resourceType,
        key,
      });
      if (!role) {
        // try global fallback
        const global = await repo.roles.findByKey({ tenantId, scope: "global", resourceType: null, key });
        return global ? global.permissions : [];
      }
      return role.permissions;
    },
  };
}