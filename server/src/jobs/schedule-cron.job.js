// jobs/schedule-cron.job.js
import cron from "node-cron";
import { detectionManager } from "../services/detection-manager.service.js";
import logger from "../config/logger.js";

/**
 * ✅ Runs every minute - forces all workers to re-evaluate schedule
 * This is a safety net (workers already have their own interval)
 * But useful for: timezone changes, DST, missed ticks after sleep
 */
export function startScheduleCron() {
  cron.schedule("* * * * *", async () => {
    try {
      const statuses = detectionManager.getStatus();
      const scheduled = statuses.filter((s) => s.scheduleEnabled);

      if (scheduled.length === 0) return;

      logger.debug(`⏰ Re-evaluating ${scheduled.length} scheduled cameras`);

      // Force recompute (worker internally checks if changed)
      for (const cam of scheduled) {
        const worker = detectionManager.workers.get(cam.cameraId);
        if (worker) worker._recomputeRules();
      }
    } catch (err) {
      logger.error("❌ Schedule cron error:", err);
    }
  });

  logger.info("✅ Schedule cron started (every minute)");
}