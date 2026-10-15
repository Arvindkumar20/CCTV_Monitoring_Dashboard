import cron from "node-cron";
import { User } from "../models/user.model.js";
import logger from "../config/logger.js";
// import { User } from "../models/user.model.js";
// import logger from "../config/logger.js";

/**
 * ✅ Cleanup expired refresh tokens from ALL users
 * Runs daily at 2:00 AM
 * IMPORTANT: Yeh sirf tokens delete karega, USER nahi!
 */
export const startTokenCleanupJob = () => {
  cron.schedule("0 2 * * *", async () => {
    try {
      logger.info("🧹 Starting refresh token cleanup...");

      const result = await User.cleanupExpiredRefreshTokens();

      logger.info(
        `✅ Token cleanup complete: ${result.modifiedCount} users cleaned`,
        {
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
        }
      );
    } catch (error) {
      logger.error("❌ Token cleanup failed:", error);
    }
  });

  logger.info("✅ Token cleanup job scheduled (daily at 2:00 AM)");
};