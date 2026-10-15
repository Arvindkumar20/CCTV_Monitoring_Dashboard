// backend/services/stream-scheduler.service.js

import { EventEmitter } from "events";

/**
 * StreamScheduler - In-memory job scheduler
 * No external dependencies - uses Node.js timers
 */
export class StreamScheduler extends EventEmitter {
  constructor(streamManager, options = {}) {
    super();

    this.streamManager = streamManager;
    this.retryJobs = new Map(); // cameraId -> { retryCount, nextRetry, timer }
    this.scheduledJobs = new Map(); // cameraId -> { startTimer, stopTimer }

    this.maxRetries = options.maxRetries || 3;
    this.retryDelay = options.retryDelay || 5000;
    this.healthCheckInterval = options.healthCheckInterval || 30000;

    this.setupEventListeners();
    this.startHealthCheck();
  }

  /**
   * Setup event listeners
   */
  // setupEventListeners() {
  //   this.streamManager.on("stream:error", ({ cameraId, error }) => {
  //     this.scheduleRetry(cameraId, error);
  //   });

  //   this.streamManager.on("stream:died", ({ cameraId }) => {
  //     this.scheduleRetry(cameraId, "Stream died");
  //   });

  //   this.streamManager.on("stream:stale", ({ cameraId }) => {
  //     this.handleStaleStream(cameraId);
  //   });
  // }





  setupEventListeners() {
  this.streamManager.on("stream:error", ({ cameraId, error }) => {
    this.scheduleRetry(cameraId, error);
  });

  // ✅ Ye already hai, lekin confirm karo ke stream-manager emit karta hai
  this.streamManager.on("stream:died", ({ cameraId, reason }) => {
    this.scheduleRetry(cameraId, `Stream died: ${reason}`);
  });
}




  /**
// backend/services/stream-scheduler.service.js

/**
 * ✅ FIXED: Schedule retry with better state tracking
 */
scheduleRetry(cameraId, error) {
  // ✅ If cameraId is not in active streams, don't retry (it was manually stopped)
  if (!this.streamManager.streams.has(cameraId)) {
    // Check if it was a startup failure (never started) or manual stop
    const job = this.retryJobs.get(cameraId);
    if (job && job.isManualStop) {
      console.log(`⏭️ Skipping retry for manually stopped: ${cameraId}`);
      this.retryJobs.delete(cameraId);
      return;
    }
  }

  const job = this.retryJobs.get(cameraId) || { retryCount: 0 };

  if (job.retryCount >= this.maxRetries) {
    console.error(`❌ Max retries reached for ${cameraId}`);
    this.retryJobs.delete(cameraId);
    this.emit("stream:failed", { cameraId, error, retries: job.retryCount });
    return;
  }

  // Clear existing timer
  if (job.timer) clearTimeout(job.timer);

  const retryCount = job.retryCount + 1;
  const delay = this.retryDelay * retryCount;

  const timer = setTimeout(async () => {
    // ✅ Double check: stream should exist in manager before retry
    if (!this.streamManager.streams.has(cameraId)) {
      console.log(`⏭️ Stream ${cameraId} no longer active, skipping retry`);
      this.retryJobs.delete(cameraId);
      return;
    }

    console.log(`🔄 Retry ${retryCount}/${this.maxRetries} for ${cameraId}`);
    try {
      await this.streamManager.restartStream(cameraId);
      this.retryJobs.delete(cameraId);
      console.log(`✅ Stream recovered: ${cameraId}`);
    } catch (err) {
      console.error(`Retry failed for ${cameraId}:`, err.message);
      // Only reschedule if stream still exists
      if (this.streamManager.streams.has(cameraId)) {
        this.scheduleRetry(cameraId, err.message);
      } else {
        this.retryJobs.delete(cameraId);
      }
    }
  }, delay);

  this.retryJobs.set(cameraId, {
    retryCount,
    nextRetry: Date.now() + delay,
    timer,
    lastError: error,
  });
}

/**
 * ✅ Mark stream as manually stopped to prevent retry
 */
markManualStop(cameraId) {
  const job = this.retryJobs.get(cameraId);
  if (job) {
    job.isManualStop = true;
    if (job.timer) clearTimeout(job.timer);
    this.retryJobs.delete(cameraId);
  }
}
  /**
   * Handle stale stream
   */
  async handleStaleStream(cameraId) {
    try {
      await this.streamManager.restartStream(cameraId);
    } catch (error) {
      console.error(`Failed to recover stale stream ${cameraId}:`, error.message);
    }
  }

  /**
   * Start health check loop
   */
  startHealthCheck() {
    this.healthCheckTimer = setInterval(() => {
      const metrics = this.streamManager.getMetrics();
      this.emit("health:check", {
        timestamp: new Date(),
        metrics,
        streams: this.streamManager.getAllStreams(),
      });

      // Warn on high utilization
      if (parseFloat(metrics.utilization) > 80) {
        console.warn(`⚠️ High stream utilization: ${metrics.utilization}`);
      }
    }, this.healthCheckInterval);
  }

  /**
   * Schedule a stream to start at specific time
   */
  scheduleStream(cameraId, rtspUrl, startTime, stopTime = null) {
    // Cancel existing schedule
    this.cancelSchedule(cameraId);

    const schedule = { startTimer: null, stopTimer: null };

    // Schedule start
    const startDelay = startTime.getTime() - Date.now();
    if (startDelay <= 0) {
      this.streamManager.startStream(cameraId, rtspUrl).catch(err => {
        console.error(`Failed to start scheduled stream ${cameraId}:`, err.message);
      });
    } else {
      schedule.startTimer = setTimeout(async () => {
        try {
          await this.streamManager.startStream(cameraId, rtspUrl);
          console.log(`✅ Scheduled stream started: ${cameraId}`);
        } catch (error) {
          console.error(`Failed: ${cameraId}`, error.message);
          this.scheduleRetry(cameraId, error.message);
        }
      }, startDelay);
    }

    // Schedule stop
    if (stopTime) {
      const stopDelay = stopTime.getTime() - Date.now();
      if (stopDelay > 0) {
        schedule.stopTimer = setTimeout(async () => {
          await this.streamManager.stopStream(cameraId);
          console.log(`✅ Scheduled stream stopped: ${cameraId}`);
          this.scheduledJobs.delete(cameraId);
        }, stopDelay);
      }
    }

    this.scheduledJobs.set(cameraId, schedule);
    return { success: true, cameraId };
  }

  /**
   * Cancel a schedule
   */
  cancelSchedule(cameraId) {
    const schedule = this.scheduledJobs.get(cameraId);
    if (schedule) {
      if (schedule.startTimer) clearTimeout(schedule.startTimer);
      if (schedule.stopTimer) clearTimeout(schedule.stopTimer);
      this.scheduledJobs.delete(cameraId);
    }
  }

  /**
   * Shutdown
   */
  shutdown() {
    clearInterval(this.healthCheckTimer);

    for (const [cameraId] of this.scheduledJobs) {
      this.cancelSchedule(cameraId);
    }

    for (const [cameraId, job] of this.retryJobs) {
      if (job.timer) clearTimeout(job.timer);
    }

    this.retryJobs.clear();
    this.scheduledJobs.clear();
    console.log("✅ StreamScheduler shutdown complete");
  }
}

export default StreamScheduler;