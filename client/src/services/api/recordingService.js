// // frontend/src/services/recordingService.js

// import api from "../api";

// export const recordingService = {
//   // Start a new recording
//   async startRecording(params) {
//     const response = await api.post("/api/recordings/start", params);
//     return response.data;
//   },

//   // Stop an active recording
//   async stopRecording(recordingId) {
//     const response = await api.post(`/api/recordings/${recordingId}/stop`);
//     return response.data;
//   },

//   // Get list of recordings with filters
//   async getRecordings(filters = {}) {
//     const queryParams = new URLSearchParams();

//     // Add filters to query params
//     Object.keys(filters).forEach((key) => {
//       if (
//         filters[key] !== undefined &&
//         filters[key] !== null &&
//         filters[key] !== ""
//       ) {
//         queryParams.append(key, filters[key]);
//       }
//     });

//     const queryString = queryParams.toString();
//     const url = `/api/recordings/list${queryString ? `?${queryString}` : ""}`;

//     const response = await api.get(url);
//     return response.data;
//   },

//   // Get active recordings
//   async getActiveRecordings() {
//     const response = await api.get("/api/recordings/active");
//     return response.data;
//   },

//   // Download a recording
//   async downloadRecording(recordingId, format = "mp4") {
//     try {
//       const response = await api.get(
//         `/api/recordings/${recordingId}/download`,
//         {
//           params: { format },
//           responseType: "blob", // Important for file download
//         },
//       );

//       // Create download link
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement("a");
//       link.href = url;

//       // Get filename from Content-Disposition header or use default
//       const contentDisposition = response.headers["content-disposition"];
//       let filename = `recording_${recordingId}.${format}`;

//       if (contentDisposition) {
//         const filenameMatch = contentDisposition.match(
//           /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
//         );
//         if (filenameMatch && filenameMatch[1]) {
//           filename = filenameMatch[1].replace(/['"]/g, "");
//         }
//       }

//       link.setAttribute("download", filename);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);

//       return { success: true, filename };
//     } catch (error) {
//       console.error("Download error:", error);
//       throw error;
//     }
//   },

//   // Delete a recording
//   async deleteRecording(recordingId) {
//     const response = await api.delete(`/api/recordings/${recordingId}`);
//     return response.data;
//   },

//   // Get recording stats
//   async getRecordingStats() {
//     const response = await api.get("/api/recordings/stats");
//     return response.data;
//   },

//   // Get recording by ID
//   async getRecordingById(recordingId) {
//     const response = await api.get(`/api/recordings/${recordingId}`);
//     return response.data;
//   },

//   // Update recording metadata
//   async updateRecording(recordingId, data) {
//     const response = await api.put(`/recordings/${recordingId}`, data);
//     return response.data;
//   },

//   // Generate thumbnail for recording
//   async generateThumbnail(recordingId) {
//     const response = await api.post(`/api/recordings/${recordingId}/thumbnail`);
//     return response.data;
//   },

//   // Bulk delete recordings
//   async bulkDeleteRecordings(recordingIds) {
//     const response = await api.post("/api/recordings/bulk-delete", {
//       recordingIds,
//     });
//     return response.data;
//   },

//   // Export recordings
//   async exportRecordings(filters = {}) {
//     const response = await api.get("/api/recordings/export", {
//       params: filters,
//       responseType: "blob",
//     });

//     // Create download link
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", `recordings_export_${Date.now()}.zip`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//     window.URL.revokeObjectURL(url);

//     return { success: true };
//   },

//   // Get recording stream URL (for preview)
//   async getStreamUrl(recordingId) {
//     const response = await api.get(`/api/recordings/${recordingId}/stream`);
//     return response.data;
//   },

//   // Get recording segments (for long recordings)
//   async getRecordingSegments(recordingId) {
//     const response = await api.get(`/api/recordings/${recordingId}/segments`);
//     return response.data;
//   },

//   // Trim recording
//   async trimRecording(recordingId, startTime, endTime) {
//     const response = await api.post(`/api/recordings/${recordingId}/trim`, {
//       startTime,
//       endTime,
//     });
//     return response.data;
//   },

