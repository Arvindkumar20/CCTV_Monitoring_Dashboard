export function createAuditService(repo, { enabled = true, logger = null } = {}) {
  return {
    async log(entry) {
      if (!enabled) return;
      const record = {
        ...entry,
        timestamp: new Date(),
      };
      if (logger?.info) {
        logger.info("access-control.audit", record);
      }
      try {
        await repo.audit.create(record);
      } catch (err) {
        // audit failures must never break authz
        if (logger?.error) logger.error("audit write failed", err);
      }
    },

    async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 100 } = {}) {
      return repo.audit.list({ tenantId, subjectId, resourceType, resourceId, page, limit });
    },
  };
}