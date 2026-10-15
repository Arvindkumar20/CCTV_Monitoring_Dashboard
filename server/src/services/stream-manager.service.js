// // backend/services/stream-manager.service.js

// import ffmpeg from "fluent-ffmpeg";
// import ffmpegStatic from "ffmpeg-static";
// import path from "path";
// import fs from "fs";
// import { EventEmitter } from "events";
// import { exec } from "child_process";
// import { promisify } from "util";
// const execAsync = promisify(exec);
// /**
//  * StreamManager - In-memory FFmpeg process manager
//  * Handles ALL types of RTSP cameras including corrupt-timestamp ones
//  */
// export class StreamManager extends EventEmitter {
//   constructor(options = {}) {
//     super();

//     // Configuration
//     this.maxConcurrentStreams = options.maxConcurrentStreams || 50;
//     this.hlsBasePath =
//       options.hlsBasePath || path.join(process.cwd(), "streams");
//     this.hlsPublicPath = options.hlsPublicPath || "/streams";
//     this.segmentDuration = options.segmentDuration || 2;
//     this.maxSegments = options.maxSegments || 6;
//     this.ffmpegPath = options.ffmpegPath || ffmpegStatic;
//     this.maxRestarts = options.maxRestarts || 3;
//     this.restartDelay = options.restartDelay || 5000;

//     // State
//     this.streams = new Map();
//     this.streamQueue = [];
//     this.healthCheckInterval = null;
//     this.cleanupInterval = null;
//     this.metricsInterval = null;

//     // Metrics
//     this.metrics = {
//       activeStreams: 0,
//       totalStreamsStarted: 0,
//       totalStreamsFailed: 0,
//       totalStreamsStopped: 0,
//       totalRestarts: 0,
//       avgStartupTime: 0,
//       startupTimes: [],
//       memoryUsage: 0,
//     };

//     // Initialize
//     this.setupFFmpeg();
//     this.ensureDirectories();
//     this.startMonitoring();
//   }
//   /**
//    * ✅ PROBE camera to get actual FPS, resolution, codec
//    */
//   async probeCamera(rtspUrl) {
//     try {
//       const ffmpegBin = this.ffmpegPath;
//       const cmd = `"${ffmpegBin}" -rtsp_transport tcp -timeout 8000000 -i "${rtspUrl}" -t 1 -f null - 2>&1`;

//       const { stdout, stderr } = await execAsync(cmd, {
//         timeout: 15000,
//         maxBuffer: 1024 * 1024,
//       }).catch((err) => ({
//         stdout: err.stdout || "",
//         stderr: err.stderr || "",
//       }));

//       const output = stdout + stderr;

//       // Extract FPS from line like: "Video: hevc (Main), yuv420p(tv), 704x576, 12 fps, 25 tbr, 90k tbn"
//       const fpsMatch = output.match(/,\s*([\d.]+)\s*fps/i);
//       const resMatch = output.match(/,\s*(\d+)x(\d+)[\s,]/);
//       const codecMatch = output.match(/Video:\s*(\w+)/i);

//       const result = {
//         fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
//         width: resMatch ? parseInt(resMatch[1]) : null,
//         height: resMatch ? parseInt(resMatch[2]) : null,
//         codec: codecMatch ? codecMatch[1].toLowerCase() : null,
//         raw: output.substring(0, 500), // for debugging
//       };

//       // Sanitize FPS - must be between 1 and 60
//       if (result.fps && (result.fps < 1 || result.fps > 60)) {
//         console.warn(`⚠️ Weird FPS detected: ${result.fps}, using 15`);
//         result.fps = 15;
//       }

//       return result;
//     } catch (error) {
//       console.error("Probe failed:", error.message);
//       return { fps: 15, width: null, height: null, codec: null };
//     }
//   }
//   /**
//    * Setup FFmpeg binary path
//    */
//   setupFFmpeg() {
//     if (this.ffmpegPath && fs.existsSync(this.ffmpegPath)) {
//       try {
//         fs.chmodSync(this.ffmpegPath, 0o755);
//       } catch (err) {
//         // Ignore on Windows
//       }
//       ffmpeg.setFfmpegPath(this.ffmpegPath);
//       console.log("✅ FFmpeg configured:", this.ffmpegPath);
//     } else {
//       console.warn("⚠️ FFmpeg binary not found at:", this.ffmpegPath);
//     }
//   }

//   /**
//    * Ensure HLS base directory exists
//    */
//   ensureDirectories() {
//     if (!fs.existsSync(this.hlsBasePath)) {
//       fs.mkdirSync(this.hlsBasePath, { recursive: true });
//     }
//   }

//   /**
//    * ✅ CLEAN HLS DIRECTORY - Ye method missing thi!
//    */
//   async cleanHlsDirectory(hlsDir) {
//     if (!fs.existsSync(hlsDir)) return;

//     try {
//       const files = await fs.promises.readdir(hlsDir);

//       for (const file of files) {
//         const filePath = path.join(hlsDir, file);
//         try {
//           const stat = await fs.promises.stat(filePath);
//           if (stat.isDirectory()) {
//             await fs.promises.rm(filePath, { recursive: true, force: true });
//           } else {
//             await fs.promises.unlink(filePath);
//           }
//         } catch (err) {
//           // Ignore individual file errors
//         }
//       }

//       console.log(`🧹 Cleaned HLS dir: ${hlsDir} (${files.length} files)`);
//     } catch (error) {
//       console.error(`Cleanup error for ${hlsDir}:`, error.message);
//     }
//   }

//   /**
//    * Start monitoring
//    */
//   startMonitoring() {
//     this.healthCheckInterval = setInterval(() => {
//       this.performHealthCheck();
//     }, 15000);

//     this.cleanupInterval = setInterval(() => {
//       this.cleanupOldSegments();
//     }, 30000);

//     this.metricsInterval = setInterval(() => {
//       const usage = process.memoryUsage();
//       this.metrics.memoryUsage = Math.round(usage.heapUsed / 1024 / 1024);
//       this.metrics.activeStreams = this.streams.size;
//     }, 10000);
//   }

//   /**
//    * Clean up old HLS segments
//    */
//   async cleanupOldSegments() {
//     for (const [cameraId, stream] of this.streams.entries()) {
//       if (!stream.hlsDir || !fs.existsSync(stream.hlsDir)) continue;

//       try {
//         const files = await fs.promises.readdir(stream.hlsDir);
//         const segments = files.filter((f) => f.endsWith(".ts")).sort();

//         if (segments.length > this.maxSegments) {
//           const toDelete = segments.slice(0, -this.maxSegments);
//           for (const segment of toDelete) {
//             try {
//               await fs.promises.unlink(path.join(stream.hlsDir, segment));
//             } catch (err) {
//               // Ignore
//             }
//           }
//         }
//       } catch (error) {
//         // Ignore
//       }
//     }
//   }

//   /**
//    * Process queued stream requests
//    */
//   async processQueue() {
//     while (
//       this.streamQueue.length > 0 &&
//       this.streams.size < this.maxConcurrentStreams
//     ) {
//       const request = this.streamQueue.shift();
//       try {
//         const result = await this.startStream(
//           request.cameraId,
//           request.rtspUrl,
//           request.options,
//         );
//         request.resolve(result);
//       } catch (error) {
//         request.reject(error);
//       }
//     }
//   }

//   /**
//    * Health check
//    */
//   async performHealthCheck() {
//     const now = Date.now();
//     const staleThreshold = 30000;

//     const toCleanup = [];
//     const toRestart = [];

//     for (const [cameraId, stream] of this.streams.entries()) {
//       if (stream.isStopping) continue;

//       if (stream.isStarting && now - stream.startTime < 25000) {
//         continue;
//       }

//       if (stream.process && stream.process.exitCode !== null) {
//         toCleanup.push({ cameraId, reason: "process_died" });
//         continue;
//       }

//       const uptime = now - stream.startTime;
//       if (
//         uptime > 45000 &&
//         stream.lastProgress &&
//         now - stream.lastProgress > staleThreshold
//       ) {
//         if (stream.restartCount >= this.maxRestarts) {
//           toCleanup.push({ cameraId, reason: "max_restarts_stale" });
//         } else {
//           toRestart.push(cameraId);
//         }
//       }
//     }

