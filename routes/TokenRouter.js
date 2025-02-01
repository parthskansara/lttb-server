import express from 'express'
import TokenController from '../controllers/TokenController.js';

const router = express.Router();

router.get('/', TokenController.getAccessToken);

export default router;