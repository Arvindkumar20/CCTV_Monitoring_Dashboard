import { requireString, optionalString } from "../utils/validate.js";

export function createResourcesService(repo) {
  return {
    async register({ resourceType, resourceId, ownerId = null, metadata = {}, tenantId = null }) {
      requireString(resourceType, "resourceType");
      requireString(resourceId, "resourceId");
      optionalString(ownerId, "ownerId");

      return repo.resources.upsert({
        tenantId, resourceType, resourceId,
        ownerId: ownerId ? String(ownerId) : null,
        metadata: metadata || {},
      });
    },

    async get({ resourceType, resourceId, tenantId = null }) {
      return repo.resources.find({ tenantId, resourceType, resourceId });
    },

    async remove({ resourceType, resourceId, tenantId = null }) {
      return repo.resources.delete({ tenantId, resourceType, resourceId });
    },

    async list({ tenantId = null, resourceType = null, ownerId = null } = {}) {
      return repo.resources.list({ tenantId, resourceType, ownerId });
    },
  };
}