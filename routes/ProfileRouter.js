import ProfileController from '../controllers/ProfileController.js'
import express from 'express'

const router = express.Router();

router.get('/', ProfileController.getProfile);
router.get('/artists', ProfileController.getTopArtists);

export default router;