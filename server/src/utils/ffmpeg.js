import fs from 'fs/promises';
import { existsSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// System paths for different OS
const SYSTEM_PATHS = {
  darwin: [
    '/usr/local/bin/ffmpeg',      // Intel Mac
    '/opt/homebrew/bin/ffmpeg',   // Apple Silicon Mac
  ],
  linux: [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
  ],
  win32: [
    'C:\\ffmpeg\\bin\\ffmpeg.exe',
    'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
  ],
};

/**
 * Get FFmpeg path with priority order
 * 1. Environment variable FFMPEG_PATH
 * 2. System FFmpeg
 * 3. ffmpeg-static (fallback)
 */
export const getFfmpegPath = async() => {
  // Priority 1: Environment variable
  const envPath = process.env.FFMPEG_PATH;
  if (envPath && existsSync(envPath)) {
    console.log(`✅ Using FFmpeg from ENV: ${envPath}`);
    return envPath;
  }

  // Priority 2: System FFmpeg
  const os = process.platform;
  const paths = SYSTEM_PATHS[os] || SYSTEM_PATHS.linux;

  for (const sysPath of paths) {
    if (existsSync(sysPath)) {
      console.log(`✅ Using system FFmpeg: ${sysPath}`);
      return sysPath;
    }
  }

  // Priority 3: Try which command (Unix/Linux/Mac)
  try {
    const whichPath = execSync('which ffmpeg', { encoding: 'utf8' }).trim();
    if (whichPath && existsSync(whichPath)) {
      console.log(`✅ Using FFmpeg from PATH: ${whichPath}`);
      return whichPath;
    }
  } catch (_) {
    // which command not available
  }

  // Priority 4: ffmpeg-static fallback
  try {
    const staticPath = await import('ffmpeg-static');
    const finalPath = staticPath.default || staticPath;
    console.log(`⚠️ Using ffmpeg-static (fallback): ${finalPath}`);
    return finalPath;
  } catch (_) {
    throw new Error(
      '❌ FFmpeg not found!\n' +
      'Install FFmpeg:\n' +
      '  macOS: brew install ffmpeg\n' +
      '  Linux: sudo apt install ffmpeg\n' +
      '  Windows: Download from https://ffmpeg.org/'
    );
  }
};

/**
 * Verify FFmpeg installation
 */
export const verifyFfmpeg = (ffmpegPath) => {
  try {
    const output = execSync(`${ffmpegPath} -version`, { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    const version = output.split('\n')[0];
    console.log(`✅ FFmpeg verified: ${version}`);
    
    // Check if reconnect options are supported
    const help = execSync(`${ffmpegPath} -h full`, { encoding: 'utf8' });
    const supportsReconnect = help.includes('-reconnect');
    console.log(`✅ Reconnect support: ${supportsReconnect ? 'Yes' : 'No'}`);
    
    return { 
      success: true, 
      version, 
      supportsReconnect 
    };
  } catch (error) {
    console.error(`❌ FFmpeg verification failed: ${error.message}`);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

/**
 * Get FFmpeg version information
 */
export const getFfmpegVersion = (ffmpegPath) => {
  try {
    const output = execSync(`${ffmpegPath} -version`, { encoding: 'utf8' });
    const lines = output.split('\n');
    return {
      version: lines[0],
      libavcodec: lines.find(l => l.includes('libavcodec'))?.trim() || '',
      libavformat: lines.find(l => l.includes('libavformat'))?.trim() || '',
      configuration: lines.find(l => l.includes('configuration:'))?.trim() || '',
    };
  } catch (error) {
    return null;
  }
};

/**
 * Check if FFmpeg supports specific options
 */
export const supportsOption = (ffmpegPath, option) => {
  try {
    const help = execSync(`${ffmpegPath} -h full`, { encoding: 'utf8' });
    return help.includes(`-${option}`);
  } catch (_) {
    return false;
  }
};

// Singleton instance
let ffmpegInstance = null;

/**
 * Get or create FFmpeg instance with caching
 */
export const getFFmpegInstance = () => {
  if (!ffmpegInstance) {
    const path = getFfmpegPath();
    const verification = verifyFfmpeg(path);
    
    if (!verification.success) {
      throw new Error(`FFmpeg not available: ${verification.error}`);
    }
    
    ffmpegInstance = {
      path,
      version: verification.version,
      supportsReconnect: verification.supportsReconnect,
    };
  }
  return ffmpegInstance;
};

export default {
  getFfmpegPath,
  verifyFfmpeg,
  getFfmpegVersion,
  supportsOption,
  getFFmpegInstance,
};