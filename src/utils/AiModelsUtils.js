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

const getChatHistoryWithRolePartFormat = async (chatId, isCombined, isBestPick, aiModel, limit) => {
    // console.log(chatId, isCombined, isBestPick, aiModel)
    // console.log({
    //     where: {
    //         [Op.and]: [
    //             { chat_id: chatId },
    //             ...(aiModel != null ? [{ ai_model_id: aiModel }] : []),
    //             ...(isCombined == true ? [{ is_combined: false }] : []),
    //             ...(isBestPick == true ? [{ is_best_pick: true }] : [])
    //         ]
    //     }
    // }.toString())
    const chatHistory = await PromptResponse.findAll({
        where: {
            [Op.and]: [
                { chat_id: chatId },
                ...(aiModel ? [{ ai_model_id: aiModel }] : []),
                ...(isCombined == true ? [{ is_combined: false }] : []),
                ...(isBestPick == true ? [{ is_best_pick: true }] : []),
            ]
        },
        order: [['rank', 'DESC']],
        ...(limit == "all" ? {} : { limit: 7 })
    })
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
        console.log(history)
    })

    return history;
}

const generateChatName = async (conversation) => {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct a prompt that asks for a chat title based on the conversation.
    const prompt = `Based on the following chat conversation, please generate a concise and descriptive title.
  
    Conversation:
    ${JSON.stringify(conversation, null, 2)}
  
    Title: `;

    const geminiResult = await model.generateContent(prompt);
    return geminiResult.response.text().trim(); // Trim to remove extra whitespace.
};

export {
    getTextResponseFromGemini,
    getChatHistoryWithRolePartFormat,
    supportedTextModels,
    geminiApiTextModels,
    generateChatName
}