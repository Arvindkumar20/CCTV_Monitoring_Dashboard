export const DEFAULTS = Object.freeze({
  // fail-closed by default; host must explicitly opt into "allow_all"
  disabledBehavior: "deny_all",

  // owner of resource gets these permissions by default unless explicit deny
  ownerPolicy: {
    enabled: true,
    permissions: ["*"],
  },

  // audit
  audit: {
    enabled: true,
  },

  // cache (off by default — add when you measure a need)
  cache: {
    enabled: false,
    ttlMs: 30_000,
  },

  // tenant
  tenant: {
    enabled: false,
  },
});

export function mergeConfig(userConfig = {}) {
  return {
    ...DEFAULTS,
    ...userConfig,
    ownerPolicy: { ...DEFAULTS.ownerPolicy, ...(userConfig.ownerPolicy || {}) },
    audit: { ...DEFAULTS.audit, ...(userConfig.audit || {}) },
    cache: { ...DEFAULTS.cache, ...(userConfig.cache || {}) },
    tenant: { ...DEFAULTS.tenant, ...(userConfig.tenant || {}) },
  };
}