//     for (const { cameraId, reason } of toCleanup) {
//       const stream = this.streams.get(cameraId);
//       console.log(`💀 Cleanup: ${cameraId} (${reason})`);
//       this.cleanupStream(cameraId);

//       if (reason === "max_restarts_stale") {
//         this.emit("stream:failed", {
//           cameraId,
//           error: "Max restarts exceeded",
//           restarts: stream?.restartCount || 0,
//         });
//       } else {
//         this.emit("stream:error", { cameraId, error: "Process died" });
//       }
//     }

//     for (const cameraId of toRestart) {
//       console.log(`⚠️ Restarting stale: ${cameraId}`);
//       try {
//         await this.restartStream(cameraId);
//       } catch (error) {
//         console.error(`Restart failed: ${cameraId}`, error.message);
//       }
//     }

//     this.processQueue();
//   }

//   /**
//    * Cleanup stream resources
//    */
//   cleanupStream(cameraId) {
//     const stream = this.streams.get(cameraId);
//     if (stream) {
//       stream.isStopping = true;
//       if (stream.process) {
//         try {
//           stream.process.kill("SIGKILL");
//         } catch (e) {
//           // Already dead
//         }
//       }
//       this.streams.delete(cameraId);
//     }
//     this.metrics.activeStreams = this.streams.size;
//   }

//   /**
//    * Universal RTSP URL normalizer
//    */
//   normalizeRtspUrl(rawUrl) {
//     if (!rawUrl) return null;

//     let url = rawUrl.trim();
//     url = url.replace(/^["']|["']$/g, "");

//     if (!/^rtsps?:\/\//i.test(url)) {
//       url = "rtsp://" + url;
//     }

//     try {
//       const parsed = new URL(url);
//       if (!parsed.hostname) throw new Error("Invalid hostname");
//       if (!parsed.port) {
//         parsed.port = parsed.protocol === "rtsps:" ? "322" : "554";
//       }
//       return parsed.toString();
//     } catch (error) {
//       console.warn(`⚠️ URL parse failed, using raw: ${error.message}`);
//       return url;
//     }
//   }

//   /**
//    * Detect URL type
//    */
//   detectUrlType(url) {
//     const lowerUrl = url.toLowerCase();
//     return {
//       isRtsp: lowerUrl.startsWith("rtsp://"),
//       isRtsps: lowerUrl.startsWith("rtsps://"),
//       hasAuth: /:\/\/[^:]+:[^@]+@/.test(url),
//       hasQuery: url.includes("?"),
//     };
//   }

//   /**
//    * Mask credentials in URL for logging
//    */
//   maskUrl(url) {
//     try {
//       return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, "$1***$2");
//     } catch {
//       return url;
//     }
//   }


// // backend/services/stream-manager.service.js

// buildFFmpegOptions(urlType, options = {}) {
//   const fps = options.sourceFps || options.fps || 15;
//   const needsTimestampFix = options.needsTimestampFix !== false;

//   // ✅ Remove use_wallclock
//   const inputOptions = [
//     "-rtsp_transport", options.transport || "tcp",
//     "-rtsp_flags", "prefer_tcp",
//     "-timeout", "10000000",
//     "-buffer_size", "1024000",
//     "-max_delay", "500000",
//     "-reorder_queue_size", "1000",
//     "-re",
//     // ✅ use_wallclock removed
//     "-fflags", "+igndts+genpts+discardcorrupt",
//     "-flags", "low_delay",
//     "-strict", "experimental",
//     "-analyzeduration", "1000000",
//     "-probesize", "1000000",
//   ];

//   const outputOptions = [
//     "-map", "0:v:0",
//     "-c:v", "libx264",
//     "-preset", "ultrafast",
//     "-tune", "zerolatency",
//     "-crf", "28",
//     "-maxrate", "1500k",
//     "-bufsize", "3000k",
//     "-pix_fmt", "yuv420p",
//     "-g", String(Math.max(15, Math.round(fps * 2))),
//     "-sc_threshold", "0",
//     "-threads", "2",
//     // ✅ setpts use karo frame numbers se timestamp banane ke liye
//     "-vf", `setpts=N/${fps}/TB,scale='min(1280,iw)':-2`,
//     "-an",
//     "-fps_mode", "cfr",
//     "-r", String(fps),
//     "-hls_time", String(this.segmentDuration),
//     "-hls_list_size", String(this.maxSegments),
//     "-hls_flags", "delete_segments+append_list+omit_endlist+independent_segments",
//     "-hls_allow_cache", "0",
//     "-hls_segment_type", "mpegts",
//     "-hls_segment_filename", path.join(options.hlsDir || "", "segment_%03d.ts"),
//     "-reset_timestamps", "1",
//     "-start_number", "0",
//     "-muxdelay", "0",
//     "-muxpreload", "0",
//     "-f", "hls",
//   ];

//   return { inputOptions, outputOptions };
// }

//   // backend/services/stream-manager.service.js

//   async startStream(cameraId, rtspUrl, options = {}) {
//     // Already streaming?
//     if (this.streams.has(cameraId)) {
//       const existing = this.streams.get(cameraId);
//       return {
//         success: true,
//         hlsUrl: existing.hlsUrl,
//         cameraId,
//         message: "Stream already running",
//       };
//     }

//     // Check capacity
//     if (this.streams.size >= this.maxConcurrentStreams) {
//       return new Promise((resolve, reject) => {
//         this.streamQueue.push({ cameraId, rtspUrl, options, resolve, reject });
//         console.log(
//           `📋 Stream queued: ${cameraId} (Queue: ${this.streamQueue.length})`,
//         );
//       });
//     }

//     const startTime = Date.now();

//     // Clean HLS dir
//     const hlsDir = path.join(this.hlsBasePath, cameraId);
//     if (fs.existsSync(hlsDir)) {
//       await this.cleanHlsDirectory(hlsDir);
//     } else {
//       fs.mkdirSync(hlsDir, { recursive: true });
//     }

//     const outputPath = path.join(hlsDir, "index.m3u8");
//     const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

//     const normalizedUrl = this.normalizeRtspUrl(rtspUrl);
//     if (!normalizedUrl) {
//       throw new Error("Invalid RTSP URL");
//     }

//     // ✅ PROBE camera first to get actual FPS
//     console.log(`🔍 Probing camera: ${cameraId}`);
//     const probeResult = await this.probeCamera(normalizedUrl);
//     const sourceFps = probeResult.fps || options.fps || 15;

//     console.log(
//       `📊 Camera ${cameraId}: ${probeResult.width}x${probeResult.height} @ ${sourceFps}fps (${probeResult.codec})`,
//     );

//     console.log(`🔗 Starting stream: ${cameraId}`);
//     console.log(`   URL: ${this.maskUrl(normalizedUrl)}`);

//     // Create stream process with detected FPS
//     const streamProcess = this.createStreamProcess(
//       cameraId,
//       normalizedUrl,
//       hlsDir,
//       outputPath,
//       hlsUrl,
//       {
//         ...options,
//         hlsDir,
//         sourceFps, // ✅ Pass detected FPS
//         sourceWidth: probeResult.width,
//         sourceHeight: probeResult.height,
//         sourceCodec: probeResult.codec,
//       },
//     );

//     this.streams.set(cameraId, streamProcess);
//     this.metrics.activeStreams = this.streams.size;
//     this.metrics.totalStreamsStarted++;

//     streamProcess.start();

//     await this.waitForStreamReady(streamProcess, 15000);

//     const startupTime = Date.now() - startTime;
//     this.metrics.startupTimes.push(startupTime);
//     if (this.metrics.startupTimes.length > 100) {
//       this.metrics.startupTimes.shift();
//     }
//     this.metrics.avgStartupTime = Math.round(
//       this.metrics.startupTimes.reduce((a, b) => a + b, 0) /
//         this.metrics.startupTimes.length,
//     );

//     return {
//       success: true,
//       hlsUrl,
//       cameraId,
//       startupTime,
//       message: "Stream started successfully",
//       detected: {
//         fps: sourceFps,
//         resolution: `${probeResult.width}x${probeResult.height}`,
//         codec: probeResult.codec,
//       },
//     };
//   }

