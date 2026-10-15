// import nodemailer from "nodemailer";
// import twilio from "twilio";
// import fs from "fs";
// import mongoose from "mongoose";
// import path from "path";
// import { AlertLog } from "../../models/AlertLog.js";
// import Camera from "../../models/camera.model.js";
// import {User} from "../../models/user.model.js";
// // import { notificationService } from "./notification.service.js";
// import logger from "../../config/logger.js";
// import { notificationService } from "../notification.service.js";

// export class AlertService {
//   constructor() {
//     // ───── Email ─────
//     this.mailer = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: Number(process.env.SMTP_PORT) || 587,
//       secure: false,
//       auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//     });

//     // ───── Twilio ─────
//     this.twilioClient = null;
//     if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
//       this.twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);
//     }

//     this.twilioPhone    = process.env.TWILIO_PHONE;
//     this.twilioWhatsApp = process.env.TWILIO_WHATSAPP || `whatsapp:${process.env.TWILIO_PHONE}`;

//     // ───── Channel routing per alert type ─────
//     this.alertRouting = {
//       person: { email: true, sms: true, whatsapp: true, call: false },
//       fire:   { email: true, sms: true, whatsapp: true, call: true  },
//       smoke:  { email: true, sms: true, whatsapp: true, call: true  },
//     };
//   }

//   // ════════════════════════════════════════════════════════════
//   // MAIN DISPATCHER
//   // ════════════════════════════════════════════════════════════
// async sendAlert({ type, cameraName, cameraId, confidence, snapshotPath, timestamp, userId }) {
//     // ─── 0. Validate ───
//     if (!type || !cameraId) {
//       logger.error(`❌ sendAlert: missing type or cameraId`, { type, cameraId });
//       return { status: "skipped", reason: "invalid_payload" };
//     }

//     const ts = timestamp ? new Date(timestamp) : new Date();
//     if (isNaN(ts.getTime())) {
//       logger.error(`❌ sendAlert: invalid timestamp: ${timestamp}`);
//       return { status: "skipped", reason: "invalid_timestamp" };
//     }

//     const timeStr = ts.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

//   // ─── 1. Camera + Owner fetch ───
// let camera = null;
// try {
//   // Camera ko pehle _id se dhoondo, phir cameraId (string) se
//   if (mongoose.Types.ObjectId.isValid(cameraId) && String(cameraId).length === 24) {
//     camera = await Camera.findById(cameraId)
//       .select("owner createdBy name location zone floor latitude longitude cameraId")
//       .lean();
//   }

//   // Agar _id se nahi mila, to cameraId (string field) se try karo
//   if (!camera) {
//     camera = await Camera.findOne({ cameraId: String(cameraId) })
//       .select("owner createdBy name location zone floor latitude longitude cameraId")
//       .lean();
//   }
// } catch (e) {
//   logger.error(`❌ Camera lookup failed for ${cameraId}: ${e.message}`);
// }

// if (!camera) {
//   logger.warn(`⚠️ Alert skipped: camera ${cameraId} not found`);
//   return { status: "skipped", reason: "camera_not_found" };
// }

//     const ownerId = camera?.owner || camera?.createdBy || null;
//     if (!ownerId) {
//       logger.warn(`⚠️ Alert skipped: camera ${cameraId} has no owner/createdBy`);
//       return { status: "skipped", reason: "no_owner" };
//     }

//     // ─── 2. User fetch (contacts + prefs) ───
//     const user = await User.findById(ownerId)
//       .select("fullName email mobile whatsapp callPhone alertEmail alertPreferences")
//       .lean();

//     if (!user) {
//       logger.warn(`⚠️ Alert skipped: user ${ownerId} not found`);
//       return { status: "skipped", reason: "user_not_found" };
//     }

//     // ─── 3. Recipients per user ───
//     const prefs = user.alertPreferences || {};
//     const typeRoute = this.alertRouting[type] || this.alertRouting.person;

//     const recipients = {
//       emails:   (prefs.email    !== false && typeRoute.email    && (user.alertEmail || user.email))
//                   ? [user.alertEmail || user.email] : [],
//       sms:      (prefs.sms      !== false && typeRoute.sms      && user.mobile)      ? [user.mobile]      : [],
//       whatsapp: (prefs.whatsapp !== false && typeRoute.whatsapp && (user.whatsapp || user.mobile))
//                   ? [user.whatsapp || user.mobile] : [],
//       call:     (prefs.call     === true  && typeRoute.call     && (user.callPhone || user.mobile))
//                   ? [user.callPhone || user.mobile] : [],
//     };

//     logger.info(`🎯 Alert targets → user: ${user.fullName} (${ownerId})`);
//     logger.info(`   📧 ${recipients.emails.length} | 📱 ${recipients.sms.length} | 💬 ${recipients.whatsapp.length} | 📞 ${recipients.call.length}`);

