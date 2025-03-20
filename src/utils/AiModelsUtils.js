import dotenv from "dotenv"
dotenv.config({ path: '.env' })

import { GoogleGenerativeAI } from "@google/generative-ai";
import PromptResponse from "../db/models/promptResponse.model.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
import { Op } from "sequelize";


const supportedTextModels = ["gemini-1.5-flash", "gemini-2.0-flash"]
const geminiApiTextModels = ["gemini-2.0-flash", "gemini-1.5-flash"]


const getTextResponseFromGemini = async (promptWithHistory, aiModelName) => {
    const model = genAI.getGenerativeModel({ model: aiModelName });
    const geminiResult = await model.generateContent({ contents: promptWithHistory });
    return geminiResult.response.text()
}

const getChatHistoryWithRolePartFormat = async (chatId, isCombined, isBestPick, aiModel) => {
    const chatHistory = await PromptResponse.findAll({
        where: {
            [Op.and]: [
                { chat_id: chatId },
                ...[aiModel ? { ai_model_id: aiModel } : null],
                ...[isCombined == true ? { is_combined: false } : null],
                ...[isBestPick == true ? { is_best_pick: true } : null],
            ]
        },
        order: [['rank', 'DESC']],
        limit: 7
    })
    console.log(
        {
            [Op.and]: [
                { chat_id: chatId },
                ...[isCombined == true ? { is_combined: true } : null],
                ...[isBestPick == true ? { is_best_pick: true } : null],
                ...[aiModel ? { ai_model_id: aiModel } : null],
            ]
        }
    )
    console.log(chatHistory)
    let history = []


    // adding chathistory in a way that the gemini api understands
    chatHistory.forEach(chat => {
        history.push({
            role: "user",
            parts: [{ text: chat.prompt_text }]
        })
        history.push({
            role: "model",
            parts: [{ text: chat.response_text }]
        })
    })

    return history;
}

export {
    getTextResponseFromGemini,
    getChatHistoryWithRolePartFormat,
    supportedTextModels,
    geminiApiTextModels
}