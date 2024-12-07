import LoginController from "../controllers/LoginController.js";
import express from 'express'

const router = express.Router();

router.get('/', LoginController.getUrl);

router.delete('/', LoginController.logOut);

export default router;