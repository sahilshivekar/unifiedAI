// promptResponse.router.js
import { Router } from 'express';
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    getPromptResponse,
    getUsedModelsInChat,
    getAllChats,
    getChatHistory
} from '../controllers/chat.controller.js';
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/get-reply-from-ai").post(upload.single("file"), verifyJWT, getPromptResponse);

router.route("/get-used-models-in-chat").post(verifyJWT, getUsedModelsInChat);

router.route("/get-all-chats").post(verifyJWT, getAllChats);

router.route("/get-chat-history").post(verifyJWT, getChatHistory);

export default router;