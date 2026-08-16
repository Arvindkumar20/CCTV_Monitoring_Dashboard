// backend/src/routes/storageRoutes.js
import express from 'express';
import { storageController } from '../controllers/storageController.js';
import { authenticate } from '../middlewares/auth.middleware.js';


const router = express.Router();

router.use(authenticate);

router.get('/config', storageController.getStorageConfig);
router.put('/config', storageController.updateStorageConfig);
router.get('/usage', storageController.getStorageUsage);
router.get('/metrics', storageController.getStorageMetrics);
router.get('/availability/:storageType', storageController.checkStorageAvailability);
router.post('/external/connect', storageController.connectExternalStorage);
router.post('/external/disconnect/:deviceId', storageController.disconnectExternalStorage);

export const storageRouter= router;