//   /**
//    * ✅ CREATE STREAM PROCESS
//    */
//   createStreamProcess(cameraId, rtspUrl, hlsDir, outputPath, hlsUrl, options) {
//     const self = this;
//     const urlType = this.detectUrlType(rtspUrl);

//     const streamProcess = {
//       cameraId,
//       rtspUrl,
//       hlsDir,
//       outputPath,
//       hlsUrl,
//       startTime: Date.now(),
//       lastProgress: Date.now(),
//       clients: 0,
//       status: "starting",
//       process: null,
//       command: null,
//       restartCount: 0,
//       frames: 0,
//       fps: 0,
//       bitrate: 0,
//       isStarting: true,
//       options,
//       sourceFps: options.sourceFps,
//       sourceWidth: options.sourceWidth,
//       sourceHeight: options.sourceHeight,
//       sourceCodec: options.sourceCodec,
//     };

//     const { inputOptions, outputOptions } = this.buildFFmpegOptions(urlType, {
//       ...options,
//       hlsDir,
//     });

//     const command = ffmpeg(rtspUrl)
//       .inputOptions(inputOptions)
//       .outputOptions(outputOptions)
//       .output(outputPath);

//     // Event: Start
//     command.on("start", (cmd) => {
//       streamProcess.status = "running";
//       streamProcess.isStarting = false;
//       streamProcess.process = command.ffmpegProc;
//       console.log(`🎥 Stream started: ${cameraId}`);
//       self.emit("stream:started", { cameraId, hlsUrl });
//     });

//     // Event: Progress
//     command.on("progress", (progress) => {
//       streamProcess.lastProgress = Date.now();
//       streamProcess.frames = progress.frames || 0;
//       streamProcess.fps = progress.currentFps || 0;
//       streamProcess.bitrate = progress.currentKbps || 0;
//       streamProcess.isStarting = false;
//     });

//     // Event: stderr - filter spam
//     command.on("stderr", (line) => {
//       const ignored = [
//         "Last message repeated",
//         "Application provided invalid",
//         "non monotonically increasing",
//         "invalid dropping",
//         "DTS discontinuity",
//         "Packet corrupt",
//         "deprecated pixel format",
//         "Timestamps are unset",
//         "Estimating duration",
//         "Header missing",
//         "PES packet size mismatch",
//         "max delay reached",
//         "real-time buffer",
//         "Circular buffer",
//         "vsync is deprecated",
//         "fps_mode",
//       ];

//       if (ignored.some((p) => line.includes(p))) return;

//       if (
//         /error|invalid|failed|refused|timed out|unable|cannot/i.test(line) &&
//         !line.includes("Invalid data found")
//       ) {
//         console.error(`FFmpeg [${cameraId}]:`, line.substring(0, 200));
//       }
//     });

//     // Event: Error
//     command.on("error", (err) => {
//       if (streamProcess.isStopping) return;
//       console.error(`❌ Stream error [${cameraId}]:`, err.message);
//       streamProcess.status = "error";
//       streamProcess.lastError = err.message;
//       self.metrics.totalStreamsFailed++;
//       self.emit("stream:error", { cameraId, error: err.message });
//     });

//     // Event: End
//     command.on("end", () => {
//       if (streamProcess.isStopping) {
//         console.log(`⏹️ Stream stopped: ${cameraId}`);
//       } else {
//         console.log(`⏹️ Stream ended unexpectedly: ${cameraId}`);
//       }
//       streamProcess.status = "ended";
//       self.emit("stream:ended", { cameraId });
//     });

//     streamProcess.command = command;
//     streamProcess.start = () => command.run();
//     streamProcess.stop = () => self.stopStream(cameraId);

//     return streamProcess;
//   }

//   /**
//    * Wait for stream to be ready
//    */
//   async waitForStreamReady(streamProcess, timeout = 15000) {
//     const startTime = Date.now();
//     const m3u8Path = path.join(streamProcess.hlsDir, "index.m3u8");

//     while (Date.now() - startTime < timeout) {
//       if (fs.existsSync(m3u8Path)) {
//         const stats = fs.statSync(m3u8Path);
//         if (stats.size > 0) {
//           const files = fs.readdirSync(streamProcess.hlsDir);
//           const segments = files.filter((f) => f.endsWith(".ts"));
//           if (segments.length > 0) {
//             return true;
//           }
//         }
//       }
//       await new Promise((resolve) => setTimeout(resolve, 500));
//     }

//     return false;
//   }

//   /**
//    * Stop stream
//    */
//   async stopStream(cameraId, intentional = false) {
//     const stream = this.streams.get(cameraId);
//     if (!stream) {
//       return { success: true, message: "Stream not found" };
//     }

//     stream.isStopping = true;

//     try {
//       if (stream.command) {
//         stream.command.kill("SIGTERM");

//         setTimeout(() => {
//           try {
//             if (stream.process && stream.process.exitCode === null) {
//               stream.command.kill("SIGKILL");
//             }
//           } catch (e) {
//             // Already dead
//           }
//         }, 3000);
//       }

//       this.streams.delete(cameraId);
//       this.metrics.activeStreams = this.streams.size;

//       if (!intentional) {
//         this.metrics.totalStreamsStopped++;
//         this.emit("stream:stopped", { cameraId });
//       }

//       return { success: true, message: "Stream stopped" };
//     } catch (error) {
//       console.error(`Error stopping stream ${cameraId}:`, error);
//       return { success: false, error: error.message };
//     }
//   }

//  async restartStream(cameraId) {
//   const stream = this.streams.get(cameraId);
//   const currentRestartCount = stream ? stream.restartCount || 0 : 0;
//   const newRestartCount = currentRestartCount + 1;

//   if (newRestartCount > this.maxRestarts) {
//     console.error(`❌ Max restarts exceeded for ${cameraId}`);
//     this.cleanupStream(cameraId);
//     this.emit("stream:failed", {
//       cameraId,
//       error: "Max restarts exceeded",
//       restarts: currentRestartCount,
//     });
//     return { success: false, error: "Max restarts exceeded" };
//   }

//   console.log(`🔄 Restarting (${newRestartCount}/${this.maxRestarts}): ${cameraId}`);

//   const rtspUrl = stream?.rtspUrl;
//   // ✅ Preserve ALL options including probed FPS
//   const options = stream?.options || {};

//   if (!rtspUrl) {
//     throw new Error("Cannot restart: no RTSP URL");
//   }

//   await this.stopStream(cameraId, true);
//   await new Promise((resolve) => setTimeout(resolve, this.restartDelay));

//   const result = await this.startStream(cameraId, rtspUrl, options);

//   const newStream = this.streams.get(cameraId);
//   if (newStream) {
//     newStream.restartCount = newRestartCount;
//   }

//   this.metrics.totalRestarts++;
//   return result;
// }

//   /**
//    * Get stream info
//    */
//   getStreamInfo(cameraId) {
//     const stream = this.streams.get(cameraId);
//     if (!stream) return null;

//     return {
//       cameraId,
//       hlsUrl: stream.hlsUrl,
//       status: stream.status,
//       startTime: stream.startTime,
//       lastProgress: stream.lastProgress,
//       clients: stream.clients,
//       frames: stream.frames,
//       fps: stream.fps,
//       bitrate: stream.bitrate,
//       restartCount: stream.restartCount,
//     };
//   }

//   /**
//    * Get all streams
//    */
//   getAllStreams() {
//     return Array.from(this.streams.keys()).map((id) => this.getStreamInfo(id));
//   }

//   /**
//    * Get metrics
//    */
//   getMetrics() {
//     return {
//       ...this.metrics,
//       queueSize: this.streamQueue.length,
//       maxConcurrent: this.maxConcurrentStreams,
//       utilization:
//         ((this.streams.size / this.maxConcurrentStreams) * 100).toFixed(1) +
//         "%",
//     };
//   }

//   /**
//    * Shutdown
//    */
//   async shutdown() {
//     console.log("🛑 Shutting down StreamManager...");

//     clearInterval(this.healthCheckInterval);
//     clearInterval(this.cleanupInterval);
//     clearInterval(this.metricsInterval);

//     const cameraIds = Array.from(this.streams.keys());
//     await Promise.allSettled(cameraIds.map((id) => this.stopStream(id, true)));

//     console.log("✅ StreamManager shutdown complete");
//   }
// }

// export default StreamManager;






