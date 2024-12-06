import ProfileController from '../controllers/ProfileController.js'
import express from 'express'

const router = express.Router();

router.get('/:access_token', ProfileController.getProfile);

export default router;