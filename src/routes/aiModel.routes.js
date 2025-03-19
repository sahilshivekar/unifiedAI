// aiModel.router.js
import { Router } from 'express';
import {
    addAiModel,
    getAiModels,
    getAiModelById,
    updateAiModel,
    deleteAiModel,
} from '../controllers/aiModel.controller.js';
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

// Get all AI Models (public)
router.route('/get-models').get(getAiModels);

// Get a specific AI Model by id
router.route('/get-model').get(getAiModelById);

//! the routes below should only accessed by the admin but as we are not creating any admin
//! these api's except the one for getting AI Models should not be used on the client side

// Create a new AI Model (admin-only)
router.route('/add').post(upload.single("logo"), addAiModel);

// Update an AI Model by id
router.route('/update').put(upload.single("logo"), updateAiModel);

// Delete an AI Model by ID (admin-only)
router.route('/remove').delete(deleteAiModel);

export default router;