//   // Merge multiple recordings
//   async mergeRecordings(recordingIds, options = {}) {
//     const response = await api.post("/api/recordings/merge", {
//       recordingIds,
//       ...options,
//     });
//     return response.data;
//   },

//   // Get recording shareable link
//   async getShareLink(recordingId, options = {}) {
//     const response = await api.post(
//       `/api/recordings/${recordingId}/share`,
//       options,
//     );
//     return response.data;
//   },

//   // Get recordings by date range
//   async getRecordingsByDate(startDate, endDate, filters = {}) {
//     const params = {
//       startDate,
//       endDate,
//       ...filters,
//     };
//     const response = await api.get("/api/recordings/date-range", { params });
//     return response.data;
//   },

//   // Get recordings by camera
//   async getRecordingsByCamera(cameraId, filters = {}) {
//     const params = {
//       cameraId,
//       ...filters,
//     };
//     const response = await api.get("/api/recordings/by-camera", { params });
//     return response.data;
//   },

//   // Get recordings by child
//   async getRecordingsByChild(childId, filters = {}) {
//     const params = {
//       childId,
//       ...filters,
//     };
//     const response = await api.get("/api/recordings/by-child", { params });
//     return response.data;
//   },

//   // Get recording quality info
//   async getRecordingQuality(recordingId) {
//     const response = await api.get(`/api/recordings/${recordingId}/quality`);
//     return response.data;
//   },

//   // Convert recording format
//   async convertFormat(recordingId, targetFormat) {
//     const response = await api.post(`/api/recordings/${recordingId}/convert`, {
//       format: targetFormat,
//     });
//     return response.data;
//   },

//   // Get recording download progress
//   async getDownloadProgress(recordingId) {
//     const response = await api.get(
//       `/api/recordings/${recordingId}/download-progress`,
//     );
//     return response.data;
//   },

//   // Schedule recording
//   async scheduleRecording(scheduleData) {
//     const response = await api.post("/api/recordings/schedule", scheduleData);
//     return response.data;
//   },

//   // Get scheduled recordings
//   async getScheduledRecordings() {
//     const response = await api.get("/api/recordings/scheduled");
//     return response.data;
//   },

//   // Cancel scheduled recording
//   async cancelScheduledRecording(scheduleId) {
//     const response = await api.delete(
//       `/api/recordings/scheduled/${scheduleId}`,
//     );
//     return response.data;
//   },

//   // Update scheduled recording
//   async updateScheduledRecording(scheduleId, data) {
//     const response = await api.put(
//       `/api/recordings/scheduled/${scheduleId}`,
//       data,
//     );
//     return response.data;
//   },
// };


// frontend/src/services/recordingService.js
import api from "../api";

// Helper function to handle different response types
const handleResponse = async (response, responseType = 'json') => {
  if (responseType === 'blob') {
    return response;
  }
  return response.data;
};

// Helper to create FormData for file uploads
const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      if (data[key] instanceof File || data[key] instanceof Blob) {
        formData.append(key, data[key]);
      } else if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    }
  });
  return formData;
};