//     // ─── 4. Message content ───
//     const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
//     const label = { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";
//     const subject = `${emoji} ${label} DETECTED — ${cameraName}`;
//     const message = `${label} detected on camera "${cameraName}" (${cameraId}) at ${timeStr} with confidence ${(confidence * 100).toFixed(1)}%`;

//     logger.info(`📢 ${subject}`);

//     // ─── 5. AlertLog create ───
//     let logDoc;
//     try {
//       logDoc = await AlertLog.create({
//         type,
//         cameraId,
//         cameraName,
//       user: ownerId,

//         confidence,
//         snapshotPath,
//         timestamp: ts,
//         overallStatus: "pending",
//         channels: {
//           email:    { status: recipients.emails.length    ? "failed" : "skipped", recipients: recipients.emails },
//           sms:      { status: recipients.sms.length       ? "failed" : "skipped", recipients: recipients.sms },
//           whatsapp: { status: recipients.whatsapp.length  ? "failed" : "skipped", recipients: recipients.whatsapp },
//           call:     { status: recipients.call.length      ? "failed" : "skipped", recipients: recipients.call },
//           inApp:    { status: "pending" },
//         },
//       });
//     } catch (e) {
//       logger.error(`❌ AlertLog.create failed: ${e.message}`);
//       logger.error(`   validation: ${JSON.stringify(e.errors || {})}`);
//       // log fail hone pe bhi in-app bhej do
//       await this._safeInApp({ userId: ownerId, alertLogId: null, cameraId, cameraName, type, confidence, snapshotPath, ts, camera });
//       return { status: "failed", reason: "alertlog_create_failed", error: e.message };
//     }

//     // ─── 6. IN-APP NOTIFICATION ───
//     await this._safeInApp({
//       userId: ownerId,
//       alertLogId: logDoc._id,
//       cameraId,
//       cameraName,
//       type,
//       confidence,
//       snapshotPath,
//       ts,
//       camera,
//     });
//     logDoc.channels.inApp.status = "sent";
//     logDoc.channels.inApp.attempts = 1;
//     logDoc.channels.inApp.sentAt = new Date();

//     // ─── 7. External channels ───
//     const ctx = {
//       subject, message, cameraName, cameraId,
//       snapshotPath, type, timestamp: ts, timeStr, confidence,
//       recipients, // 👈 per-user
//     };

//     const tasks = [];
//     if (recipients.emails.length)   tasks.push({ name: "email",    fn: () => this.sendEmail(ctx) });
//     if (recipients.sms.length)      tasks.push({ name: "sms",      fn: () => this.sendSMS(ctx) });
//     if (recipients.whatsapp.length) tasks.push({ name: "whatsapp", fn: () => this.sendWhatsApp(ctx) });
//     if (recipients.call.length)     tasks.push({ name: "call",     fn: () => this.makeCall(ctx) });

//     const results = await Promise.allSettled(tasks.map((t) => t.fn()));

//     let sent = 1, failed = 0; // in-app already sent
//     results.forEach((r, i) => {
//       const ch = tasks[i].name;
//       logDoc.channels[ch].attempts += 1;
//       if (r.status === "fulfilled") {
//         logDoc.channels[ch].status = "sent";
//         logDoc.channels[ch].sentAt = new Date();
//         logDoc.channels[ch].error = null;
//         sent++;
//       } else {
//         logDoc.channels[ch].status = "failed";
//         logDoc.channels[ch].error = r.reason?.message || r.reason?.toString?.() || "unknown error";
//         failed++;
//         logger.error(`❌ Channel [${ch}] failed: ${r.reason?.stack || r.reason}`);
//       }
//     });

//     // Overall status
//     const allChannels = ["email", "sms", "whatsapp", "call"];
//     const skippedCount = allChannels.filter((ch) => logDoc.channels[ch].status === "skipped").length;
//     const externalSent = allChannels.filter((ch) => logDoc.channels[ch].status === "sent").length;

//     if (failed === 0 && (sent > 0 || externalSent > 0)) logDoc.overallStatus = "success";
//     else if (externalSent === 0 && skippedCount === 4) logDoc.overallStatus = "success"; // only in-app
//     else if (externalSent === 0 && failed > 0)         logDoc.overallStatus = "failed";
//     else                                                logDoc.overallStatus = "partial";

//     try {
//       await logDoc.save();
//       logger.info(`🗄️ Alert logged: ${logDoc._id} (${logDoc.overallStatus})`);
//     } catch (e) {
//       logger.error(`❌ AlertLog.save failed: ${e.message}`);
//     }

