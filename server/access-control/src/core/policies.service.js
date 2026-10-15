import { requireString } from "../utils/validate.js";
import { ConflictError } from "../errors.js";

export function createPoliciesService() {
  const policies = new Map();

  return {
    register(name, { resourceType = "*", evaluate }) {
      requireString(name, "name");
      if (typeof evaluate !== "function") throw new ConflictError("policy.evaluate must be a function");
      policies.set(name, { name, resourceType, evaluate });
    },

    getApplicable(resourceType) {
      const out = [];
      for (const p of policies.values()) {
        if (p.resourceType === "*" || p.resourceType === resourceType) out.push(p);
      }
      return out;
    },

    remove(name) {
      policies.delete(name);
    },

    list() {
      return [...policies.values()].map((p) => ({ name: p.name, resourceType: p.resourceType }));
    },
  };
}