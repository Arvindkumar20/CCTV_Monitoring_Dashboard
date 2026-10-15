#!/usr/bin/env node

import { getFFmpegInstance } from "../src/utils/ffmpeg";

console.log('🔍 Checking FFmpeg...');

try {
  const instance = getFFmpegInstance();
  console.log(`✅ FFmpeg found at: ${instance.path}`);
  console.log(`📌 Version: ${instance.version}`);
  console.log(`🔄 Reconnect support: ${instance.supportsReconnect ? 'Yes' : 'No'}`);
  process.exit(0);
} catch (error) {
  console.error('❌ FFmpeg check failed:', error.message);
  process.exit(1);
}