// backend/services/stream-manager.service.js

import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import path from "path";
import fs from "fs";
import { EventEmitter } from "events";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * StreamManager - In-memory FFmpeg process manager
 * Optimized for auto-start, immediate HLS URL, and high concurrency
 */
export class StreamManager extends EventEmitter {
  constructor(options = {}) {
    super();

    // ============ CONFIGURATION ============
    // this.maxConcurrentStreams = options.maxConcurrentStreams || 50;
    // this.hlsBasePath = options.hlsBasePath || path.join(process.cwd(), "streams");
    // this.hlsPublicPath = options.hlsPublicPath || "/streams";
    // this.segmentDuration = options.segmentDuration || 2;
    // this.maxSegments = options.maxSegments || 6;
    // this.ffmpegPath = options.ffmpegPath || ffmpegStatic;
    // this.maxRestarts = options.maxRestarts || 3;
    // this.restartDelay = options.restartDelay || 5000;


    // super();

  this.maxConcurrentStreams = options.maxConcurrentStreams || 50;
  this.hlsBasePath = options.hlsBasePath || path.join(process.cwd(), "streams");
  this.hlsPublicPath = options.hlsPublicPath || "/streams";
  
  // ✅ LOW LATENCY DEFAULTS
  this.segmentDuration = options.segmentDuration || 1;   // 2 → 1
  this.maxSegments = options.maxSegments || 3;            // 6 → 3
  
  this.ffmpegPath = options.ffmpegPath || ffmpegStatic;
  this.maxRestarts = options.maxRestarts || 3;
  this.restartDelay = options.restartDelay || 5000;

    // ============ IN-MEMORY STATE ============
    this.streams = new Map();              // cameraId -> StreamProcess (running)
    this.streamQueue = [];                 // Pending stream requests
    this.startingStreams = new Map();      // cameraId -> Promise (in-flight starts) ✅
    this.failedStreams = new Map();        // cameraId -> { error, failCount, lastFailTime } ✅
    this.streamCache = new Map();          // ✅ Cache of hlsUrl per camera (instant return)

    // Intervals
    this.healthCheckInterval = null;
    this.cleanupInterval = null;
    this.metricsInterval = null;

    // Metrics
    this.metrics = {
      activeStreams: 0,
      queuedStreams: 0,
      startingStreams: 0,
      totalStreamsStarted: 0,
      totalStreamsFailed: 0,
      totalStreamsStopped: 0,
      totalRestarts: 0,
      avgStartupTime: 0,
      startupTimes: [],
      memoryUsage: 0,
    };

    // Initialize
    this.setupFFmpeg();
    this.ensureDirectories();
    this.startMonitoring();

    console.log("✅ StreamManager initialized");
  }

  /**
   * Setup FFmpeg binary path
   */
  setupFFmpeg() {
    if (this.ffmpegPath && fs.existsSync(this.ffmpegPath)) {
      try {
        fs.chmodSync(this.ffmpegPath, 0o755);
      } catch (err) {
        // Ignore on Windows
      }
      ffmpeg.setFfmpegPath(this.ffmpegPath);
      console.log("✅ FFmpeg configured:", this.ffmpegPath);
    } else {
      console.warn("⚠️ FFmpeg binary not found at:", this.ffmpegPath);
    }
  }

  /**
   * Ensure HLS base directory exists
   */
  ensureDirectories() {
    if (!fs.existsSync(this.hlsBasePath)) {
      fs.mkdirSync(this.hlsBasePath, { recursive: true });
    }
  }

  // ============================================
  // ✅ PUBLIC API - FAST, NON-BLOCKING
  // ============================================

  /**
   * ✅ Get HLS URL instantly (even if stream not started yet)
   * Returns valid URL so frontend can immediately try playing
   */
  getHlsUrl(cameraId) {
    // 1. If streaming, return active URL
    const stream = this.streams.get(cameraId);
    if (stream) {
      return stream.hlsUrl;
    }

    // 2. If cached (recently started), return cached
    const cached = this.streamCache.get(cameraId);
    if (cached) {
      return cached;
    }

    // 3. Build default URL (predictable path)
    const defaultUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;
    this.streamCache.set(cameraId, defaultUrl);
    return defaultUrl;
  }

  /**
   * ✅ Ensure stream is running - NON-BLOCKING
   * Returns immediately with HLS URL. Starts stream in background.
   */
  // async ensureStream(cameraId, rtspUrl, options = {}) {
  //   const hlsUrl = this.getHlsUrl(cameraId);

  //   // Already running?
  //   if (this.streams.has(cameraId)) {
  //     return {
  //       success: true,
  //       hlsUrl,
  //       cameraId,
  //       isRunning: true,
  //       isStarting: false,
  //     };
  //   }

  //   // Currently starting?
  //   if (this.startingStreams.has(cameraId)) {
  //     return {
  //       success: true,
  //       hlsUrl,
  //       cameraId,
  //       isRunning: false,
  //       isStarting: true,
  //     };
  //   }

  //   // Recently failed? Don't spam
  //   const failed = this.failedStreams.get(cameraId);
  //   if (failed) {
  //     const timeSinceFail = Date.now() - failed.lastFailTime;
  //     // Wait at least 30 sec before retrying failed stream
  //     if (timeSinceFail < 30000 && failed.failCount >= 3) {
  //       return {
  //         success: false,
  //         hlsUrl,
  //         cameraId,
  //         error: failed.error,
  //         isFailed: true,
  //       };
  //     }
  //   }

  //   // ✅ Start stream in background (fire and forget)
  //   setImmediate(() => {
  //     this._startStreamBackground(cameraId, rtspUrl, options);
  //   });

  //   return {
  //     success: true,
  //     hlsUrl,
  //     cameraId,
  //     isRunning: false,
  //     isStarting: true, // ✅ Frontend will retry until it plays
  //   };
  // }



  async ensureStream(cameraId, rtspUrl, options = {}) {
  const hlsUrl = this.getHlsUrl(cameraId);

  // Already running?
  if (this.streams.has(cameraId)) {
    return { success: true, hlsUrl, cameraId, isRunning: true, isStarting: false };
  }

  // Currently starting?
  if (this.startingStreams.has(cameraId)) {
    return { success: true, hlsUrl, cameraId, isRunning: false, isStarting: true };
  }

  // Recently failed? Don't spam
  const failed = this.failedStreams.get(cameraId);
  if (failed) {
    const timeSinceFail = Date.now() - failed.lastFailTime;
    if (timeSinceFail < 30000 && failed.failCount >= 3) {
      return {
        success: false,
        hlsUrl,
        cameraId,
        error: failed.error,
        isFailed: true,
      };
    }
  }

  // ✅ Fire-and-forget start (returns immediately)
  setImmediate(() => {
    this._startStreamBackground(cameraId, rtspUrl, options);
  });

  return {
    success: true,
    hlsUrl,
    cameraId,
    isRunning: false,
    isStarting: true,
  };
}

  /**
   * ✅ Internal: start stream in background with proper tracking
   */
  async _startStreamBackground(cameraId, rtspUrl, options = {}) {
    // Prevent duplicate starts
    if (this.startingStreams.has(cameraId)) {
      return this.startingStreams.get(cameraId);
    }

    const startPromise = (async () => {
      try {
        await this.startStream(cameraId, rtspUrl, options);
        this.failedStreams.delete(cameraId);
        return { success: true };
      } catch (error) {
        console.error(`❌ Background start failed [${cameraId}]:`, error.message);

        // Track failure
        const existing = this.failedStreams.get(cameraId) || { failCount: 0 };
        this.failedStreams.set(cameraId, {
          error: error.message,
          failCount: existing.failCount + 1,
          lastFailTime: Date.now(),
        });

        return { success: false, error: error.message };
      } finally {
        this.startingStreams.delete(cameraId);
        this.metrics.startingStreams = this.startingStreams.size;
      }
    })();

    this.startingStreams.set(cameraId, startPromise);
    this.metrics.startingStreams = this.startingStreams.size;

    return startPromise;
  }

