import mongoose from "mongoose";

const base = { timestamps: true };

/* ------------------------------------------------------------------ */
export const PermissionSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: null, index: true },
    resourceType: { type: String, required: true, index: true },
    key: { type: String, required: true, index: true },
    description: { type: String, default: null },
  },
  base,
);
PermissionSchema.index(
  { tenantId: 1, resourceType: 1, key: 1 },
  { unique: true },
);

/* ------------------------------------------------------------------ */
const PermissionRefSchema = new mongoose.Schema(
  { resourceType: String, key: String },
  { _id: false },
);

export const RoleSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: null, index: true },
    key: { type: String, required: true, index: true },
    name: { type: String, default: null },
    description: { type: String, default: null },
    scope: {
      type: String,
      enum: ["global", "resourceType"],
      default: "resourceType",
    },
    resourceType: { type: String, default: null, index: true },
    permissions: { type: [PermissionRefSchema], default: [] },
  },
  base,
);
RoleSchema.index(
  { tenantId: 1, scope: 1, resourceType: 1, key: 1 },
  { unique: true },
);

/* ------------------------------------------------------------------ */
const GrantPermissionSchema = new mongoose.Schema(
  {
    key: String,
    effect: { type: String, enum: ["allow", "deny"], default: "allow" },
  },
  { _id: false },
);

export const GrantSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: null, index: true },
    subjectId: { type: String, required: true, index: true },
    subjectType: { type: String, default: "user", index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, required: true, index: true },
    roleKey: { type: String, default: null, index: true },
    permissions: { type: [GrantPermissionSchema], default: [] },
    grantedBy: { type: String, required: true },
    expiresAt: { type: Date, default: null },
  },
  base,
);
GrantSchema.index({
  tenantId: 1,
  subjectId: 1,
  subjectType: 1,
  resourceType: 1,
  resourceId: 1,
});
GrantSchema.index({ tenantId: 1, resourceType: 1, resourceId: 1 });
GrantSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true });

// prevent duplicate active grants
GrantSchema.index(
  {
    tenantId: 1,
    subjectId: 1,
    subjectType: 1,
    resourceType: 1,
    resourceId: 1,
    roleKey: 1,
  },
  { unique: true, partialFilterExpression: { expiresAt: null } },
);

/* ------------------------------------------------------------------ */
export const ResourceSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: null, index: true },
    resourceType: { type: String, required: true, index: true },
    resourceId: { type: String, required: true, index: true },
    ownerId: { type: String, default: null, index: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  base,
);
ResourceSchema.index(
  { tenantId: 1, resourceType: 1, resourceId: 1 },
  { unique: true },
);
ResourceSchema.index({ tenantId: 1, ownerId: 1 });

/* ------------------------------------------------------------------ */
export const AuditSchema = new mongoose.Schema(
  {
    tenantId: { type: String, default: null, index: true },
    actorId: { type: String, default: null },
    subjectId: { type: String, default: null, index: true },
    action: { type: String, required: true, index: true },
    resourceType: { type: String, default: null },
    resourceId: { type: String, default: null },
    roleKey: { type: String, default: null },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false },
);
AuditSchema.index({ tenantId: 1, timestamp: -1 });
AuditSchema.index({ tenantId: 1, subjectId: 1, timestamp: -1 });
AuditSchema.index({
  tenantId: 1,
  resourceType: 1,
  resourceId: 1,
  timestamp: -1,
});

/* ------------------------------------------------------------------ */
export function registerModels(connection = mongoose, prefix = "ac_") {
  return {
    Permission:
      connection.models[`${prefix}Permission`] ||
      connection.model(`${prefix}Permission`, PermissionSchema),
    Role:
      connection.models[`${prefix}Role`] ||
      connection.model(`${prefix}Role`, RoleSchema),
    Grant:
      connection.models[`${prefix}Grant`] ||
      connection.model(`${prefix}Grant`, GrantSchema),
    Resource:
      connection.models[`${prefix}Resource`] ||
      connection.model(`${prefix}Resource`, ResourceSchema),
    Audit:
      connection.models[`${prefix}Audit`] ||
      connection.model(`${prefix}Audit`, AuditSchema),
  };
}
