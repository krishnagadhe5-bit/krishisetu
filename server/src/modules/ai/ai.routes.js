import { Router } from 'express';
import multer from 'multer';
import { AiController } from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { aiLimiter } from '../../middleware/rateLimiter.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
    }
  },
});

const router = Router();

router.use(authenticate);
router.use(aiLimiter);

router.post('/recommend-crop', AiController.recommendCrop);
router.post('/analyze-disease', upload.single('image'), AiController.analyzeDisease);
router.post('/irrigation/:farmId', AiController.getIrrigationRecommendation);
router.post('/chat', AiController.askAssistant);

export default router;