  /**
   * ✅ Batch ensure - start multiple streams efficiently
   */
  async ensureStreamsBatch(cameras, options = {}) {
    const results = [];
    const toStart = [];

    for (const camera of cameras) {
      const hlsUrl = this.getHlsUrl(camera._id.toString());
      
      if (this.streams.has(camera._id.toString())) {
        results.push({ cameraId: camera._id.toString(), hlsUrl, isRunning: true });
        continue;
      }

      if (this.startingStreams.has(camera._id.toString())) {
        results.push({ cameraId: camera._id.toString(), hlsUrl, isStarting: true });
        continue;
      }

      results.push({ cameraId: camera._id.toString(), hlsUrl, isStarting: true });
      toStart.push(camera);
    }

    // ✅ Start in batches, non-blocking
    if (toStart.length > 0) {
      setImmediate(async () => {
        const BATCH_SIZE = 5;
        for (let i = 0; i < toStart.length; i += BATCH_SIZE) {
          const batch = toStart.slice(i, i + BATCH_SIZE);
          await Promise.allSettled(
            batch.map(camera =>
              this._startStreamBackground(
                camera._id.toString(),
                camera.rtspUrl,
                {
                  ...options,
                  fps: camera.streamSettings?.fps,
                  needsTimestampFix: camera.streamSettings?.needsTimestampFix,
                  transport: camera.streamSettings?.transport,
                }
              )
            )
          );
          // Small delay between batches
          if (i + BATCH_SIZE < toStart.length) {
            await new Promise(r => setTimeout(r, 1000));
          }
        }
      });
    }

    return results;
  }

  // ============================================
  // PROBE CAMERA
  // ============================================

  async probeCamera(rtspUrl) {
    try {
      const ffmpegBin = this.ffmpegPath;
      const cmd = `"${ffmpegBin}" -rtsp_transport tcp -timeout 8000000 -i "${rtspUrl}" -t 1 -f null - 2>&1`;

      const { stdout, stderr } = await execAsync(cmd, {
        timeout: 15000,
        maxBuffer: 1024 * 1024,
      }).catch((err) => ({
        stdout: err.stdout || "",
        stderr: err.stderr || "",
      }));

      const output = stdout + stderr;

      const fpsMatch = output.match(/,\s*([\d.]+)\s*fps/i);
      const resMatch = output.match(/,\s*(\d+)x(\d+)[\s,]/);
      const codecMatch = output.match(/Video:\s*(\w+)/i);

      const result = {
        fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
        width: resMatch ? parseInt(resMatch[1]) : null,
        height: resMatch ? parseInt(resMatch[2]) : null,
        codec: codecMatch ? codecMatch[1].toLowerCase() : null,
      };

      if (result.fps && (result.fps < 1 || result.fps > 60)) {
        console.warn(`⚠️ Weird FPS detected: ${result.fps}, using 12`);
        result.fps = 12;
      }

      return result;
    } catch (error) {
      console.error("Probe failed:", error.message);
      return { fps: 12, width: null, height: null, codec: null };
    }
  }

  // ============================================
  // CORE STREAM OPERATIONS
  // ============================================

  // async startStream(cameraId, rtspUrl, options = {}) {
  //   // Already streaming?
  //   if (this.streams.has(cameraId)) {
  //     const existing = this.streams.get(cameraId);
  //     return {
  //       success: true,
  //       hlsUrl: existing.hlsUrl,
  //       cameraId,
  //       message: "Stream already running",
  //     };
  //   }

  //   // Check capacity - queue if full
  //   if (this.streams.size >= this.maxConcurrentStreams) {
  //     return new Promise((resolve, reject) => {
  //       this.streamQueue.push({
  //         cameraId,
  //         rtspUrl,
  //         options,
  //         resolve,
  //         reject,
  //         queuedAt: Date.now(),
  //       });
  //       this.metrics.queuedStreams = this.streamQueue.length;
  //       console.log(`📋 Stream queued: ${cameraId} (Queue: ${this.streamQueue.length})`);
  //     });
  //   }

  //   const startTime = Date.now();

  //   // Clean HLS dir
  //   const hlsDir = path.join(this.hlsBasePath, cameraId);
  //   if (fs.existsSync(hlsDir)) {
  //     await this.cleanHlsDirectory(hlsDir);
  //   } else {
  //     fs.mkdirSync(hlsDir, { recursive: true });
  //   }

  //   const outputPath = path.join(hlsDir, "index.m3u8");
  //   const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;

  //   // ✅ Cache URL immediately
  //   this.streamCache.set(cameraId, hlsUrl);

  //   const normalizedUrl = this.normalizeRtspUrl(rtspUrl);
  //   if (!normalizedUrl) {
  //     throw new Error("Invalid RTSP URL");
  //   }

  //   // Probe camera
  //   let sourceFps = options.fps || options.sourceFps || 12;
  //   try {
  //     const probeResult = await this.probeCamera(normalizedUrl);
  //     sourceFps = probeResult.fps || sourceFps;
  //     console.log(
  //       `📊 Camera ${cameraId}: ${probeResult.width}x${probeResult.height} @ ${sourceFps}fps (${probeResult.codec})`
  //     );
  //     options = {
  //       ...options,
  //       sourceFps,
  //       sourceWidth: probeResult.width,
  //       sourceHeight: probeResult.height,
  //       sourceCodec: probeResult.codec,
  //     };
  //   } catch (probeError) {
  //     console.warn(`⚠️ Probe failed, using default fps ${sourceFps}`);
  //   }

  //   console.log(`🔗 Starting stream: ${cameraId}`);
  //   console.log(`   URL: ${this.maskUrl(normalizedUrl)}`);

  //   const streamProcess = this.createStreamProcess(
  //     cameraId,
  //     normalizedUrl,
  //     hlsDir,
  //     outputPath,
  //     hlsUrl,
  //     { ...options, hlsDir }
  //   );

  //   this.streams.set(cameraId, streamProcess);
  //   this.metrics.activeStreams = this.streams.size;
  //   this.metrics.totalStreamsStarted++;

  //   streamProcess.start();

  //   // Non-blocking readiness check
  //   const ready = await this.waitForStreamReady(streamProcess, 15000);
  //   if (!ready) {
  //     console.warn(`⚠️ Stream ${cameraId} slow to start, continuing anyway`);
  //   }

  //   const startupTime = Date.now() - startTime;
  //   this.metrics.startupTimes.push(startupTime);
  //   if (this.metrics.startupTimes.length > 100) {
  //     this.metrics.startupTimes.shift();
  //   }
  //   this.metrics.avgStartupTime = Math.round(
  //     this.metrics.startupTimes.reduce((a, b) => a + b, 0) /
  //       this.metrics.startupTimes.length
  //   );

  //   return {
  //     success: true,
  //     hlsUrl,
  //     cameraId,
  //     startupTime,
  //     message: "Stream started successfully",
  //     detected: {
  //       fps: sourceFps,
  //       resolution: options.sourceWidth && options.sourceHeight
  //         ? `${options.sourceWidth}x${options.sourceHeight}`
  //         : null,
  //       codec: options.sourceCodec,
  //     },
  //   };
  // }


