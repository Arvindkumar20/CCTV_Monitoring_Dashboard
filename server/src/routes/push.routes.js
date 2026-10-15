import express from "express";
import {PushSubscription} from "../models/PushSubscription.js";
import { authenticate } from "../middlewares/auth.middleware.js";
// import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Frontend ko public key dene ke liye
router.get("/vapid-public-key", (req, res) => {
  res.json({ key: process.env.VAPID_PUBLIC_KEY });
});

// Subscribe
router.post("/subscribe", authenticate, async (req, res) => {
  const { endpoint, keys, userAgent } = req.body;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ message: "Invalid subscription" });
  }
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { userId: req.user.userId, endpoint, keys, userAgent },
    { upsert: true, new: true }
  );
  res.json({ ok: true });
});

// Unsubscribe
router.post("/unsubscribe", authenticate, async (req, res) => {
  await PushSubscription.deleteOne({ endpoint: req.body.endpoint, user: req.user.userId, });
  res.json({ ok: true });
});

export const pushRouter= router;