//     return { logId: logDoc._id, overallStatus: logDoc.overallStatus, results };
//   }

//   // ════════════════════════════════════════════════════════════
//   // IN-APP helper
//   // ════════════════════════════════════════════════════════════
//   async _safeInApp({ userId, alertLogId, cameraId, cameraName, type, confidence, snapshotPath, ts, camera }) {
//     try {
//       await notificationService.createAndEmit({
//         userId,
//         alertLogId,
//         cameraId,
//         cameraName,
//         type,
//         confidence,
//         snapshotPath,
//         timestamp: ts,
//         location:  camera?.location,
//         zone:      camera?.zone,
//         floor:     camera?.floor,
//         latitude:  camera?.latitude,
//         longitude: camera?.longitude,
//       });
//     } catch (e) {
//       logger.error(`❌ In-app notification failed: ${e.message}`);
//     }
//   }

//   // ════════════════════════════════════════════════════════════
//   // EMAIL (per-user)
//   // ════════════════════════════════════════════════════════════
//   async sendEmail({ subject, message, cameraName, cameraId, snapshotPath, type, timestamp, recipients }) {
//     if (!recipients.emails.length) return;

//     const color = { person: "#f59e0b", fire: "#dc2626", smoke: "#6b7280" }[type] || "#3b82f6";
//     const label = { person: "HUMAN DETECTED", fire: "FIRE DETECTED", smoke: "SMOKE DETECTED" }[type] || "ALERT";

//     const html = `
//       <div style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
//         <div style="background: ${color}; color: white; padding: 16px; text-align: center;">
//           <h2 style="margin: 0;">${label}</h2>
//         </div>
//         <div style="padding: 20px;">
//           <p><b>Camera:</b> ${cameraName}</p>
//           <p><b>Camera ID:</b> ${cameraId}</p>
//           <p><b>Time:</b> ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
//           ${snapshotPath && fs.existsSync(snapshotPath) ? `<p><b>Snapshot:</b> attached below</p>` : ""}
//         </div>
//       </div>
//     `;

//     const attachments = [];
//     if (snapshotPath && fs.existsSync(snapshotPath)) {
//       attachments.push({ filename: path.basename(snapshotPath), path: snapshotPath, cid: "snapshot" });
//     }

//     await this.mailer.sendMail({
//       from: `"Camera Alert" <${process.env.SMTP_USER}>`,
//       to: recipients.emails.join(","),
//       subject, text: message, html, attachments,
//     });
//     logger.info(`✅ Email sent to ${recipients.emails.join(", ")}`);
//   }

//   // ════════════════════════════════════════════════════════════
//   // SMS (per-user)
//   // ════════════════════════════════════════════════════════════
//   async sendSMS({ type, cameraName, timeStr, recipients }) {
//     if (!this.twilioClient || !recipients.sms.length) return;

//     const label = { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";
//     const body = `🚨 ${label} DETECTED at ${cameraName} (${timeStr}). Check immediately.`.slice(0, 160);

//     await Promise.all(
//       recipients.sms.map((to) =>
//         this.twilioClient.messages.create({ body, from: this.twilioPhone, to })
//       )
//     );
//     logger.info(`✅ SMS sent to ${recipients.sms.join(", ")}`);
//   }

//   // ════════════════════════════════════════════════════════════
//   // WHATSAPP (per-user)
//   // ════════════════════════════════════════════════════════════
//   async sendWhatsApp({ type, cameraName, cameraId, timeStr, confidence, recipients }) {
//     if (!this.twilioClient || !recipients.whatsapp.length) return;

//     const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
//     const label = { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";

//     const body =
//       `${emoji} *${label} DETECTED*\n\n` +
//       `📹 Camera: *${cameraName}* (${cameraId})\n` +
//       `🕒 Time: ${timeStr}\n` +
//       `🎯 Confidence: ${(confidence * 100).toFixed(1)}%\n\n` +
//       `⚠️ Please check immediately.`;

//     await Promise.all(
//       recipients.whatsapp.map((to) => {
//         const waTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
//         return this.twilioClient.messages.create({ body, from: this.twilioWhatsApp, to: waTo });
//       })
//     );
//     logger.info(`✅ WhatsApp sent to ${recipients.whatsapp.join(", ")}`);
//   }

//   // ════════════════════════════════════════════════════════════
//   // VOICE CALL (per-user)
//   // ════════════════════════════════════════════════════════════
//   async makeCall({ type, cameraName, cameraId, timeStr, confidence, recipients }) {
//     if (!this.twilioClient || !recipients.call.length) return;

//     const spokenLabel = {
//       person: "A human has been detected",
//       fire:   "A fire has been detected",
//       smoke:  "Smoke has been detected",
//     }[type] || "An alert has been triggered";

