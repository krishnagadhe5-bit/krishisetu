import { Router } from 'express';
import { ConsultationsController } from './consultations.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', ConsultationsController.createConsultation);
router.get('/', ConsultationsController.getConsultations);
router.get('/:id', ConsultationsController.getConsultationById);
router.post('/:id/messages', ConsultationsController.addMessage);
router.patch('/:id/close', ConsultationsController.closeConsultation);

export default router;
