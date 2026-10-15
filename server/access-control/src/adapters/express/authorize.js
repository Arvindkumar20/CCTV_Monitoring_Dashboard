import { ForbiddenError } from "../../errors.js";

/**
 * authorize({
 *   resourceType,
 *   permission,
 *   getSubjectId,
 *   getSubjectType?,   // default: "user"
 *   getResourceId,
 *   getTenantId?,      // default: null
 *   onDeny?,           // custom handler
 *   engine,            // access control engine instance
 * })
 */
export function authorize({
  resourceType,
  permission,
  getSubjectId = (req) => req.user?.userId?.toString() || req.user?.id?.toString(),
  getSubjectType = (req) => req.user?.type || "user",
  getResourceId = (req) => req.params.resourceId || req.params.id,
  getTenantId = () => null,
  onDeny,
  engine,
}) {
  if (!engine) throw new Error("authorize() requires an engine instance");

  return async (req, res, next) => {
    try {
      const subjectId = getSubjectId(req);
      if (!subjectId) return next(new ForbiddenError("Not authenticated"));

      const resourceId = getResourceId(req);
      if (!resourceId) return next(new ForbiddenError("Resource id missing"));

      const result = await engine.can({
        subjectId,
        subjectType: getSubjectType(req),
        resourceType,
        resourceId: String(resourceId),
        permission,
        tenantId: getTenantId(req),
      });

      req.accessControl = result;

      if (!result.allowed) {
        if (typeof onDeny === "function") return onDeny(req, res, result);
        return next(new ForbiddenError("Forbidden", { reason: result.reason }));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}