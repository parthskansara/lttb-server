import PlaylistController from '../controllers/PlaylistController.js';
import express from 'express';

const router = express.Router();

router.post('/', PlaylistController.createPlaylistForFollower);

export default router;