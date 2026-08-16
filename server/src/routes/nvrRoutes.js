// backend/src/routes/nvrRoutes.js
import express from 'express';
import { nvrController } from '../controllers/nvrController.js';
import { authenticate } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.use(authenticate);

router.post('/', nvrController.addNVRDevice);
router.get('/', nvrController.getNVRDevices);
router.get('/:deviceId', nvrController.getNVRDevice);
router.put('/:deviceId', nvrController.updateNVRDevice);
router.delete('/:deviceId', nvrController.deleteNVRDevice);
router.post('/:deviceId/test', nvrController.testNVRConnection);
router.post('/start', nvrController.startNVRRecording);
router.post('/:deviceId/:cameraId/stop', nvrController.stopNVRRecording);
router.get('/:deviceId/:cameraId/stream', nvrController.getNVRCameraStream);

export const NVRRouter= router;