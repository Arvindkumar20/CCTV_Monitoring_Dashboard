import { requireString, requireArray, optionalDate } from "../utils/validate.js";
import { NotFoundError, ConflictError } from "../errors.js";

export function createAccessService(repo, permissionsService, rolesService, auditService) {
  return {
    async grant({
      subjectId, subjectType = "user",
      resourceType, resourceId,
      roleKey = null,
      permissions = [],
      expiresAt = null,
      grantedBy,
      tenantId = null,
    }) {
      requireString(subjectId, "subjectId");
      requireString(resourceType, "resourceType");
      requireString(resourceId, "resourceId");
      requireString(grantedBy, "grantedBy");
      requireArray(permissions, "permissions");
      optionalDate(expiresAt, "expiresAt");

      // validate permission catalog
      for (const p of permissions) {
        if (!["allow", "deny"].includes(p.effect)) {
          throw new ConflictError("permission.effect must be 'allow' or 'deny'", p);
        }
        const ok = await permissionsService.exists({ tenantId, resourceType: p.resourceType || resourceType, key: p.key });
        if (!ok) throw new NotFoundError("Permission not registered", p);
      }

      // validate role exists
      if (roleKey) {
        const role = await repo.roles.findByKey({
          tenantId, scope: "resourceType", resourceType, key: roleKey,
        });
        if (!role) throw new NotFoundError("Role not found", { roleKey, resourceType });
      }

      const grant = await repo.grants.upsertActive({
        tenantId, subjectId, subjectType,
        resourceType, resourceId,
        roleKey,
        permissions,
        expiresAt,
        grantedBy,
      });

      await auditService.log({
        tenantId, actorId: grantedBy, subjectId,
        action: "ACCESS_GRANTED",
        resourceType, resourceId,
        roleKey,
        metadata: { permissions },
      });

      return grant;
    },

    async update({ grantId, patch, actorId, tenantId = null }) {
      requireString(grantId, "grantId");
      requireString(actorId, "actorId");

      const grant = await repo.grants.findById({ tenantId, grantId });
      if (!grant) throw new NotFoundError("Grant not found", { grantId });

      if (patch.permissions) {
        for (const p of patch.permissions) {
          const ok = await permissionsService.exists({
            tenantId, resourceType: p.resourceType || grant.resourceType, key: p.key,
          });
          if (!ok) throw new NotFoundError("Permission not registered", p);
        }
      }

      const updated = await repo.grants.update({ tenantId, grantId, patch });

      await auditService.log({
        tenantId, actorId, subjectId: grant.subjectId,
        action: "ACCESS_UPDATED",
        resourceType: grant.resourceType, resourceId: grant.resourceId,
        roleKey: grant.roleKey,
        metadata: { patch },
      });

      return updated;
    },

    async revoke({ grantId, actorId, tenantId = null }) {
      requireString(grantId, "grantId");
      requireString(actorId, "actorId");

      const grant = await repo.grants.findById({ tenantId, grantId });
      if (!grant) throw new NotFoundError("Grant not found", { grantId });

      await repo.grants.delete({ tenantId, grantId });

      await auditService.log({
        tenantId, actorId, subjectId: grant.subjectId,
        action: "ACCESS_REVOKED",
        resourceType: grant.resourceType, resourceId: grant.resourceId,
        roleKey: grant.roleKey,
        metadata: {},
      });

      return { revoked: true, grantId };
    },

    async get({ grantId, tenantId = null }) {
      return repo.grants.findById({ tenantId, grantId });
    },

    async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 50 } = {}) {
      return repo.grants.list({ tenantId, subjectId, resourceType, resourceId, page, limit });
    },

    // used by engine
    async findApplicableGrants({ subjectId, subjectType, resourceType, resourceId, tenantId = null }) {
      return repo.grants.findApplicable({ tenantId, subjectId, subjectType, resourceType, resourceId });
    },
  };
}