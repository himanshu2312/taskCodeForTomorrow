import express from 'express';
import { addService, getServicesByCategory, updateService, deleteService } from '../controllers/services.js';

const router = express.Router();

router.post('/category/:categoryId/service', addService);
router.get('/category/:categoryId/services', getServicesByCategory);
router.put('/category/:categoryId/service/:serviceId', updateService);
router.delete('/category/:categoryId/service/:serviceId', deleteService);

export default router;
