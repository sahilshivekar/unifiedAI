import AiModel from '../db/models/aiModel.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import { Op } from 'sequelize'

// Create a new AI Model
const addAiModel = asyncHandler(async (req, res) => {
    const { name, modelGenerationType } = req.body; // camelCase req.body
    let logoSecureUrl = null;
    let logoPublicId = null;
    const logoLocalPath = req?.file?.path;

    if (!name || !modelGenerationType) {
        if (logoLocalPath) {
            fs.unlinkSync(logoLocalPath);
        }
        throw new ApiError(400, "Name and modelGenerationType are required");
    }

    if (logoLocalPath) {
        const logo = await uploadOnCloudinary(logoLocalPath);
        if (!logo?.url) {
            throw new ApiError(500, "Some issue occurred while uploading the logo");
        }

        logoSecureUrl = logo.secure_url;
        logoPublicId = logo.public_id;
    }

    const aiModel = await AiModel.create({
        name,
        logo_secure_url: logoSecureUrl,
        logo_public_id: logoPublicId,
        model_generation_type: modelGenerationType,
    });

    if (!aiModel) {
        throw new ApiError(500, "Some issue occurred while adding the AI Model");
    }
    res.status(201).json(new ApiResponse(201, "AI Model added successfully", aiModel));
});

// Get all AI Models
const getAiModels = asyncHandler(async (req, res) => {
    const { modelGenerationType } = req.query;
    if (
        modelGenerationType &&
        (modelGenerationType !== 'text' && modelGenerationType !== 'image')
    ) {
        throw new ApiError(400, "Model generation type can only be text or image");
    }
    const aiModels = await AiModel.findAll({
        where: {
            [Op.and]: [
                ...[modelGenerationType ? { model_generation_type: modelGenerationType } : null],
            ]
        }
    });

    res.status(200).json(new ApiResponse(200, "AI Models retrieved successfully", aiModels));
});

// Get a specific AI Model by ID
const getAiModelById = asyncHandler(async (req, res) => {
    const { id } = req.query

    if (!id) {
        throw new ApiError(400, "ID is required");
    }

    const aiModel = await AiModel.findByPk(id);

    if (!aiModel) {
        throw new ApiError(404, "AI Model not found");
    }

    res.status(200).json(new ApiResponse(200, "AI Model retrieved successfully", aiModel));
});

// Update an AI Model by ID
const updateAiModel = asyncHandler(async (req, res) => {
    const { name, modelGenerationType, id } = req.body; // camelCase req.body

    let logoSecureUrl = null;
    let logoPublicId = null;
    const logoLocalPath = req?.file?.path;

    const aiModel = await AiModel.findByPk(id);

    if (!aiModel) {
        if (logoLocalPath) {
            fs.unlinkSync(logoLocalPath);
        }
        throw new ApiError(404, "AI Model not found");
    }

    if (logoLocalPath) {
        const logo = await uploadOnCloudinary(logoLocalPath);
        if (!logo?.url) {
            fs.unlinkSync(logoLocalPath);
            throw new ApiError(500, "Some issue occurred while uploading the logo");
        }

        logoSecureUrl = logo.secure_url;
        logoPublicId = logo.public_id;

        if (aiModel.logo_public_id) {
            await deleteFromCloudinary(aiModel.logo_public_id);
        }
    }

    aiModel.name = name || aiModel.name;
    aiModel.model_generation_type = modelGenerationType || aiModel.model_generation_type;
    aiModel.logo_secure_url = logoSecureUrl || aiModel.logo_secure_url;
    aiModel.logo_public_id = logoPublicId || aiModel.logo_public_id;

    await aiModel.save();

    res.status(200).json(new ApiResponse(200, "AI Model updated successfully", aiModel));
});

// Delete an AI Model by ID
const deleteAiModel = asyncHandler(async (req, res) => {
    const { id } = req.query

    if (!id) {
        throw new ApiError(400, "ID is required");
    }

    const aiModel = await AiModel.findByPk(id);

    if (!aiModel) {
        throw new ApiError(404, "AI Model not found");
    }

    if (aiModel.logo_public_id) {
        await deleteFromCloudinary(aiModel.logo_public_id);
    }

    await aiModel.destroy();
    res.status(200).json(new ApiResponse(200, "AI Model deleted successfully", null));
});

export {
    addAiModel,
    getAiModels,
    getAiModelById,
    updateAiModel,
    deleteAiModel,
};