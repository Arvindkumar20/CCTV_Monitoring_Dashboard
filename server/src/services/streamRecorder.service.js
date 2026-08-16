// services/streamRecorder.service.js
export class StreamRecorderService {
  constructor() {
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.stream = null;
    this.isRecording = false;
    this.recordingStartTime = null;
    this.recordingDuration = 0;
    this.timerInterval = null;
  }

  // Start recording from video element
  async startRecording(videoElement) {
    try {
      // Check if video is playing
      if (!videoElement || videoElement.paused) {
        throw new Error("Video is not playing");
      }

      // Get the stream from video element
      const stream = videoElement.captureStream ? 
        videoElement.captureStream() : 
        videoElement.srcObject;

      if (!stream) {
        throw new Error("Cannot capture stream from video");
      }

      this.stream = stream;
      this.recordedChunks = [];
      this.isRecording = true;
      this.recordingStartTime = Date.now();

      // Check supported MIME types
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];

      let selectedMimeType = mimeTypes.find(type => 
        MediaRecorder.isTypeSupported(type)
      );

      if (!selectedMimeType) {
        selectedMimeType = 'video/webm';
      }

      // Create MediaRecorder
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps for good quality
      });

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        this.isRecording = false;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      };

      // Handle errors
      this.mediaRecorder.onerror = (event) => {
        console.error("Recording error:", event);
        this.isRecording = false;
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      };

      // Start recording with timeslice for smooth saving
      this.mediaRecorder.start(1000); // Save every second

      // Start timer
      this.timerInterval = setInterval(() => {
        this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
      }, 1000);

      return true;
    } catch (error) {
      console.error("Failed to start recording:", error);
      this.isRecording = false;
      throw error;
    }
  }

  // Stop recording and return blob
  async stopRecording() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
          reject(new Error("No active recording"));
          return;
        }

        this.isRecording = false;
        
        if (this.timerInterval) {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }

        // Stop recording
        this.mediaRecorder.onstop = () => {
          try {
            // Create blob from recorded chunks
            const mimeType = this.mediaRecorder.mimeType || 'video/webm';
            const blob = new Blob(this.recordedChunks, { type: mimeType });
            
            // Reset
            this.recordedChunks = [];
            this.stream = null;
            this.recordingDuration = 0;
            
            resolve(blob);
          } catch (error) {
            reject(error);
          }
        };

        this.mediaRecorder.stop();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Pause recording
  pauseRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.isRecording = false;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      return true;
    }
    return false;
  }

  // Resume recording
  resumeRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.isRecording = true;
      this.recordingStartTime = Date.now() - (this.recordingDuration * 1000);
      
      this.timerInterval = setInterval(() => {
        this.recordingDuration = (Date.now() - this.recordingStartTime) / 1000;
      }, 1000);
      
      return true;
    }
    return false;
  }

  // Get recording status
  getStatus() {
    return {
      isRecording: this.isRecording,
      duration: this.recordingDuration,
      state: this.mediaRecorder?.state || 'inactive',
      chunksCount: this.recordedChunks?.length || 0,
    };
  }

  // Format duration
  formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}

// Singleton instance
export const streamRecorder = new StreamRecorderService();