//     const sayText = `
//       Attention please. This is an emergency alert from your camera surveillance system.
//       ${spokenLabel} on camera ${cameraName}, camera I D ${cameraId}, at ${timeStr}, with confidence ${(confidence * 100).toFixed(0)} percent.
//       Please check your email and WhatsApp for the snapshot and details.
//       I repeat. ${spokenLabel} on camera ${cameraName}. Please check immediately.
//     `.replace(/\s+/g, " ").trim();

//     const twiml = `
//       <Response>
//         <Say voice="alice" language="en-IN">${sayText}</Say>
//         <Pause length="1"/>
//         <Say voice="alice" language="en-IN">This alert will repeat once more. ${sayText}</Say>
//       </Response>
//     `.trim();

//     await Promise.all(
//       recipients.call.map((to) =>
//         this.twilioClient.calls.create({ twiml, from: this.twilioPhone, to })
//       )
//     );
//     logger.info(`✅ Voice call initiated to ${recipients.call.join(", ")}`);
//   }

//   // ════════════════════════════════════════════════════════════
//   // RETRY
//   // ════════════════════════════════════════════════════════════
//   async retryFailedChannels(logId) {
//     const log = await AlertLog.findById(logId);
//     if (!log) throw new Error("Alert log not found");

//     const user = await User.findById(log.user)
//       .select("fullName email mobile whatsapp callPhone alertEmail alertPreferences")
//       .lean();
//     if (!user) throw new Error("Owner not found");

//     const recipients = {
//       emails:   user.alertEmail || user.email ? [user.alertEmail || user.email] : [],
//       sms:      user.mobile       ? [user.mobile]       : [],
//       whatsapp: user.whatsapp || user.mobile ? [user.whatsapp || user.mobile] : [],
//       call:     user.callPhone || user.mobile ? [user.callPhone || user.mobile] : [],
//     };

//     const timeStr = new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

//     const ctx = {
//       subject: `🔁 RETRY: Alert for ${log.cameraName}`,
//       message: `Retry for alert ${log._id}`,
//       cameraName: log.cameraName,
//       cameraId:   log.cameraId,
//       snapshotPath: log.snapshotPath,
//       type:       log.type,
//       timestamp:  log.timestamp,
//       timeStr,
//       confidence: log.confidence,
//       recipients,
//     };

//     const toRetry = ["email", "sms", "whatsapp", "call"].filter(
//       (ch) => log.channels[ch]?.status === "failed"
//     );

//     const map = {
//       email:    () => this.sendEmail(ctx),
//       sms:      () => this.sendSMS(ctx),
//       whatsapp: () => this.sendWhatsApp(ctx),
//       call:     () => this.makeCall(ctx),
//     };

//     const results = await Promise.allSettled(toRetry.map((ch) => map[ch]()));

//     results.forEach((r, i) => {
//       const ch = toRetry[i];
//       log.channels[ch].attempts += 1;
//       if (r.status === "fulfilled") {
//         log.channels[ch].status = "sent";
//         log.channels[ch].sentAt = new Date();
//         log.channels[ch].error = null;
//       } else {
//         log.channels[ch].error = r.reason?.message || "unknown";
//       }
//     });

//     const statuses = ["email", "sms", "whatsapp", "call"].map((c) => log.channels[c]?.status);
//     const sent = statuses.filter((s) => s === "sent").length;
//     const failed = statuses.filter((s) => s === "failed").length;
//     log.overallStatus = failed === 0 && sent > 0 ? "success" : sent === 0 ? "failed" : "partial";

//     log.retryCount += 1;
//     await log.save();

//     return { logId: log._id, overallStatus: log.overallStatus, retriedChannels: toRetry };
//   }
// }

// export const alertService = new AlertService();

import nodemailer from "nodemailer";
import twilio from "twilio";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";
import { AlertLog } from "../../models/AlertLog.js";
import Camera from "../../models/camera.model.js";
import { User } from "../../models/user.model.js";
// import { notificationService } from "./notification.service.js";
import logger from "../../config/logger.js";
import { notificationService } from "../notification.service.js";

export class AlertService {
  constructor() {
    // ───── Email ─────
    this.mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // ───── Twilio ─────
    this.twilioClient = null;
    if (process.env.TWILIO_SID && process.env.TWILIO_TOKEN) {
      this.twilioClient = twilio(
        process.env.TWILIO_SID,
        process.env.TWILIO_TOKEN,
      );
    }

    this.twilioPhone = process.env.TWILIO_PHONE;
    this.twilioWhatsApp =
      process.env.TWILIO_WHATSAPP || `whatsapp:${process.env.TWILIO_PHONE}`;

    // ───── Channel routing per alert type ─────
    this.alertRouting = {
      person: { email: true, sms: true, whatsapp: true, call: false },
      fire: { email: true, sms: true, whatsapp: true, call: true },
      smoke: { email: true, sms: true, whatsapp: true, call: true },
    };
  }

