// backend/services/alertRetry.worker.js

import { AlertLog } from "../../models/AlertLog.js";
import { alertService } from "./alert.service.js";


const MAX_RETRIES = 3;
const INTERVAL_MS = 2 * 60 * 1000;   // har 2 min
const LOOKBACK_MS = 24 * 3600 * 1000; // pichhle 24 ghante

export function startAlertRetryWorker() {
  setInterval(async () => {
    try {
      const since = new Date(Date.now() - LOOKBACK_MS);
      const candidates = await AlertLog.find({
        timestamp: { $gte: since },
        overallStatus: { $in: ["failed", "partial"] },
        retryCount: { $lt: MAX_RETRIES },
        acknowledged: false,
      }).limit(20);

      for (const log of candidates) {
        console.log(`🔁 Retrying ${log._id} (attempt ${log.retryCount + 1})`);
        try {
          await alertService.retryFailedChannels(log._id);
        } catch (e) {
          console.error(`Retry failed for ${log._id}:`, e.message);
        }
      }
    } catch (e) {
      console.error("Retry worker error:", e.message);
    }
  }, INTERVAL_MS);

  console.log("♻️  Alert retry worker started");
}