export const recordingService = {
  // Start a new recording
  async startRecording(params) {
    try {
      console.log('📹 Starting recording with params:', params);
      const response = await api.post("/api/recordings/start", params, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Start recording error:', error);
      throw error;
    }
  },

  // Stop an active recording
  async stopRecording(recordingId) {
    try {
      console.log('⏹️ Stopping recording:', recordingId);
      const response = await api.post(`/api/recordings/${recordingId}/stop`, {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Stop recording error:', error);
      throw error;
    }
  },

  // Get list of recordings with filters
  async getRecordings(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      // Add filters to query params
      Object.keys(filters).forEach((key) => {
        if (
          filters[key] !== undefined &&
          filters[key] !== null &&
          filters[key] !== ""
        ) {
          queryParams.append(key, filters[key]);
        }
      });

      const queryString = queryParams.toString();
      const url = `/api/recordings/list${queryString ? `?${queryString}` : ""}`;

      console.log('📋 Fetching recordings:', url);
      const response = await api.get(url, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recordings error:', error);
      throw error;
    }
  },

  // Get active recordings
  async getActiveRecordings() {
    try {
      console.log('📡 Fetching active recordings');
      const response = await api.get("/api/recordings/active", {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get active recordings error:', error);
      throw error;
    }
  },

  // Download a recording with progress tracking
  async downloadRecording(recordingId, format = "mp4", onProgress = null) {
    try {
      console.log('⬇️ Downloading recording:', recordingId, 'format:', format);
      
      const response = await api.get(
        `/api/recordings/${recordingId}/download`,
        {
          params: { format },
          responseType: "blob",
          headers: {
            'Accept': `video/${format}`,
          },
          onDownloadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          }
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers["content-disposition"];
      let filename = `recording_${recordingId}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    } catch (error) {
      console.error("Download error:", error);
      throw error;
    }
  },

  // Delete a recording
  async deleteRecording(recordingId) {
    try {
      console.log('🗑️ Deleting recording:', recordingId);
      const response = await api.delete(`/api/recordings/${recordingId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Delete recording error:', error);
      throw error;
    }
  },

  // Get recording stats
  async getRecordingStats() {
    try {
      console.log('📊 Fetching recording stats');
      const response = await api.get("/api/recordings/stats", {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recording stats error:', error);
      throw error;
    }
  },

  // Get recording by ID
  async getRecordingById(recordingId) {
    try {
      console.log('🔍 Fetching recording:', recordingId);
      const response = await api.get(`/api/recordings/${recordingId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recording error:', error);
      throw error;
    }
  },

  // Update recording metadata
  async updateRecording(recordingId, data) {
    try {
      console.log('✏️ Updating recording:', recordingId, data);
      const response = await api.put(`/api/recordings/${recordingId}`, data, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Update recording error:', error);
      throw error;
    }
  },

  // Generate thumbnail for recording
  async generateThumbnail(recordingId) {
    try {
      console.log('🖼️ Generating thumbnail for:', recordingId);
      const response = await api.post(
        `/api/recordings/${recordingId}/thumbnail`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Generate thumbnail error:', error);
      throw error;
    }
  },

  // Bulk delete recordings
  async bulkDeleteRecordings(recordingIds) {
    try {
      console.log('🗑️ Bulk deleting recordings:', recordingIds.length);
      const response = await api.post(
        "/api/recordings/bulk-delete",
        { recordingIds },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw error;
    }
  },

  // Export recordings as ZIP
  async exportRecordings(filters = {}, onProgress = null) {
    try {
      console.log('📦 Exporting recordings with filters:', filters);
      const response = await api.get("/api/recordings/export", {
        params: filters,
        responseType: "blob",
        headers: {
          'Accept': 'application/zip',
        },
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        }
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `recordings_export_${Date.now()}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Export recordings error:', error);
      throw error;
    }
  },

  // Get recording stream URL (for preview)
  async getStreamUrl(recordingId) {
    try {
      console.log('🎥 Getting stream URL for:', recordingId);
      const response = await api.get(`/api/recordings/${recordingId}/stream`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get stream URL error:', error);
      throw error;
    }
  },

  // Get recording segments (for long recordings)
  async getRecordingSegments(recordingId) {
    try {
      console.log('📑 Getting segments for:', recordingId);
      const response = await api.get(`/api/recordings/${recordingId}/segments`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get segments error:', error);
      throw error;
    }
  },

  // Trim recording
  async trimRecording(recordingId, startTime, endTime) {
    try {
      console.log('✂️ Trimming recording:', recordingId, startTime, endTime);
      const response = await api.post(
        `/api/recordings/${recordingId}/trim`,
        { startTime, endTime },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Trim recording error:', error);
      throw error;
    }
  },

  // Merge multiple recordings
  async mergeRecordings(recordingIds, options = {}) {
    try {
      console.log('🔄 Merging recordings:', recordingIds.length);
      const response = await api.post(
        "/api/recordings/merge",
        { recordingIds, ...options },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Merge recordings error:', error);
      throw error;
    }
  },

  // Get recording shareable link
  async getShareLink(recordingId, options = {}) {
    try {
      console.log('🔗 Getting share link for:', recordingId);
      const response = await api.post(
        `/api/recordings/${recordingId}/share`,
        options,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get share link error:', error);
      throw error;
    }
  },

  // Get recordings by date range
  async getRecordingsByDate(startDate, endDate, filters = {}) {
    try {
      const params = {
        startDate,
        endDate,
        ...filters,
      };
      console.log('📅 Getting recordings by date:', params);
      const response = await api.get("/api/recordings/date-range", {
        params,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recordings by date error:', error);
      throw error;
    }
  },

  // Get recordings by camera
  async getRecordingsByCamera(cameraId, filters = {}) {
    try {
      const params = {
        cameraId,
        ...filters,
      };
      console.log('📷 Getting recordings by camera:', cameraId);
      const response = await api.get("/api/recordings/by-camera", {
        params,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recordings by camera error:', error);
      throw error;
    }
  },

  // Get recordings by child
  async getRecordingsByChild(childId, filters = {}) {
    try {
      const params = {
        childId,
        ...filters,
      };
      console.log('👶 Getting recordings by child:', childId);
      const response = await api.get("/api/recordings/by-child", {
        params,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get recordings by child error:', error);
      throw error;
    }
  },

  // Get recording quality info
  async getRecordingQuality(recordingId) {
    try {
      console.log('📊 Getting quality info for:', recordingId);
      const response = await api.get(`/api/recordings/${recordingId}/quality`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get quality info error:', error);
      throw error;
    }
  },

  // Convert recording format
  async convertFormat(recordingId, targetFormat) {
    try {
      console.log('🔄 Converting format:', recordingId, 'to', targetFormat);
      const response = await api.post(
        `/api/recordings/${recordingId}/convert`,
        { format: targetFormat },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Convert format error:', error);
      throw error;
    }
  },

  // Get recording download progress
  async getDownloadProgress(recordingId) {
    try {
      console.log('📊 Getting download progress for:', recordingId);
      const response = await api.get(
        `/api/recordings/${recordingId}/download-progress`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get download progress error:', error);
      throw error;
    }
  },

  // Schedule recording
  async scheduleRecording(scheduleData) {
    try {
      console.log('📅 Scheduling recording:', scheduleData);
      const response = await api.post("/api/recordings/schedule", scheduleData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Schedule recording error:', error);
      throw error;
    }
  },

  // Get scheduled recordings
  async getScheduledRecordings() {
    try {
      console.log('📅 Getting scheduled recordings');
      const response = await api.get("/api/recordings/scheduled", {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get scheduled recordings error:', error);
      throw error;
    }
  },

  // Cancel scheduled recording
  async cancelScheduledRecording(scheduleId) {
    try {
      console.log('❌ Cancelling scheduled recording:', scheduleId);
      const response = await api.delete(
        `/api/recordings/scheduled/${scheduleId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cancel scheduled recording error:', error);
      throw error;
    }
  },

  // Update scheduled recording
  async updateScheduledRecording(scheduleId, data) {
    try {
      console.log('✏️ Updating scheduled recording:', scheduleId);
      const response = await api.put(
        `/api/recordings/scheduled/${scheduleId}`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Update scheduled recording error:', error);
      throw error;
    }
  },

  // Upload recording file (for external recordings)
  async uploadRecording(file, metadata = {}) {
    try {
      console.log('📤 Uploading recording:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });

      const response = await api.post("/api/recordings/upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload recording error:', error);
      throw error;
    }
  },

  // Get recording preview thumbnail
  async getThumbnail(recordingId, time = 0) {
    try {
      console.log('🖼️ Getting thumbnail for:', recordingId, 'at:', time);
      const response = await api.get(`/api/recordings/${recordingId}/thumbnail`, {
        params: { time },
        responseType: 'blob',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      // Create object URL for the thumbnail
      const url = window.URL.createObjectURL(response.data);
      return url;
    } catch (error) {
      console.error('Get thumbnail error:', error);
      throw error;
    }
  },

  // Stream recording (for playback)
  async streamRecording(recordingId, options = {}) {
    try {
      console.log('📺 Streaming recording:', recordingId);
      const response = await api.get(`/api/recordings/${recordingId}/stream`, {
        params: options,
        responseType: 'stream',
        headers: {
          'Accept': 'video/*',
        }
      });
      return response;
    } catch (error) {
      console.error('Stream recording error:', error);
      throw error;
    }
  }
};

export default recordingService;