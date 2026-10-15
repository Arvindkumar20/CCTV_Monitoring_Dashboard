import { mergeConfig } from "../config.js";
import { createPermissionsService } from "./permissions.service.js";
import { createRolesService } from "./roles.service.js";
import { createAccessService } from "./access.service.js";
import { createResourcesService } from "./resources.service.js";
import { createPoliciesService } from "./policies.service.js";
import { createAuditService } from "./audit.service.js";
import { evaluate, resourceMatches, grantSpecificity, REASONS } from "./precedence.js";

/**
 * can() — the hot path.
 *
 * Steps:
 *  1. If engine disabled → return config.disabledBehavior.
 *  2. If permission not registered → deny (typo safety).
 *  3. Fetch applicable grants (subject, resource, wildcards).
 *  4. Sort by specificity desc.
 *  5. Evaluate in order; first decisive verdict wins.
 *  6. Deny if nothing matched.
 */
export function createEngine({ repo, config: userConfig, logger = null }) {
  const config = mergeConfig(userConfig);

  const auditService = createAuditService(repo, { enabled: config.audit.enabled, logger });
  const permissionsService = createPermissionsService(repo);
  const rolesService = createRolesService(repo, permissionsService);
  const accessService = createAccessService(repo, permissionsService, rolesService, auditService);
  const resourcesService = createResourcesService(repo);
  const policiesService = createPoliciesService();

  return {
    config,
    permissions: permissionsService,
    roles: rolesService,
    access: accessService,
    resources: resourcesService,
    policies: policiesService,
    audit: auditService,

    /**
     * can({ subjectId, subjectType, resourceType, resourceId, permission, tenantId })
     */
    async can({ subjectId, subjectType = "user", resourceType, resourceId, permission, tenantId = null }) {
      const evaluatedAt = new Date();

      // 1. engine disabled?
      if (config.enabled === false) {
        const allow = config.disabledBehavior === "allow_all";
        return {
          allowed: allow,
          reason: allow ? REASONS.ENGINE_DISABLED_ALLOW : REASONS.ENGINE_DISABLED_DENY,
          source: null,
          evaluatedAt,
        };
      }

      // 2. permission registered?
      const permExists = await permissionsService.exists({ tenantId, resourceType, key: permission });
      if (!permExists) {
        return {
          allowed: false,
          reason: REASONS.UNKNOWN_PERMISSION,
          source: null,
          evaluatedAt,
        };
      }

      // 3. load resource (for owner check)
      const resource = await repo.resources.find({ tenantId, resourceType, resourceId });

      // 4. fetch grants
      const grants = await accessService.findApplicable({
        tenantId, subjectId, subjectType, resourceType, resourceId,
      });

      // sort most specific first
      grants.sort((a, b) => grantSpecificity(b) - grantSpecificity(a));

      // 5. policies
      const policies = policiesService.getApplicable(resourceType);

      // 6. evaluate grants in order
      for (const grant of grants) {
        if (!resourceMatches(grant, { resourceType, resourceId })) continue;

        let rolePermissions = [];
        if (grant.roleKey) {
          rolePermissions = await rolesService.getPermissionsForRole({
            key: grant.roleKey, resourceType, tenantId,
          });
        }

        const verdict = evaluate({
          grant,
          rolePermissions,
          permission,
          resource,
          subjectId,
          policies,
        });

        if (verdict.allowed) {
          return { ...verdict, evaluatedAt };
        }

        // if explicit deny, stop immediately — deny wins
        if (verdict.reason === REASONS.DENIED_BY_EXPLICIT_DENY) {
          return { ...verdict, evaluatedAt };
        }
      }

      // 7. no grants matched — try policies standalone
      if (!grants.length && policies.length) {
        for (const policy of policies) {
          const result = policy.evaluate({ subjectId, resource, permission });
          if (result === "allow") {
            return { allowed: true, reason: REASONS.ALLOWED_BY_POLICY, source: { type: "policy", name: policy.name }, evaluatedAt };
          }
          if (result === "deny") {
            return { allowed: false, reason: REASONS.DENIED_BY_POLICY, source: { type: "policy", name: policy.name }, evaluatedAt };
          }
        }
      }

      return { allowed: false, reason: REASONS.NO_MATCHING_GRANT, source: null, evaluatedAt };
    },

    async canAny({ subjectId, subjectType, resourceType, resourceId, permissions, tenantId }) {
      for (const permission of permissions) {
        const r = await this.can({ subjectId, subjectType, resourceType, resourceId, permission, tenantId });
        if (r.allowed) return r;
      }
      return { allowed: false, reason: REASONS.NO_MATCHING_GRANT, source: null, evaluatedAt: new Date() };
    },

    async canAll({ subjectId, subjectType, resourceType, resourceId, permissions, tenantId }) {
      const results = [];
      for (const permission of permissions) {
        const r = await this.can({ subjectId, subjectType, resourceType, resourceId, permission, tenantId });
        if (!r.allowed) return r;
        results.push(r);
      }
      return { allowed: true, reason: REASONS.ALLOWED_BY_DIRECT_PERMISSION, source: null, evaluatedAt: new Date() };
    },
  };
}

export { REASONS };