

// // backend/routes/alert.routes.js
// import { Router } from "express";
// import { AlertController } from "../controllers/alert.controller.js";


// const router = Router();

// router.get("/",               AlertController.list);
// router.get("/stats",          AlertController.stats);
// router.get("/failed",         AlertController.failed);
// router.post("/test",          AlertController.test);
// router.get("/:id",            AlertController.detail);
// router.post("/:id/retry",     AlertController.retry);
// router.post("/:id/acknowledge", AlertController.acknowledge);
// router.delete("/:id",         AlertController.remove);

// export const alertRouter= router;




import express from "express";
import {
  listAlerts,
  getAlert,
  getAlertStats,
  getFailedAlerts,
  acknowledgeAlert,
  retryAlert,
  deleteAlert,
} from "../controllers/alert.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes need authentication
router.use(authenticate);

router.get("/", listAlerts);
router.get("/stats", getAlertStats);
router.get("/failed", getFailedAlerts);
router.get("/:id", getAlert);
router.patch("/:id/acknowledge", acknowledgeAlert);
router.post("/:id/retry", retryAlert);
router.delete("/:id", deleteAlert);

export const alertRouter= router;