// promptResponse.router.js
import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getPromptResponse
} from '../controllers/chat.controller.js';
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/get-reply-from-ai").post(upload.single("file"), verifyJWT, getPromptResponse);


export default router;