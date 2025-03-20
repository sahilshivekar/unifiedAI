import { GoogleGenerativeAI } from "@google/generative-ai";
import PromptResponse from '../db/models/promptResponse.model.js';
import Chat from '../db/models/chat.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import User from "../db/models/user.model.js";
import {
    getTextResponseFromGemini,
    getChatHistoryWithRolePartFormat,
    supportedTextModels,
    geminiApiTextModels,
    generateChatName
} from '../utils/AiModelsUtils.js';
import { Op } from "sequelize";
import AiModel from "../db/models/aiModel.model.js";

const getPromptResponse = asyncHandler(async (req, res) => {

    const {
        chatId, // will be null if the chat is null
        promptText,
        selectedTextModels, // array of selected ai models ids
        selectedImageModels
    } = req.body

    if (!req?.user?.user_id) {
        throw new ApiError(400, "User Id not found")
    }

    if (!selectedTextModels) {
        throw new ApiError(400, "Selected ai models not found")
    }

    // check if all models are supported
    if (!selectedTextModels.every(model => supportedTextModels.includes(model.name))) {
        throw new ApiError(400, "Some selected ai models are not supported")
    }


    const user = await User.findByPk(req?.user?.user_id)

    if (!user) {
        throw new ApiError(400, "User with this id doesn't exists")
    }


    let conversation = [] //will be in role and part format
    let chat
    let textResponses = []

    if (chatId) {
        // if there are previous chats then get the history and add to existing conversation
        chat = await Chat.findByPk(chatId)
        if (!chat) {
            throw new ApiError(400, "Chat not found with given id")
        }
        conversation = await getChatHistoryWithRolePartFormat(chatId, true, false, false)
    } else {
        chat = await Chat.create({
            chat_title: "New Chat", // will be initially new chat after getting the response i will update it
            user_id: user.user_id
        })
        if (!chat) {
            throw new ApiError(500, "Some issue occured while creating new chat")
        }
    }

    //add the current prompt
    if (promptText) {
        conversation.push({
            role: "user",
            parts: [{ text: promptText }]
        })
    }

    // console.log(conversation)

    //!getting responses from the models
    // for (const model of selectedTextModels) {
    //     if (geminiApiTextModels.includes(model.name)) {
    //         textResponses.push({
    //             model: model,
    //             responseText: await getTextResponseFromGemini(
    //                 conversation,
    //                 model.name
    //             )
    //         })
    //     }
    // }
    const responsePromises = selectedTextModels
        .filter(model => geminiApiTextModels.includes(model.name))
        .map(async model => ({
            model: model,
            responseText: await getTextResponseFromGemini(conversation, model.name),
        }));

    textResponses = await Promise.all(responsePromises);

    const previousRank = await PromptResponse.findAll({
        where: {
            chat_id: chat.chat_id,
        },
        order: [['rank', 'DESC']],
        limit: 1,
    })

    const currentRank = previousRank.length > 0 ? previousRank[0].rank + 1 : 1

    textResponses.forEach(response => {
        conversation.push({
            role: "model",
            parts: response.responseText
        })
    })


    if(currentRank == 1){
        const chatName = await generateChatName(conversation)
        chat.chat_title = chatName
        await chat.save()
        
    }

    for (let textResponse of textResponses) {
        await PromptResponse.create({
            chat_id: chat.chat_id,
            prompt_text: promptText ? promptText : null,
            response_text: textResponse.responseText ? textResponse.responseText : null,
            ai_model_id: textResponse.model.id,
            rank: currentRank
        })
    }

    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Chat response generated successfully",
                {
                    chat: chat,
                    promptResponses: textResponses
                }
            )
        )

})


const getChatHistory = asyncHandler(async (req, res) => {
    const {
        chatId,
        aiModelId,
        isCombined,
        isBestPick
    } = req.body;

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required")
    }

    const chat = await Chat.findOne({ where: { chat_id: chatId } })

    if (!chat) {
        throw new ApiError(400, "Chat with given id not found")
    }

    const history = await getChatHistoryWithRolePartFormat(
        chatId,
        isCombined == true,
        isBestPick == true,
        aiModelId ? aiModelId : null,
        "all"
    )

    res
        .status(200)
        .json(
            new ApiResponse(
                "Chat history retrieved successfully",
                {
                    chat: chat,
                    history: history
                }
            )
        )
})

const getAllChats = asyncHandler(async (req, res) => {

    if (!req?.user?.user_id) {
        throw new ApiError(401, "Unauthorized")
    }

    const chats = await Chat.findAll({
        where: {
            user_id:req?.user?.user_id
        }
    })

    res
        .status(200)
        .json(
            new ApiResponse(
                "All chats retrieved successfully",
                {
                    chats: chats
                }
            )
        )
})


const getUsedModelsInChat = asyncHandler(async (req, res) => {

    const { chatId } = req.body

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required")
    }

    const chat = await Chat.findByPk(chatId)

    if (!chat) {
        throw new ApiError(400, "Chat not found")
    }

    const usedModels = await PromptResponse.findAll({
        where: {
            chat_id: chat.chat_id,
            is_combined: false,
            is_best_pick: false,
            rank: 1
        }
    })

    let usedModelsWithIdandName = []

    for (let usedModel of usedModels) {
        console.log(usedModel)
        const model = await AiModel.findByPk(usedModel.ai_model_id)
        usedModelsWithIdandName.push({
            id: model.ai_model_id,
            name: model.name
        })
    }


    res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "Used models retrieved successfully",
                {
                    usedModels: usedModelsWithIdandName
                }
            )
        )
})


export {
    getPromptResponse,
    getUsedModelsInChat,
    getAllChats,
    getChatHistory
}