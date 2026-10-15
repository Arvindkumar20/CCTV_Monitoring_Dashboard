import mongoose from "mongoose";
import { registerModels } from "./models.js";

export function createMongoAdapter({ connection = mongoose, prefix = "ac_" } = {}) {
  const M = registerModels(connection, prefix);

  return {
    permissions: {
      async create(doc) {
        return M.Permission.create(doc);
      },
      async findByKey({ tenantId = null, resourceType, key }) {
        return M.Permission.findOne({ tenantId, resourceType, key }).lean();
      },
      async list({ tenantId = null, resourceType = null }) {
        const q = { tenantId };
        if (resourceType) q.resourceType = resourceType;
        return M.Permission.find(q).lean();
      },
      async delete({ tenantId = null, resourceType, key }) {
        return M.Permission.deleteOne({ tenantId, resourceType, key });
      },
    },

    roles: {
      async create(doc) {
        return M.Role.create(doc);
      },
      async findByKey({ tenantId = null, scope, resourceType = null, key }) {
        return M.Role.findOne({ tenantId, scope, resourceType, key }).lean();
      },
      async list({ tenantId = null, resourceType = null }) {
        const q = { tenantId };
        if (resourceType) q.resourceType = resourceType;
        return M.Role.find(q).lean();
      },
      async update({ tenantId = null, scope, resourceType = null, key, patch }) {
        return M.Role.findOneAndUpdate(
          { tenantId, scope, resourceType, key },
          { $set: patch },
          { new: true }
        ).lean();
      },
      async delete({ tenantId = null, scope, resourceType = null, key }) {
        return M.Role.deleteOne({ tenantId, scope, resourceType, key });
      },
    },

    grants: {
      async upsertActive(doc) {
        return M.Grant.findOneAndUpdate(
          {
            tenantId: doc.tenantId,
            subjectId: doc.subjectId,
            subjectType: doc.subjectType,
            resourceType: doc.resourceType,
            resourceId: doc.resourceId,
            roleKey: doc.roleKey || null,
            expiresAt: null,
          },
          { $set: doc },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();
      },
      async findById({ tenantId = null, grantId }) {
        return M.Grant.findOne({ _id: grantId, tenantId }).lean();
      },
      async findApplicable({ tenantId = null, subjectId, subjectType, resourceType, resourceId }) {
        const now = new Date();
        return M.Grant.find({
          tenantId,
          subjectId,
          subjectType,
          $and: [
            { $or: [{ resourceType }, { resourceType: "*" }] },
            { $or: [{ resourceId }, { resourceId: "*" }] },
          ],
          $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        }).lean();
      },
      async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 50 }) {
        const q = { tenantId };
        if (subjectId) q.subjectId = subjectId;
        if (resourceType) q.resourceType = resourceType;
        if (resourceId) q.resourceId = resourceId;
        const [items, total] = await Promise.all([
          M.Grant.find(q).skip((page - 1) * limit).limit(limit).lean(),
          M.Grant.countDocuments(q),
        ]);
        return { items, total, page, limit };
      },
      async update({ tenantId = null, grantId, patch }) {
        return M.Grant.findOneAndUpdate(
          { _id: grantId, tenantId },
          { $set: patch },
          { new: true }
        ).lean();
      },
      async delete({ tenantId = null, grantId }) {
        return M.Grant.deleteOne({ _id: grantId, tenantId });
      },
    },

    resources: {
      async upsert(doc) {
        return M.Resource.findOneAndUpdate(
          { tenantId: doc.tenantId, resourceType: doc.resourceType, resourceId: doc.resourceId },
          { $set: doc },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();
      },
      async find({ tenantId = null, resourceType, resourceId }) {
        return M.Resource.findOne({ tenantId, resourceType, resourceId }).lean();
      },
      async list({ tenantId = null, resourceType = null, ownerId = null }) {
        const q = { tenantId };
        if (resourceType) q.resourceType = resourceType;
        if (ownerId) q.ownerId = ownerId;
        return M.Resource.find(q).lean();
      },
      async delete({ tenantId = null, resourceType, resourceId }) {
        return M.Resource.deleteOne({ tenantId, resourceType, resourceId });
      },
    },

    audit: {
      async create(doc) {
        return M.Audit.create(doc);
      },
      async list({ tenantId = null, subjectId = null, resourceType = null, resourceId = null, page = 1, limit = 100 }) {
        const q = { tenantId };
        if (subjectId) q.subjectId = subjectId;
        if (resourceType) q.resourceType = resourceType;
        if (resourceId) q.resourceId = resourceId;
        const [items, total] = await Promise.all([
          M.Audit.find(q).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean(),
          M.Audit.countDocuments(q),
        ]);
        return { items, total, page, limit };
      },
    },

    _models: M,
  };
}