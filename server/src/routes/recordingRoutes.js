// backend/src/routes/recordingRoutes.js
import express from 'express';
import { recordingController } from '../controllers/recordingController.js';
import { authenticate } from '../middlewares/auth.middleware.js';


const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Recording CRUD
router.post('/start', recordingController.startRecording);
router.post('/:recordingId/stop', recordingController.stopRecording);
router.get('/list', recordingController.getRecordings);
router.get('/active', recordingController.getActiveRecordings);
router.get('/:recordingId', recordingController.getRecordingById);
router.put('/:recordingId', recordingController.updateRecording);
router.delete('/:recordingId', recordingController.deleteRecording);

// Download and export
router.get('/:recordingId/download', recordingController.downloadRecording);
router.get('/export', recordingController.exportRecordings);
router.post('/bulk-delete', recordingController.bulkDeleteRecordings);

// Preview and streaming
router.get('/:recordingId/stream', recordingController.getStreamUrl);
router.get('/:recordingId/segments', recordingController.getRecordingSegments);
router.post('/:recordingId/thumbnail', recordingController.generateThumbnail);

// Editing
router.post('/:recordingId/trim', recordingController.trimRecording);
router.post('/merge', recordingController.mergeRecordings);
// router.post('/:recordingId/convert', recordingController.convertFormat);

// Sharing
router.post('/:recordingId/share', recordingController.shareRecording);

// Filtering
router.get('/date-range', recordingController.getRecordingsByDate);
router.get('/by-camera', recordingController.getRecordingsByCamera);
router.get('/by-child', recordingController.getRecordingsByChild);

// Stats
router.get('/stats', recordingController.getRecordingStats);

// Scheduling
router.post('/schedule', recordingController.scheduleRecording);
// router.get('/scheduled', recordingController.getScheduledRecordings);
// router.delete('/scheduled/:scheduleId', recordingController.cancelScheduledRecording);
// router.put('/scheduled/:scheduleId', recordingController.updateScheduledRecording);

export const RecordingRoute= router;