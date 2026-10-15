import express from "express";

/**
 * Mounts admin routes for managing permissions/roles/grants.
 * Host app decides how to guard this router (e.g., restrictTo("admin")).
 */
export function createAdminRouter({ engine }) {
  const router = express.Router();

  // permissions
  router.post("/permissions", async (req, res, next) => {
    try { res.json(await engine.permissions.register(req.body)); } catch (e) { next(e); }
  });
  router.post("/permissions/bulk", async (req, res, next) => {
    try { res.json(await engine.permissions.registerMany(req.body.items)); } catch (e) { next(e); }
  });
  router.get("/permissions", async (req, res, next) => {
    try { res.json(await engine.permissions.list(req.query)); } catch (e) { next(e); }
  });

  // roles
  router.post("/roles", async (req, res, next) => {
    try { res.json(await engine.roles.create(req.body)); } catch (e) { next(e); }
  });
  router.get("/roles", async (req, res, next) => {
    try { res.json(await engine.roles.list(req.query)); } catch (e) { next(e); }
  });
  router.patch("/roles/:key", async (req, res, next) => {
    try {
      const { scope, resourceType, tenantId } = req.query;
      res.json(await engine.roles.update({
        key: req.params.key, scope, resourceType, tenantId, patch: req.body,
      }));
    } catch (e) { next(e); }
  });
  router.delete("/roles/:key", async (req, res, next) => {
    try {
      const { scope, resourceType, tenantId } = req.query;
      res.json(await engine.roles.remove({
        key: req.params.key, scope, resourceType, tenantId,
      }));
    } catch (e) { next(e); }
  });

  // grants
  router.post("/grants", async (req, res, next) => {
    try { res.json(await engine.access.grant(req.body)); } catch (e) { next(e); }
  });
  router.get("/grants", async (req, res, next) => {
    try { res.json(await engine.access.list(req.query)); } catch (e) { next(e); }
  });
  router.get("/grants/:grantId", async (req, res, next) => {
    try { res.json(await engine.access.get({ grantId: req.params.grantId, tenantId: req.query.tenantId })); } catch (e) { next(e); }
  });
  router.patch("/grants/:grantId", async (req, res, next) => {
    try { res.json(await engine.access.update({ grantId: req.params.grantId, patch: req.body, actorId: req.body.actorId, tenantId: req.query.tenantId })); } catch (e) { next(e); }
  });
  router.delete("/grants/:grantId", async (req, res, next) => {
    try { res.json(await engine.access.revoke({ grantId: req.params.grantId, actorId: req.query.actorId, tenantId: req.query.tenantId })); } catch (e) { next(e); }
  });

  // audit
  router.get("/audit", async (req, res, next) => {
    try { res.json(await engine.audit.list(req.query)); } catch (e) { next(e); }
  });

  // check (debug)
  router.post("/can", async (req, res, next) => {
    try { res.json(await engine.can(req.body)); } catch (e) { next(e); }
  });

  return router;
}