  async startStream(cameraId, rtspUrl, options = {}) {
  // ✅ ATOMIC LOCK: pehle hi check karo, koi await se pehle
  if (this.streams.has(cameraId)) {
    const existing = this.streams.get(cameraId);
    return {
      success: true,
      hlsUrl: existing.hlsUrl,
      cameraId,
      message: "Stream already running",
      isRunning: true,
    };
  }

  // ✅ AGAR koi already start kar raha hai, uska promise return karo
  if (this.startingStreams.has(cameraId)) {
    const hlsUrl = this.getHlsUrl(cameraId);
    return {
      success: true,
      hlsUrl,
      cameraId,
      message: "Stream is starting",
      isStarting: true,
    };
  }

  // ✅ LOCK lagao — ab koi dusra request yeh kaam nahi karega
  const lockPromise = this._doStartStream(cameraId, rtspUrl, options);
  this.startingStreams.set(cameraId, lockPromise);
  this.metrics.startingStreams = this.startingStreams.size;

  try {
    const result = await lockPromise;
    return result;
  } finally {
    this.startingStreams.delete(cameraId);
    this.metrics.startingStreams = this.startingStreams.size;
  }
}

/**
 * ✅ Actual start logic — sirf lock ke andar chalta hai
 */
async _doStartStream(cameraId, rtspUrl, options = {}) {
  // Re-check: lock lene ke baad dobara (double-check pattern)
  if (this.streams.has(cameraId)) {
    return {
      success: true,
      hlsUrl: this.streams.get(cameraId).hlsUrl,
      cameraId,
      message: "Stream already running",
    };
  }

  // Capacity check
  if (this.streams.size >= this.maxConcurrentStreams) {
    return new Promise((resolve, reject) => {
      this.streamQueue.push({
        cameraId, rtspUrl, options, resolve, reject,
        queuedAt: Date.now(),
      });
      this.metrics.queuedStreams = this.streamQueue.length;
    });
  }

  const startTime = Date.now();
  const hlsDir = path.join(this.hlsBasePath, cameraId);

  if (fs.existsSync(hlsDir)) {
    await this.cleanHlsDirectory(hlsDir);
  } else {
    fs.mkdirSync(hlsDir, { recursive: true });
  }

  const outputPath = path.join(hlsDir, "index.m3u8");
  const hlsUrl = `${this.hlsPublicPath}/${cameraId}/index.m3u8`;
  this.streamCache.set(cameraId, hlsUrl);

  const normalizedUrl = this.normalizeRtspUrl(rtspUrl);
  if (!normalizedUrl) throw new Error("Invalid RTSP URL");

  // Probe (ab safe hai — lock ke andar hai)
  let sourceFps = options.fps || options.sourceFps || 12;
  try {
    const probeResult = await this.probeCamera(normalizedUrl);
    sourceFps = probeResult.fps || sourceFps;
    options = {
      ...options,
      sourceFps,
      sourceWidth: probeResult.width,
      sourceHeight: probeResult.height,
      sourceCodec: probeResult.codec,
    };
    console.log(`📊 ${cameraId}: ${probeResult.width}x${probeResult.height} @ ${sourceFps}fps`);
  } catch (e) {
    console.warn(`⚠️ Probe failed for ${cameraId}, using default ${sourceFps}fps`);
  }

  const streamProcess = this.createStreamProcess(
    cameraId, normalizedUrl, hlsDir, outputPath, hlsUrl,
    { ...options, hlsDir }
  );

  this.streams.set(cameraId, streamProcess);
  this.metrics.activeStreams = this.streams.size;
  this.metrics.totalStreamsStarted++;

  streamProcess.start();

  // ✅ Background mein wait karo, response block mat karo
  this.waitForStreamReady(streamProcess, 15000).then(ready => {
    if (!ready) {
      console.warn(`⚠️ Stream ${cameraId} slow to start`);
    } else {
      console.log(`✅ Stream ${cameraId} ready`);
    }
  }).catch(() => {});

  const startupTime = Date.now() - startTime;
  this.metrics.startupTimes.push(startupTime);
  if (this.metrics.startupTimes.length > 100) this.metrics.startupTimes.shift();
  this.metrics.avgStartupTime = Math.round(
    this.metrics.startupTimes.reduce((a, b) => a + b, 0) /
      this.metrics.startupTimes.length
  );

  return {
    success: true,
    hlsUrl,
    cameraId,
    startupTime,
    message: "Stream started successfully",
    detected: {
      fps: sourceFps,
      resolution: options.sourceWidth && options.sourceHeight
        ? `${options.sourceWidth}x${options.sourceHeight}` : null,
      codec: options.sourceCodec,
    },
  };
}

  /**
   * Clean HLS directory
   */
  async cleanHlsDirectory(hlsDir) {
    if (!fs.existsSync(hlsDir)) return;

    try {
      const files = await fs.promises.readdir(hlsDir);
      await Promise.allSettled(
        files.map(file =>
          fs.promises.unlink(path.join(hlsDir, file)).catch(() => {})
        )
      );
      console.log(`🧹 Cleaned HLS dir: ${hlsDir} (${files.length} files)`);
    } catch (error) {
      console.error(`Cleanup error for ${hlsDir}:`, error.message);
    }
  }

  /**
   * Build FFmpeg options
   */
  // buildFFmpegOptions(urlType, options = {}) {
  //   const fps = options.sourceFps || options.fps || 12;

  //   const inputOptions = [
  //     "-rtsp_transport", options.transport || "tcp",
  //     "-rtsp_flags", "prefer_tcp",
  //     "-timeout", "10000000",
  //     "-buffer_size", "1024000",
  //     "-max_delay", "500000",
  //     "-reorder_queue_size", "1000",
  //     "-re",
  //     "-fflags", "+igndts+genpts+discardcorrupt",
  //     "-flags", "low_delay",
  //     "-strict", "experimental",
  //     "-analyzeduration", "1000000",
  //     "-probesize", "1000000",
  //   ];

  //   const outputOptions = [
  //     "-map", "0:v:0",
  //     "-c:v", "libx264",
  //     "-preset", "ultrafast",
  //     "-tune", "zerolatency",
  //     "-crf", "28",
  //     "-maxrate", "1500k",
  //     "-bufsize", "3000k",
  //     "-pix_fmt", "yuv420p",
  //     "-g", String(Math.max(15, Math.round(fps * 2))),
  //     "-sc_threshold", "0",
  //     "-threads", "2",
  //     "-vf", `setpts=N/${fps}/TB,scale='min(1280,iw)':-2`,
  //     "-an",
  //     "-fps_mode", "cfr",
  //     "-r", String(fps),
  //     "-hls_time", String(this.segmentDuration),
  //     "-hls_list_size", String(this.maxSegments),
  //     "-hls_flags", "delete_segments+append_list+omit_endlist+independent_segments",
  //     "-hls_allow_cache", "0",
  //     "-hls_segment_type", "mpegts",
  //     "-hls_segment_filename", path.join(options.hlsDir || "", "segment_%03d.ts"),
  //     "-reset_timestamps", "1",
  //     "-start_number", "0",
  //     "-muxdelay", "0",
  //     "-muxpreload", "0",
  //     "-f", "hls",
  //   ];

  //   return { inputOptions, outputOptions };
  // }


  buildFFmpegOptions(urlType, options = {}) {
  const fps = options.sourceFps || options.fps || 12;

  const inputOptions = [
    "-rtsp_transport", options.transport || "tcp",
    "-rtsp_flags", "prefer_tcp",
    "-timeout", "10000000",
    "-buffer_size", "1024000",
    "-max_delay", "200000",        // ✅ 500000 → 200000 (kam delay)
    "-reorder_queue_size", "500",   // ✅ 1000 → 500
    "-re",
    "-fflags", "+igndts+genpts+discardcorrupt+nobuffer",  // ✅ nobuffer add
    "-flags", "low_delay",
    "-strict", "experimental",
    "-analyzeduration", "500000",   // ✅ 1000000 → 500000 (fast start)
    "-probesize", "500000",         // ✅ 1000000 → 500000
  ];

  const outputOptions = [
    "-map", "0:v:0",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-crf", "28",
    "-maxrate", "1500k",
    "-bufsize", "3000k",
    "-pix_fmt", "yuv420p",

    // ✅ KEYFRAME: har 1 sec pe ek keyframe (fps ke barabar)
    "-g", String(fps),
    "-keyint_min", String(fps),
    "-sc_threshold", "0",
    "-force_key_frames", `expr:gte(t,n_forced*1)`,  // ✅ force keyframe every 1s

    "-threads", "2",
    "-vf", `setpts=N/${fps}/TB,scale='min(1280,iw)':-2`,
    "-an",
    "-fps_mode", "cfr",
    "-r", String(fps),

    // ✅ HLS LOW LATENCY
    "-hls_time", "1",                    // ✅ 2 → 1 sec segment
    "-hls_list_size", "3",               // ✅ 6 → 3 segments (3 sec buffer)
    "-hls_flags", "delete_segments+append_list+omit_endlist+independent_segments+program_date_time",
    "-hls_allow_cache", "0",
    "-hls_segment_type", "mpegts",
    "-hls_segment_filename", path.join(options.hlsDir || "", "segment_%03d.ts"),
    "-hls_delete_threshold", "2",        // ✅ Purane segments jaldi delete

    "-reset_timestamps", "1",
    "-start_number", "0",
    "-muxdelay", "0",
    "-muxpreload", "0",
    "-f", "hls",
  ];

  return { inputOptions, outputOptions };
}

