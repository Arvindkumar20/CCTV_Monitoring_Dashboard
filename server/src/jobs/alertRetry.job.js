// backend/jobs/alertRetry.job.js
import cron from "node-cron";
import { alertService } from "../services/detection-service/alert.service.js";
import logger from "../config/logger.js";
import { AlertLog } from "../models/AlertLog.js";
// import { AlertLog } from "../models/AlertLog.js";
// import { alertService } from "../services/alert.service.js";
// import logger from "../config/logger.js";

export const startAlertRetryJob = () => {
  // ✅ Har 10 minute mein failed alerts retry
  cron.schedule("*/10 * * * *", async () => {
    try {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const failedAlerts = await AlertLog.find({
        overallStatus: { $in: ["failed", "partial"] },
        retryCount: { $lt: 3 },
        createdAt: { $lte: fiveMinAgo },
      }).limit(20);

      if (failedAlerts.length === 0) return;

      logger.info(`🔄 Retrying ${failedAlerts.length} failed alerts...`);

      for (const alert of failedAlerts) {
        try {
          await alertService.retryFailedChannels(alert._id);
        } catch (err) {
          logger.error(`Retry failed for ${alert._id}:`, err.message);
        }
      }
    } catch (err) {
      logger.error("❌ Alert retry job failed:", err);
    }
  });

  logger.info("✅ Alert retry job scheduled (every 10 min)");
};