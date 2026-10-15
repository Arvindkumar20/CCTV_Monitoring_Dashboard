/**
 * Reason codes returned by can()
 */
export const REASONS = Object.freeze({
  ENGINE_DISABLED_ALLOW: "ENGINE_DISABLED_ALLOW",
  ENGINE_DISABLED_DENY: "ENGINE_DISABLED_DENY",
  UNKNOWN_PERMISSION: "UNKNOWN_PERMISSION",
  DENIED_BY_EXPLICIT_DENY: "DENIED_BY_EXPLICIT_DENY",
  ALLOWED_BY_OWNER: "ALLOWED_BY_OWNER",
  ALLOWED_BY_DIRECT_PERMISSION: "ALLOWED_BY_DIRECT_PERMISSION",
  ALLOWED_BY_ROLE: "ALLOWED_BY_ROLE",
  ALLOWED_BY_POLICY: "ALLOWED_BY_POLICY",
  DENIED_BY_POLICY: "DENIED_BY_POLICY",
  NO_MATCHING_GRANT: "NO_MATCHING_GRANT",
});

/**
 * Match a permission string against a grant's permission list.
 * Supports exact match and "*" wildcard.
 */
export function permissionMatches(requested, granted) {
  if (granted === "*") return true;
  if (granted === requested) return true;
  return false;
}

/**
 * Match a resource against a grant's resource scope.
 * "resourceId" can be exact, or "*" for all.
 */
export function resourceMatches(grant, { resourceType, resourceId }) {
  const typeOk = grant.resourceType === "*" || grant.resourceType === resourceType;
  if (!typeOk) return false;
  const idOk = grant.resourceId === "*" || grant.resourceId === resourceId;
  return idOk;
}

/**
 * Specificity score: higher = more specific.
 * Used to break ties so specific grants win over wildcards.
 */
export function grantSpecificity(grant) {
  let score = 0;
  if (grant.resourceType !== "*") score += 10;
  if (grant.resourceId !== "*") score += 5;
  if (grant.roleKey) score += 1;
  return score;
}

/**
 * Pure evaluation function.
 * Inputs are fully resolved; no DB calls here.
 */
export function evaluate({ grant, rolePermissions, permission, resource, subjectId, policies }) {
  // 1. explicit deny anywhere on the grant
  const denyHit = (grant.permissions || []).find(
    (p) => p.effect === "deny" && permissionMatches(permission, p.key)
  );
  if (denyHit) {
    return { allowed: false, reason: REASONS.DENIED_BY_EXPLICIT_DENY, source: { type: "grant", grantId: grant._id } };
  }

  // 2. owner policy
  if (resource && resource.ownerId && String(resource.ownerId) === String(subjectId)) {
    return {
      allowed: true,
      reason: REASONS.ALLOWED_BY_OWNER,
      source: { type: "owner", ownerId: resource.ownerId },
    };
  }

  // 3. direct permission on grant (effect allow)
  const directHit = (grant.permissions || []).find(
    (p) => p.effect === "allow" && permissionMatches(permission, p.key)
  );
  if (directHit) {
    return {
      allowed: true,
      reason: REASONS.ALLOWED_BY_DIRECT_PERMISSION,
      source: { type: "grant", grantId: grant._id, permission: directHit.key },
    };
  }

  // 4. role permissions
  if (grant.roleKey && rolePermissions && rolePermissions.length) {
    const roleHit = rolePermissions.find(
      (p) =>
        p.resourceType === grant.resourceType || p.resourceType === "*" || grant.resourceType === "*"
    );
    if (roleHit) {
      const matched = rolePermissions.find((p) => permissionMatches(permission, p.key));
      if (matched) {
        return {
          allowed: true,
          reason: REASONS.ALLOWED_BY_ROLE,
          source: { type: "role", roleKey: grant.roleKey, permission: matched.key },
        };
      }
    }
  }

  // 5. policies
  if (policies && policies.length) {
    for (const policy of policies) {
      const result = policy.evaluate({ subjectId, resource, permission });
      if (result === "allow") {
        return { allowed: true, reason: REASONS.ALLOWED_BY_POLICY, source: { type: "policy", name: policy.name } };
      }
      if (result === "deny") {
        return { allowed: false, reason: REASONS.DENIED_BY_POLICY, source: { type: "policy", name: policy.name } };
      }
    }
  }

  return { allowed: false, reason: REASONS.NO_MATCHING_GRANT, source: null };
}