// services/webrtc.service.js
import mediasoup from 'mediasoup';
import { spawn } from 'child_process';

class WebRTCService {
  constructor() {
    this.worker = null;
    this.router = null;
    this.transports = new Map();
    this.producers = new Map();
    this.consumers = new Map();
    this.streamProcesses = new Map();
    this.activeStreams = new Set();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return this;

    try {
      this.worker = await mediasoup.createWorker({
        rtcMinPort: 10000,
        rtcMaxPort: 10100,
        logLevel: 'warn',
      });

      this.router = await this.worker.createRouter({
        mediaCodecs: [
          {
            kind: 'video',
            mimeType: 'video/H264',
            clockRate: 90000,
            parameters: {
              'packetization-mode': 1,
              'profile-level-id': '42e01f',
              'level-asymmetry-allowed': 1,
            },
          },
          {
            kind: 'video',
            mimeType: 'video/VP8',
            clockRate: 90000,
            parameters: {},
          },
          {
            kind: 'audio',
            mimeType: 'audio/opus',
            clockRate: 48000,
            channels: 2,
          },
          {
            kind: 'audio',
            mimeType: 'audio/PCMU',
            clockRate: 8000,
          },
        ],
      });

      this.initialized = true;
      console.log('WebRTC Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize WebRTC Service:', error);
      throw error;
    }

    return this;
  }

  async createStream(cameraId, rtspUrl, streamSettings = {}) {
    await this.initialize();

    if (this.streamProcesses.has(cameraId)) {
      return this.streamProcesses.get(cameraId);
    }

    try {
      // Create transport
      const transport = await this.router.createWebRtcTransport({
        listenIps: [
          {
            ip: '0.0.0.0',
            announcedIp: process.env.SERVER_IP || '127.0.0.1',
          },
        ],
        enableUdp: true,
        enableTcp: false,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 1000000,
      });

      // Start FFmpeg process
      const resolution = streamSettings.resolution || '1280x720';
      const fps = streamSettings.fps || 25;
      const bitrate = streamSettings.bitrate || 1000;

      const ffmpeg = spawn('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-vf', `scale=${resolution}`,
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-b:v', `${bitrate}k`,
        '-maxrate', `${Math.round(bitrate * 1.5)}k`,
        '-bufsize', `${bitrate * 2}k`,
        '-pix_fmt', 'yuv420p',
        '-g', '30',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-f', 'rtp',
        `rtp://127.0.0.1:${transport.rtpPort}`,
      ]);

      ffmpeg.stderr.on('data', (data) => {
        console.log(`FFmpeg ${cameraId}:`, data.toString());
      });

      ffmpeg.on('error', (error) => {
        console.error(`FFmpeg error for ${cameraId}:`, error);
        this.streamProcesses.delete(cameraId);
        this.activeStreams.delete(cameraId);
      });

      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg ${cameraId} closed with code ${code}`);
        this.streamProcesses.delete(cameraId);
        this.activeStreams.delete(cameraId);
      });

      this.streamProcesses.set(cameraId, { transport, ffmpeg });
      this.activeStreams.add(cameraId);

      // Create producer
      const producer = await transport.produce({
        kind: 'video',
        rtpParameters: {
          codecs: [
            {
              mimeType: 'video/H264',
              clockRate: 90000,
              payloadType: 96,
              parameters: {
                'packetization-mode': 1,
                'profile-level-id': '42e01f',
                'level-asymmetry-allowed': 1,
              },
            },
          ],
          encodings: [
            { maxBitrate: bitrate * 1000 },
          ],
        },
      });

      this.producers.set(cameraId, producer);

      return { transport, producer, ffmpeg };
    } catch (error) {
      console.error('Error creating stream:', error);
      throw error;
    }
  }

  async createWebRTCTransport(transportId, sdpOffer) {
    await this.initialize();

    // Check if transport exists
    if (!this.transports.has(transportId)) {
      const transport = await this.router.createWebRtcTransport({
        listenIps: [
          {
            ip: '0.0.0.0',
            announcedIp: process.env.SERVER_IP || '127.0.0.1',
          },
        ],
        enableUdp: true,
        enableTcp: false,
        preferUdp: true,
        initialAvailableOutgoingBitrate: 1000000,
      });

      this.transports.set(transportId, { transport, consumers: [] });
    }

    const { transport } = this.transports.get(transportId);

    // Connect transport
    await transport.connect({
      dtlsParameters: sdpOffer.dtlsParameters,
    });

    // Create consumers for each producer
    const consumers = [];
    for (const [cameraId, producer] of this.producers) {
      const consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: sdpOffer.rtpCapabilities,
        paused: false,
      });

      consumers.push(consumer);
      this.consumers.set(consumer.id, { cameraId, consumer, transport });
    }

    this.transports.get(transportId).consumers = consumers;

    // Generate SDP answer
    const sdpAnswer = {
      type: 'answer',
      sdp: await transport.createSdpAnswer(),
    };

    return { sdpAnswer, consumers };
  }

  async stopStream(cameraId) {
    // Stop FFmpeg process
    if (this.streamProcesses.has(cameraId)) {
      const { ffmpeg } = this.streamProcesses.get(cameraId);
      ffmpeg.kill('SIGTERM');
      this.streamProcesses.delete(cameraId);
    }

    // Close producer
    if (this.producers.has(cameraId)) {
      const producer = this.producers.get(cameraId);
      producer.close();
      this.producers.delete(cameraId);
    }

    this.activeStreams.delete(cameraId);
  }

  async getStreamStats(cameraId) {
    if (this.producers.has(cameraId)) {
      try {
        const producer = this.producers.get(cameraId);
        const stats = await producer.getStats();
        return stats;
      } catch (error) {
        console.error('Error getting stats:', error);
        return null;
      }
    }
    return null;
  }

  isStreamActive(cameraId) {
    return this.activeStreams.has(cameraId);
  }

  getActiveStreamIds() {
    return Array.from(this.activeStreams);
  }

  async closeAllTransports() {
    for (const [id, data] of this.transports) {
      data.transport.close();
    }
    this.transports.clear();
  }

  async cleanup() {
    // Stop all streams
    for (const cameraId of this.activeStreams) {
      await this.stopStream(cameraId);
    }

    // Close all transports
    await this.closeAllTransports();

    // Close router
    if (this.router) {
      this.router.close();
    }

    // Close worker
    if (this.worker) {
      this.worker.close();
    }

    this.initialized = false;
  }
}

// Export singleton instance
const webrtcService = new WebRTCService();
export default webrtcService;