  // ════════════════════════════════════════════════════════════
  // MAIN DISPATCHER
  // ════════════════════════════════════════════════════════════
  async sendAlert({
    type,
    cameraName,
    cameraId,
    confidence,
    snapshotPath,
    timestamp,
    userId,
  }) {
    // ─── 0. Validate ───
    if (!type || !cameraId) {
      logger.error(`❌ sendAlert: missing type or cameraId`, {
        type,
        cameraId,
      });
      return { status: "skipped", reason: "invalid_payload" };
    }

    const ts = timestamp ? new Date(timestamp) : new Date();
    if (isNaN(ts.getTime())) {
      logger.error(`❌ sendAlert: invalid timestamp: ${timestamp}`);
      return { status: "skipped", reason: "invalid_timestamp" };
    }

    const timeStr = ts.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // ─── 1. Camera fetch ───
    let camera = null;
    try {
      if (
        mongoose.Types.ObjectId.isValid(cameraId) &&
        String(cameraId).length === 24
      ) {
        camera = await Camera.findById(cameraId)
          .select(
            "owner createdBy name location zone floor latitude longitude cameraId",
          )
          .lean();
      }
      if (!camera) {
        camera = await Camera.findOne({ cameraId: String(cameraId) })
          .select(
            "owner createdBy name location zone floor latitude longitude cameraId",
          )
          .lean();
      }
    } catch (e) {
      logger.error(`❌ Camera lookup failed for ${cameraId}: ${e.message}`);
    }

    if (!camera) {
      logger.warn(`⚠️ Alert skipped: camera ${cameraId} not found`);
      return { status: "skipped", reason: "camera_not_found" };
    }

    const ownerId = camera?.owner || camera?.createdBy || null;
    if (!ownerId) {
      logger.warn(
        `⚠️ Alert skipped: camera ${cameraId} has no owner/createdBy`,
      );
      return { status: "skipped", reason: "no_owner" };
    }

    // ─── 2. User fetch ───
    const user = await User.findById(ownerId)
      .select(
        "fullName email mobile whatsapp callPhone alertEmail alertPreferences",
      )
      .lean();

    if (!user) {
      logger.warn(`⚠️ Alert skipped: user ${ownerId} not found`);
      return { status: "skipped", reason: "user_not_found" };
    }

    // ─── 3. Recipients per user ───
    const prefs = user.alertPreferences || {};
    const typeRoute = this.alertRouting[type] || this.alertRouting.person;

    const recipients = {
      emails:
        prefs.email !== false &&
        typeRoute.email &&
        (user.alertEmail || user.email)
          ? [user.alertEmail || user.email]
          : [],
      sms:
        prefs.sms !== false && typeRoute.sms && user.mobile
          ? [user.mobile]
          : [],
      whatsapp:
        prefs.whatsapp !== false &&
        typeRoute.whatsapp &&
        (user.whatsapp || user.mobile)
          ? [user.whatsapp || user.mobile]
          : [],
      call:
        prefs.call === true && typeRoute.call && (user.callPhone || user.mobile)
          ? [user.callPhone || user.mobile]
          : [],
    };

    logger.info(`🎯 Alert targets → user: ${user.fullName} (${ownerId})`);
    logger.info(
      `   📧 ${recipients.emails.length} | 📱 ${recipients.sms.length} | 💬 ${recipients.whatsapp.length} | 📞 ${recipients.call.length}`,
    );

    // ─── 4. Message content ───
    const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
    const label =
      { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";
    const subject = `${emoji} ${label} DETECTED — ${cameraName}`;
    const message = `${label} detected on camera "${cameraName}" (${cameraId}) at ${timeStr} with confidence ${(confidence * 100).toFixed(1)}%`;

    logger.info(`📢 ${subject}`);

    // ════════════════════════════════════════════════════════════
    // STEP 1: IN-APP NOTIFICATION FIRST (real-time, blocking)
    // ════════════════════════════════════════════════════════════
    const inAppResult = await this._safeInApp({
      userId: ownerId,
      alertLogId: null, // abhi log create nahi hua
      cameraId,
      cameraName,
      type,
      confidence,
      snapshotPath,
      ts,
      camera,
    });

    // ════════════════════════════════════════════════════════════
    // STEP 2: Parallel — DB save + Email + SMS + WhatsApp + Call
    // ════════════════════════════════════════════════════════════
    const ctx = {
      subject,
      message,
      cameraName,
      cameraId,
      snapshotPath,
      type,
      timestamp: ts,
      timeStr,
      confidence,
      recipients,
    };

    // DB save promise
    const dbSavePromise = (async () => {
      try {
        const logDoc = await AlertLog.create({
          type,
          cameraId,
          cameraName,
          user: ownerId,
          confidence,
          snapshotPath,
          timestamp: ts,
          overallStatus: "pending",
          channels: {
            email: {
              status: recipients.emails.length ? "failed" : "skipped",
              recipients: recipients.emails,
            },
            sms: {
              status: recipients.sms.length ? "failed" : "skipped",
              recipients: recipients.sms,
            },
            whatsapp: {
              status: recipients.whatsapp.length ? "failed" : "skipped",
              recipients: recipients.whatsapp,
            },
            call: {
              status: recipients.call.length ? "failed" : "skipped",
              recipients: recipients.call,
            },
            inApp: {
              status: inAppResult.ok ? "sent" : "failed",
              attempts: 1,
              sentAt: inAppResult.ok ? new Date() : null,
              error: inAppResult.ok ? null : inAppResult.error,
            },
          },
        });
        return { logDoc, error: null };
      } catch (e) {
        logger.error(`❌ AlertLog.create failed: ${e.message}`);
        logger.error(`   validation: ${JSON.stringify(e.errors || {})}`);
        return { logDoc: null, error: e };
      }
    })();

    // External channel promises
    const channelTasks = [];
    // if (recipients.emails.length)   channelTasks.push({ name: "email",    fn: () => this.sendEmail(ctx) });
    // if (recipients.sms.length)      channelTasks.push({ name: "sms",      fn: () => this.sendSMS(ctx) });
    // if (recipients.whatsapp.length) channelTasks.push({ name: "whatsapp", fn: () => this.sendWhatsApp(ctx) });
    // if (recipients.call.length)     channelTasks.push({ name: "call",     fn: () => this.makeCall(ctx) });

    const channelPromises = channelTasks.map((t) =>
      t
        .fn()
        .then(() => ({ name: t.name, ok: true, error: null }))
        .catch((e) => ({ name: t.name, ok: false, error: e })),
    );

    // Fire DB save + all channels in parallel
    const [dbResult, ...channelResults] = await Promise.all([
      dbSavePromise,
      ...channelPromises,
    ]);

    const { logDoc, error: dbError } = dbResult;

    // ─── If DB save failed, still return gracefully ───
    if (!logDoc) {
      return {
        status: "failed",
        reason: "alertlog_create_failed",
        error: dbError?.message,
        inApp: inAppResult.ok ? "sent" : "failed",
      };
    }

    // ─── Update channel statuses on logDoc ───
    let sent = 1; // in-app already sent
    let failed = 0;

    if (!inAppResult.ok) {
      sent = 0;
      failed = 1;
    }

    channelResults.forEach((r) => {
      const ch = r.name;
      logDoc.channels[ch].attempts += 1;
      if (r.ok) {
        logDoc.channels[ch].status = "sent";
        logDoc.channels[ch].sentAt = new Date();
        logDoc.channels[ch].error = null;
        sent++;
      } else {
        logDoc.channels[ch].status = "failed";
        logDoc.channels[ch].error =
          r.error?.message || r.error?.toString?.() || "unknown error";
        failed++;
        logger.error(`❌ Channel [${ch}] failed: ${r.error?.stack || r.error}`);
      }
    });

    // ─── Overall status ───
    const allChannels = ["email", "sms", "whatsapp", "call"];
    const skippedCount = allChannels.filter(
      (ch) => logDoc.channels[ch].status === "skipped",
    ).length;
    const externalSent = allChannels.filter(
      (ch) => logDoc.channels[ch].status === "sent",
    ).length;

    if (failed === 0 && (sent > 0 || externalSent > 0))
      logDoc.overallStatus = "success";
    else if (externalSent === 0 && skippedCount === 4 && inAppResult.ok)
      logDoc.overallStatus = "success";
    else if (externalSent === 0 && failed > 0) logDoc.overallStatus = "failed";
    else logDoc.overallStatus = "partial";

    // ─── Save updated logDoc ───
    try {
      await logDoc.save();
      logger.info(`🗄️ Alert logged: ${logDoc._id} (${logDoc.overallStatus})`);
    } catch (e) {
      logger.error(`❌ AlertLog.save failed: ${e.message}`);
    }

    // ════════════════════════════════════════════════════════════
    // STEP 3: Update in-app notification with alertLogId (optional)
    // ════════════════════════════════════════════════════════════
    if (inAppResult.ok && inAppResult.notificationId && logDoc?._id) {
      // Agar tumhari notificationService me update method hai to yahan call karo
      // await notificationService.linkAlertLog(inAppResult.notificationId, logDoc._id);
    }

    return {
      logId: logDoc._id,
      overallStatus: logDoc.overallStatus,
      inApp: inAppResult.ok ? "sent" : "failed",
      channels: channelResults.reduce((acc, r) => {
        acc[r.name] = r.ok ? "sent" : "failed";
        return acc;
      }, {}),
    };
  }

  // ════════════════════════════════════════════════════════════
  // IN-APP helper
  // ════════════════════════════════════════════════════════════
  async _safeInApp({
    userId,
    alertLogId,
    cameraId,
    cameraName,
    type,
    confidence,
    snapshotPath,
    ts,
    camera,
  }) {
    try {
      const notification = await notificationService.createAndEmit({
        userId,
        alertLogId,
        cameraId,
        cameraName,
        type,
        confidence,
        snapshotPath,
        timestamp: ts,
        location: camera?.location,
        zone: camera?.zone,
        floor: camera?.floor,
        latitude: camera?.latitude,
        longitude: camera?.longitude,
      });
      return {
        ok: true,
        error: null,
        notificationId: notification?._id || null,
      };
    } catch (e) {
      logger.error(`❌ In-app notification failed: ${e.message}`);
      return { ok: false, error: e.message, notificationId: null };
    }
  }

  // ════════════════════════════════════════════════════════════
  // EMAIL (per-user)
  // ════════════════════════════════════════════════════════════
  async sendEmail({
    subject,
    message,
    cameraName,
    cameraId,
    snapshotPath,
    type,
    timestamp,
    recipients,
  }) {
    if (!recipients.emails.length) return;

    const color =
      { person: "#f59e0b", fire: "#dc2626", smoke: "#6b7280" }[type] ||
      "#3b82f6";
    const label =
      {
        person: "HUMAN DETECTED",
        fire: "FIRE DETECTED",
        smoke: "SMOKE DETECTED",
      }[type] || "ALERT";

    const html = `
      <div style="font-family: Arial; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: ${color}; color: white; padding: 16px; text-align: center;">
          <h2 style="margin: 0;">${label}</h2>
        </div>
        <div style="padding: 20px;">
          <p><b>Camera:</b> ${cameraName}</p>
          <p><b>Camera ID:</b> ${cameraId}</p>
          <p><b>Time:</b> ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
          ${snapshotPath && fs.existsSync(snapshotPath) ? `<p><b>Snapshot:</b> attached below</p>` : ""}
        </div>
      </div>
    `;

    const attachments = [];
    if (snapshotPath && fs.existsSync(snapshotPath)) {
      attachments.push({
        filename: path.basename(snapshotPath),
        path: snapshotPath,
        cid: "snapshot",
      });
    }

    await this.mailer.sendMail({
      from: `"Camera Alert" <${process.env.SMTP_USER}>`,
      to: recipients.emails.join(","),
      subject,
      text: message,
      html,
      attachments,
    });
    logger.info(`✅ Email sent to ${recipients.emails.join(", ")}`);
  }

  // ════════════════════════════════════════════════════════════
  // SMS (per-user)
  // ════════════════════════════════════════════════════════════
  async sendSMS({ type, cameraName, timeStr, recipients }) {
    if (!this.twilioClient || !recipients.sms.length) return;

    const label =
      { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";
    const body =
      `🚨 ${label} DETECTED at ${cameraName} (${timeStr}). Check immediately.`.slice(
        0,
        160,
      );

    await Promise.all(
      recipients.sms.map((to) =>
        this.twilioClient.messages.create({ body, from: this.twilioPhone, to }),
      ),
    );
    logger.info(`✅ SMS sent to ${recipients.sms.join(", ")}`);
  }

  // ════════════════════════════════════════════════════════════
  // WHATSAPP (per-user)
  // ════════════════════════════════════════════════════════════
  async sendWhatsApp({
    type,
    cameraName,
    cameraId,
    timeStr,
    confidence,
    recipients,
  }) {
    if (!this.twilioClient || !recipients.whatsapp.length) return;

    const emoji = { person: "🚨", fire: "🔥", smoke: "💨" }[type] || "⚠️";
    const label =
      { person: "HUMAN", fire: "FIRE", smoke: "SMOKE" }[type] || "ALERT";

    const body =
      `${emoji} *${label} DETECTED*\n\n` +
      `📹 Camera: *${cameraName}* (${cameraId})\n` +
      `🕒 Time: ${timeStr}\n` +
      `🎯 Confidence: ${(confidence * 100).toFixed(1)}%\n\n` +
      `⚠️ Please check immediately.`;

    await Promise.all(
      recipients.whatsapp.map((to) => {
        const waTo = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
        return this.twilioClient.messages.create({
          body,
          from: this.twilioWhatsApp,
          to: waTo,
        });
      }),
    );
    logger.info(`✅ WhatsApp sent to ${recipients.whatsapp.join(", ")}`);
  }

  // ════════════════════════════════════════════════════════════
  // VOICE CALL (per-user)
  // ════════════════════════════════════════════════════════════
  async makeCall({
    type,
    cameraName,
    cameraId,
    timeStr,
    confidence,
    recipients,
  }) {
    if (!this.twilioClient || !recipients.call.length) return;

    const spokenLabel =
      {
        person: "A human has been detected",
        fire: "A fire has been detected",
        smoke: "Smoke has been detected",
      }[type] || "An alert has been triggered";

    const sayText = `
      Attention please. This is an emergency alert from your camera surveillance system.
      ${spokenLabel} on camera ${cameraName}, camera I D ${cameraId}, at ${timeStr}, with confidence ${(confidence * 100).toFixed(0)} percent.
      Please check your email and WhatsApp for the snapshot and details.
      I repeat. ${spokenLabel} on camera ${cameraName}. Please check immediately.
    `
      .replace(/\s+/g, " ")
      .trim();

    const twiml = `
      <Response>
        <Say voice="alice" language="en-IN">${sayText}</Say>
        <Pause length="1"/>
        <Say voice="alice" language="en-IN">This alert will repeat once more. ${sayText}</Say>
      </Response>
    `.trim();

    await Promise.all(
      recipients.call.map((to) =>
        this.twilioClient.calls.create({ twiml, from: this.twilioPhone, to }),
      ),
    );
    logger.info(`✅ Voice call initiated to ${recipients.call.join(", ")}`);
  }

  // ════════════════════════════════════════════════════════════
  // RETRY
  // ════════════════════════════════════════════════════════════
  // async retryFailedChannels(logId) {
  //   const log = await AlertLog.findById(logId);
  //   if (!log) throw new Error("Alert log not found");

  //   const user = await User.findById(log.user)
  //     .select(
  //       "fullName email mobile whatsapp callPhone alertEmail alertPreferences",
  //     )
  //     .lean();
  //   if (!user) throw new Error("Owner not found");

  //   const recipients = {
  //     emails:
  //       user.alertEmail || user.email ? [user.alertEmail || user.email] : [],
  //     sms: user.mobile ? [user.mobile] : [],
  //     whatsapp:
  //       user.whatsapp || user.mobile ? [user.whatsapp || user.mobile] : [],
  //     call:
  //       user.callPhone || user.mobile ? [user.callPhone || user.mobile] : [],
  //   };

  //   const timeStr = new Date(log.timestamp).toLocaleString("en-IN", {
  //     timeZone: "Asia/Kolkata",
  //   });

  //   const ctx = {
  //     subject: `🔁 RETRY: Alert for ${log.cameraName}`,
  //     message: `Retry for alert ${log._id}`,
  //     cameraName: log.cameraName,
  //     cameraId: log.cameraId,
  //     snapshotPath: log.snapshotPath,
  //     type: log.type,
  //     timestamp: log.timestamp,
  //     timeStr,
  //     confidence: log.confidence,
  //     recipients,
  //   };

  //   const toRetry = ["email", "sms", "whatsapp", "call"].filter(
  //     (ch) => log.channels[ch]?.status === "failed",
  //   );

  //   const map = {
  //     email: () => this.sendEmail(ctx),
  //     sms: () => this.sendSMS(ctx),
  //     whatsapp: () => this.sendWhatsApp(ctx),
  //     call: () => this.makeCall(ctx),
  //   };

  //   const results = await Promise.allSettled(toRetry.map((ch) => map[ch]()));

  //   results.forEach((r, i) => {
  //     const ch = toRetry[i];
  //     log.channels[ch].attempts += 1;
  //     if (r.status === "fulfilled") {
  //       log.channels[ch].status = "sent";
  //       log.channels[ch].sentAt = new Date();
  //       log.channels[ch].error = null;
  //     } else {
  //       log.channels[ch].error = r.reason?.message || "unknown";
  //     }
  //   });

  //   const statuses = ["email", "sms", "whatsapp", "call"].map(
  //     (c) => log.channels[c]?.status,
  //   );
  //   const sent = statuses.filter((s) => s === "sent").length;
  //   const failed = statuses.filter((s) => s === "failed").length;
  //   log.overallStatus =
  //     failed === 0 && sent > 0 ? "success" : sent === 0 ? "failed" : "partial";

  //   log.retryCount += 1;
  //   await log.save();

  //   return {
  //     logId: log._id,
  //     overallStatus: log.overallStatus,
  //     retriedChannels: toRetry,
  //   };
  // }
}

export const alertService = new AlertService();