  /**
   * Create stream process
   */
  createStreamProcess(cameraId, rtspUrl, hlsDir, outputPath, hlsUrl, options) {
    const self = this;
    const urlType = this.detectUrlType(rtspUrl);

    const streamProcess = {
      cameraId,
      rtspUrl,
      hlsDir,
      outputPath,
      hlsUrl,
      startTime: Date.now(),
      lastProgress: Date.now(),
      clients: 0,
      status: "starting",
      process: null,
      command: null,
      restartCount: 0,
      frames: 0,
      fps: 0,
      bitrate: 0,
      isStarting: true,
      options,
      sourceFps: options.sourceFps,
    };

    const { inputOptions, outputOptions } = this.buildFFmpegOptions(urlType, {
      ...options,
      hlsDir,
    });

    const command = ffmpeg(rtspUrl)
      .inputOptions(inputOptions)
      .outputOptions(outputOptions)
      .output(outputPath);

    command.on("start", () => {
      streamProcess.status = "running";
      streamProcess.isStarting = false;
      streamProcess.process = command.ffmpegProc;
      console.log(`🎥 Stream started: ${cameraId}`);
      self.emit("stream:started", { cameraId, hlsUrl });
    });

    command.on("progress", (progress) => {
      streamProcess.lastProgress = Date.now();
      streamProcess.frames = progress.frames || 0;
      streamProcess.fps = progress.currentFps || 0;
      streamProcess.bitrate = progress.currentKbps || 0;
      streamProcess.isStarting = false;
    });

    command.on("stderr", (line) => {
      const ignored = [
        "Last message repeated",
        "Application provided invalid",
        "non monotonically increasing",
        "invalid dropping",
        "DTS discontinuity",
        "Packet corrupt",
        "deprecated pixel format",
        "Timestamps are unset",
        "Estimating duration",
        "Header missing",
        "PES packet size mismatch",
        "max delay reached",
        "real-time buffer",
        "Circular buffer",
        "vsync is deprecated",
        "fps_mode",
      ];

      if (ignored.some((p) => line.includes(p))) return;

      if (
        /error|invalid|failed|refused|timed out|unable|cannot/i.test(line) &&
        !line.includes("Invalid data found")
      ) {
        console.error(`FFmpeg [${cameraId}]:`, line.substring(0, 200));
      }
    });

    command.on("error", (err) => {
      if (streamProcess.isStopping) return;
      console.error(`❌ Stream error [${cameraId}]:`, err.message);
      streamProcess.status = "error";
      streamProcess.lastError = err.message;
      self.metrics.totalStreamsFailed++;
      self.emit("stream:error", { cameraId, error: err.message });
    });

    command.on("end", () => {
      if (streamProcess.isStopping) {
        console.log(`⏹️ Stream stopped: ${cameraId}`);
      } else {
        console.log(`⏹️ Stream ended unexpectedly: ${cameraId}`);
      }
      streamProcess.status = "ended";
      self.emit("stream:ended", { cameraId });
    });

    streamProcess.command = command;
    streamProcess.start = () => command.run();
    streamProcess.stop = () => self.stopStream(cameraId);

    return streamProcess;
  }

