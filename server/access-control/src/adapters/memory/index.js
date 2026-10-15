let idCounter = 0;
const nextId = () => `mem_${++idCounter}`;

export function createMemoryAdapter() {
  const store = {
    permissions: [],
    roles: [],
    grants: [],
    resources: [],
    audit: [],
  };

  return {
    permissions: {
      async create(doc) {
        const rec = { _id: nextId(), ...doc, createdAt: new Date() };
        store.permissions.push(rec);
        return rec;
      },
      async findByKey({ tenantId = null, resourceType, key }) {
        return store.permissions.find(
          (p) => p.tenantId === tenantId && p.resourceType === resourceType && p.key === key
        ) || null;
      },
      async list({ tenantId = null, resourceType = null }) {
        return store.permissions.filter(
          (p) => p.tenantId === tenantId && (!resourceType || p.resourceType === resourceType)
        );
      },
      async delete({ tenantId = null, resourceType, key }) {
        const i = store.permissions.findIndex(
          (p) => p.tenantId === tenantId && p.resourceType === resourceType && p.key === key
        );
        if (i >= 0) store.permissions.splice(i, 1);
      },
    },

    roles: {
      async create(doc) {
        const rec = { _id: nextId(), ...doc, createdAt: new Date(), updatedAt: new Date() };
        store.roles.push(rec);
        return rec;
      },
      async findByKey({ tenantId = null, scope, resourceType = null, key }) {
        return store.roles.find(
          (r) => r.tenantId === tenantId && r.scope === scope &&
                 r.resourceType === resourceType && r.key === key
        ) || null;
      },
      async list({ tenantId = null, resourceType = null }) {
        return store.roles.filter(
          (r) => r.tenantId === tenantId && (!resourceType || r.resourceType === resourceType)
        );
      },
      async update({ tenantId = null, scope, resourceType = null, key, patch }) {
        const r = await this.findByKey({ tenantId, scope, resourceType, key });
        if (!r) return null;
        Object.assign(r, patch, { updatedAt: new Date() });
        return r;
      },
      async delete({ tenantId = null, scope, resourceType = null, key }) {
        const i = store.roles.findIndex(
          (r) => r.tenantId === tenantId && r.scope === scope &&
                 r.resourceType === resourceType && r.key === key
        );
        if (i >= 0) store.roles.splice(i, 1);
      },
    },

    grants: {
      async upsertActive(doc) {
        const existing = store.grants.find(
          (g) => g.tenantId === doc.tenantId &&
                 g.subjectId === doc.subjectId &&
                 g.subjectType === doc.subjectType &&
                 g.resourceType === doc.resourceType &&
                 g.resourceId === doc.resourceId &&
                 (g.roleKey || null) === (doc.roleKey || null)
        );
        if (existing) {
          Object.assign(existing, doc, { updatedAt: new Date() });
          return existing;
        }
        const rec = { _id: nextId(), ...doc, createdAt: new Date(), updatedAt: new Date() };
        store.grants.push(rec);
        return rec;
      },
      async findById({ tenantId = null, grantId }) {
        return store.grants.find((g) => g._id === grantId && g.tenantId === tenantId) || null;
      },
      async findApplicable({ tenantId = null, subjectId, subjectType, resourceType, resourceId }) {
        const now = new Date();
        return store.grants.filter((g) =>
          g.tenantId === tenantId &&
          g.subjectId === subjectId &&
          g.subjectType === subjectType &&
          (g.resourceType === "*" || g.resourceType === resourceType) &&
          (g.resourceId === "*" || g.resourceId === resourceId) &&
          (!g.expiresAt || new Date(g.expiresAt) > now)
        );
      },
      async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 50 }) {
        let items = store.grants.filter(
          (g) =>
            g.tenantId === tenantId &&
            (!subjectId || g.subjectId === subjectId) &&
            (!resourceType || g.resourceType === resourceType) &&
            (!resourceId || g.resourceId === resourceId)
        );
        const total = items.length;
        items = items.slice((page - 1) * limit, page * limit);
        return { items, total, page, limit };
      },
      async update({ tenantId = null, grantId, patch }) {
        const g = await this.findById({ tenantId, grantId });
        if (!g) return null;
        Object.assign(g, patch, { updatedAt: new Date() });
        return g;
      },
      async delete({ tenantId = null, grantId }) {
        const i = store.grants.findIndex((g) => g._id === grantId && g.tenantId === tenantId);
        if (i >= 0) store.grants.splice(i, 1);
      },
    },

    resources: {
      async upsert(doc) {
        const existing = store.resources.find(
          (r) => r.tenantId === doc.tenantId &&
                 r.resourceType === doc.resourceType &&
                 r.resourceId === doc.resourceId
        );
        if (existing) {
          Object.assign(existing, doc, { updatedAt: new Date() });
          return existing;
        }
        const rec = { _id: nextId(), ...doc, createdAt: new Date(), updatedAt: new Date() };
        store.resources.push(rec);
        return rec;
      },
      async find({ tenantId = null, resourceType, resourceId }) {
        return store.resources.find(
          (r) => r.tenantId === tenantId &&
                 r.resourceType === resourceType &&
                 r.resourceId === resourceId
        ) || null;
      },
      async list({ tenantId = null, resourceType = null, ownerId = null }) {
        return store.resources.filter(
          (r) =>
            r.tenantId === tenantId &&
            (!resourceType || r.resourceType === resourceType) &&
            (!ownerId || r.ownerId === ownerId)
        );
      },
      async delete({ tenantId = null, resourceType, resourceId }) {
        const i = store.resources.findIndex(
          (r) => r.tenantId === tenantId &&
                 r.resourceType === resourceType &&
                 r.resourceId === resourceId
        );
        if (i >= 0) store.resources.splice(i, 1);
      },
    },

    audit: {
      async create(doc) {
        const rec = { _id: nextId(), ...doc, timestamp: doc.timestamp || new Date() };
        store.audit.push(rec);
        return rec;
      },
      async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 100 }) {
        let items = store.audit.filter(
          (a) =>
            a.tenantId === tenantId &&
            (!subjectId || a.subjectId === subjectId) &&
            (!resourceType || a.resourceType === resourceType) &&
            (!resourceId || a.resourceId === resourceId)
        );
        const total = items.length;
        items = items.slice((page - 1) * limit, page * limit);
        return { items, total, page, limit };
      },
    },

    // for tests
    _store: store,
  };
}