  /**
   * Wait for stream ready (non-blocking)
   */
  async waitForStreamReady(streamProcess, timeout = 15000) {
    const startTime = Date.now();
    const m3u8Path = path.join(streamProcess.hlsDir, "index.m3u8");

    while (Date.now() - startTime < timeout) {
      if (fs.existsSync(m3u8Path)) {
        try {
          const stats = fs.statSync(m3u8Path);
          if (stats.size > 0) {
            const files = fs.readdirSync(streamProcess.hlsDir);
            const segments = files.filter((f) => f.endsWith(".ts"));
            if (segments.length > 0) {
              return true;
            }
          }
        } catch (e) {
          // Ignore
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    return false;
  }

  /**
   * Stop stream
   */
  async stopStream(cameraId, intentional = false) {
    const stream = this.streams.get(cameraId);
    if (!stream) {
      return { success: true, message: "Stream not found" };
    }

    stream.isStopping = true;

    try {
      if (stream.command) {
        stream.command.kill("SIGTERM");

        setTimeout(() => {
          try {
            if (stream.process && stream.process.exitCode === null) {
              stream.command.kill("SIGKILL");
            }
          } catch (e) {
            // Already dead
          }
        }, 3000);
      }

      this.streams.delete(cameraId);
      this.metrics.activeStreams = this.streams.size;
      this.streamCache.delete(cameraId);
      this.failedStreams.delete(cameraId);

      if (!intentional) {
        this.metrics.totalStreamsStopped++;
        this.emit("stream:stopped", { cameraId });
      }

      return { success: true, message: "Stream stopped" };
    } catch (error) {
      console.error(`Error stopping stream ${cameraId}:`, error);
      return { success: false, error: error.message };
    }
  }

  // /**
  //  * Restart stream
  //  */
  // async restartStream(cameraId) {
  //   const stream = this.streams.get(cameraId);
  //   const currentRestartCount = stream ? stream.restartCount || 0 : 0;
  //   const newRestartCount = currentRestartCount + 1;

  //   if (newRestartCount > this.maxRestarts) {
  //     console.error(`❌ Max restarts exceeded for ${cameraId}`);
  //     this.cleanupStream(cameraId);
  //     this.emit("stream:failed", {
  //       cameraId,
  //       error: "Max restarts exceeded",
  //       restarts: currentRestartCount,
  //     });
  //     return { success: false, error: "Max restarts exceeded" };
  //   }

  //   console.log(`🔄 Restarting (${newRestartCount}/${this.maxRestarts}): ${cameraId}`);

  //   const rtspUrl = stream?.rtspUrl;
  //   const options = stream?.options || {};

  //   if (!rtspUrl) {
  //     throw new Error("Cannot restart: no RTSP URL");
  //   }

  //   await this.stopStream(cameraId, true);
  //   await new Promise((resolve) => setTimeout(resolve, this.restartDelay));

  //   const result = await this.startStream(cameraId, rtspUrl, options);

  //   const newStream = this.streams.get(cameraId);
  //   if (newStream) {
  //     newStream.restartCount = newRestartCount;
  //   }

  //   this.metrics.totalRestarts++;
  //   return result;
  // }

  async restartStream(cameraId) {
  const stream = this.streams.get(cameraId);
  const currentRestartCount = stream ? stream.restartCount || 0 : 0;
  const newRestartCount = currentRestartCount + 1;

  if (newRestartCount > this.maxRestarts) {
    console.error(`❌ Max restarts exceeded for ${cameraId}`);
    this.cleanupStream(cameraId);
    this.emit("stream:failed", {
      cameraId,
      error: "Max restarts exceeded",
      restarts: currentRestartCount,
    });
    return { success: false, error: "Max restarts exceeded" };
  }

  const rtspUrl = stream?.rtspUrl;
  const options = stream?.options || {};
  if (!rtspUrl) throw new Error("Cannot restart: no RTSP URL");

  console.log(`🔄 Restarting (${newRestartCount}/${this.maxRestarts}): ${cameraId}`);

  await this.stopStream(cameraId, true);
  await new Promise(r => setTimeout(r, this.restartDelay));

  // ✅ startStream ab lock use karta hai
  const result = await this.startStream(cameraId, rtspUrl, options);

  // ✅ Naye stream pe restartCount set karo
  const newStream = this.streams.get(cameraId);
  if (newStream) {
    newStream.restartCount = newRestartCount;
  }

  this.metrics.totalRestarts++;
  return result;
}

  /**
   * Cleanup stream resources
   */
  cleanupStream(cameraId) {
    const stream = this.streams.get(cameraId);
    if (stream) {
      stream.isStopping = true;
      if (stream.process) {
        try {
          stream.process.kill("SIGKILL");
        } catch (e) {
          // Already dead
        }
      }
      this.streams.delete(cameraId);
    }
    this.metrics.activeStreams = this.streams.size;
  }

  // ============================================
  // MONITORING & MAINTENANCE
  // ============================================

  startMonitoring() {
    // this.healthCheckInterval = setInterval(() => {
    //   this.performHealthCheck();
    // }, 15000);

    // this.cleanupInterval = setInterval(() => {
    //   this.cleanupOldSegments();
    // }, 30000);


      this.healthCheckInterval = setInterval(() => {
    this.performHealthCheck();
  }, 15000);

  // ✅ 30000 → 10000 (segments jaldi cleanup)
  this.cleanupInterval = setInterval(() => {
    this.cleanupOldSegments();
  }, 10000);

    this.metricsInterval = setInterval(() => {
      const usage = process.memoryUsage();
      this.metrics.memoryUsage = Math.round(usage.heapUsed / 1024 / 1024);
      this.metrics.activeStreams = this.streams.size;
      this.metrics.queuedStreams = this.streamQueue.length;
      this.metrics.startingStreams = this.startingStreams.size;
    }, 10000);
  }

  // async cleanupOldSegments() {
  //   for (const [, stream] of this.streams.entries()) {
  //     if (!stream.hlsDir || !fs.existsSync(stream.hlsDir)) continue;

  //     try {
  //       const files = await fs.promises.readdir(stream.hlsDir);
  //       const segments = files.filter((f) => f.endsWith(".ts")).sort();

  //       if (segments.length > this.maxSegments) {
  //         const toDelete = segments.slice(0, -this.maxSegments);
  //         await Promise.allSettled(
  //           toDelete.map(segment =>
  //             fs.promises.unlink(path.join(stream.hlsDir, segment)).catch(() => {})
  //           )
  //         );
  //       }
  //     } catch (error) {
  //       // Ignore
  //     }
  //   }
  // }





  async cleanupOldSegments() {
  for (const [, stream] of this.streams.entries()) {
    if (!stream.hlsDir || !fs.existsSync(stream.hlsDir)) continue;

    try {
      const files = await fs.promises.readdir(stream.hlsDir);
      const segments = files.filter((f) => f.endsWith(".ts")).sort();

      // ✅ maxSegments + 2 buffer (2 = 3)
      if (segments.length > this.maxSegments + 2) {
        const toDelete = segments.slice(0, -(this.maxSegments + 2));
        await Promise.allSettled(
          toDelete.map(segment =>
            fs.promises.unlink(path.join(stream.hlsDir, segment)).catch(() => {})
          )
        );
      }
    } catch (error) {
      // Ignore
    }
  }
}

  async processQueue() {
    while (
      this.streamQueue.length > 0 &&
      this.streams.size < this.maxConcurrentStreams
    ) {
      const request = this.streamQueue.shift();
      this.metrics.queuedStreams = this.streamQueue.length;
      
      try {
        const result = await this.startStream(
          request.cameraId,
          request.rtspUrl,
          request.options
        );
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  }

  // async performHealthCheck() {


  //   const now = Date.now();
  //   const staleThreshold = 30000;

  //   const toCleanup = [];
  //   const toRestart = [];

  //   for (const [cameraId, stream] of this.streams.entries()) {
  //     if (stream.isStopping) continue;

  //     if (stream.isStarting && now - stream.startTime < 25000) {
  //       continue;
  //     }

  //     if (stream.process && stream.process.exitCode !== null) {
  //       toCleanup.push({ cameraId, reason: "process_died" });
  //       continue;
  //     }

  //     const uptime = now - stream.startTime;
  //     if (
  //       uptime > 45000 &&
  //       stream.lastProgress &&
  //       now - stream.lastProgress > staleThreshold
  //     ) {
  //       if (stream.restartCount >= this.maxRestarts) {
  //         toCleanup.push({ cameraId, reason: "max_restarts_stale" });
  //       } else {
  //         toRestart.push(cameraId);
  //       }
  //     }
  //   }

  //   for (const { cameraId, reason } of toCleanup) {
  //     const stream = this.streams.get(cameraId);
  //     console.log(`💀 Cleanup: ${cameraId} (${reason})`);
  //     this.cleanupStream(cameraId);

  //     if (reason === "max_restarts_stale") {
  //       this.emit("stream:failed", {
  //         cameraId,
  //         error: "Max restarts exceeded",
  //         restarts: stream?.restartCount || 0,
  //       });
  //     } else {
  //       this.emit("stream:error", { cameraId, error: "Process died" });
  //     }
  //   }

  //   for (const cameraId of toRestart) {
  //     console.log(`⚠️ Restarting stale: ${cameraId}`);
  //     try {
  //       await this.restartStream(cameraId);
  //     } catch (error) {
  //       console.error(`Restart failed: ${cameraId}`, error.message);
  //     }
  //   }

  //   this.processQueue();
  // }








  async performHealthCheck() {
  const now = Date.now();
  const staleThreshold = 30000;

  const toCleanup = [];

  for (const [cameraId, stream] of this.streams.entries()) {
    if (stream.isStopping) continue;
    if (stream.isStarting && now - stream.startTime < 25000) continue;

    // Process died
    if (stream.process && stream.process.exitCode !== null) {
      toCleanup.push({ cameraId, reason: "process_died" });
      continue;
    }

    // Stale (no progress)
    const uptime = now - stream.startTime;
    if (
      uptime > 45000 &&
      stream.lastProgress &&
      now - stream.lastProgress > staleThreshold
    ) {
      toCleanup.push({ cameraId, reason: "stale" });
    }
  }

  for (const { cameraId, reason } of toCleanup) {
    const stream = this.streams.get(cameraId);
    console.log(`💀 Cleanup: ${cameraId} (${reason})`);
    this.cleanupStream(cameraId);

    // ✅ Emit karo — StreamScheduler isko sun kar retry karega
    //    (yahin se restart MAT karo)
    this.emit("stream:died", {
      cameraId,
      reason,
      restarts: stream?.restartCount || 0,
    });
  }

  // ❌ toRestart loop hata do — scheduler handle karega
  // ❌ this.processQueue() bhi yahan se hata do, usko alag interval do

  this.processQueue();
}





  // ============================================
  // UTILITIES
  // ============================================





  normalizeRtspUrl(rawUrl) {
    if (!rawUrl) return null;

    let url = rawUrl.trim();
    url = url.replace(/^["']|["']$/g, "");

    if (!/^rtsps?:\/\//i.test(url)) {
      url = "rtsp://" + url;
    }

    try {
      const parsed = new URL(url);
      if (!parsed.hostname) throw new Error("Invalid hostname");
      if (!parsed.port) {
        parsed.port = parsed.protocol === "rtsps:" ? "322" : "554";
      }
      return parsed.toString();
    } catch (error) {
      console.warn(`⚠️ URL parse failed, using raw: ${error.message}`);
      return url;
    }
  }

  detectUrlType(url) {
    const lowerUrl = url.toLowerCase();
    return {
      isRtsp: lowerUrl.startsWith("rtsp://"),
      isRtsps: lowerUrl.startsWith("rtsps://"),
      hasAuth: /:\/\/[^:]+:[^@]+@/.test(url),
      hasQuery: url.includes("?"),
    };
  }

  maskUrl(url) {
    try {
      return url.replace(/(:\/\/[^:]+:)[^@]+(@)/, "$1***$2");
    } catch {
      return url;
    }
  }

  // ============================================
  // PUBLIC GETTERS
  // ============================================

  getStreamInfo(cameraId) {
    const stream = this.streams.get(cameraId);
    if (!stream) return null;

    return {
      cameraId,
      hlsUrl: stream.hlsUrl,
      status: stream.status,
      startTime: stream.startTime,
      lastProgress: stream.lastProgress,
      clients: stream.clients,
      frames: stream.frames,
      fps: stream.fps,
      bitrate: stream.bitrate,
      restartCount: stream.restartCount,
    };
  }

  getAllStreams() {
    return Array.from(this.streams.keys()).map((id) => this.getStreamInfo(id));
  }

  getMetrics() {
    return {
      ...this.metrics,
      queueSize: this.streamQueue.length,
      maxConcurrent: this.maxConcurrentStreams,
      utilization:
        ((this.streams.size / this.maxConcurrentStreams) * 100).toFixed(1) + "%",
    };
  }

  async shutdown() {
    console.log("🛑 Shutting down StreamManager...");

    clearInterval(this.healthCheckInterval);
    clearInterval(this.cleanupInterval);
    clearInterval(this.metricsInterval);

    const cameraIds = Array.from(this.streams.keys());
    await Promise.allSettled(cameraIds.map((id) => this.stopStream(id, true)));

    console.log("✅ StreamManager shutdown complete");
  }
}


export default StreamManager;