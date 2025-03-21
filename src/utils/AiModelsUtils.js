import dotenv from "dotenv"
dotenv.config({ path: '.env' })
import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";
import PromptResponse from "../db/models/promptResponse.model.js";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
import { Op } from "sequelize";
import { CohereClientV2 } from "cohere-ai";


const supportedTextModels = ["gemini-1.5-flash", "gemini-2.0-flash", "cohere-command-a-03-2025"]
const geminiApiTextModels = ["gemini-2.0-flash", "gemini-1.5-flash"]

const getTextResponseFromGemini = async (promptWithHistory, aiModelName) => {
    const model = genAI.getGenerativeModel({ model: aiModelName });
    const geminiResult = await model.generateContent({ contents: promptWithHistory });
    return geminiResult.response.text()
}

const getChatHistoryWithRolePartFormat = async (chatId, isCombined, isBestPick, aiModel, limit) => {

    const chatHistory = await PromptResponse.findAll({
        where: {
            [Op.and]: [
                { chat_id: chatId },
                ...(aiModel ? [{ ai_model_id: aiModel }] : []),
                ...(isCombined == true ? [{ is_combined: true }] : []),
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


const generateCombinedResponseSummary = async (combinedResponseParagraph) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Please summarize the following combined response paragraph, retaining all key points in a concise and understandable manner.
  
    Combined Response Paragraph:
    ${combinedResponseParagraph}
  
    Summary: `;

    const geminiResult = await model.generateContent(prompt);
    return geminiResult.response.text().trim();
};

const getTextResponseFromCohere = async (messages, aiModelName) => {

        try {
            const cohere = new CohereClientV2({
                token: process.env.COHERE_API_TRIAL_KEY,
              });
      
          const response = await cohere.chat({
            model: "command-a-03-2025",
            messages: messages,
          });
          if (
            response &&
            response?.message &&
            response?.message?.content &&
            response?.message?.content?.length > 0 &&
            response?.message?.content[0]?.text
          ) {
            const responseText = response.message.content[0].text;
            // console.log('Response Text:', responseText);
            return responseText
          } else {
            return null
            console.log('Response text not found.');
          }
        } catch (error) {
          console.error('Error in Cohere API call:', error);
          throw error; // Rethrow the error to be handled by the caller
        }
      
}

export {
    getTextResponseFromGemini,
    getChatHistoryWithRolePartFormat,
    supportedTextModels,
    geminiApiTextModels,
    generateChatName,
    generateCombinedResponseSummary,
    getTextResponseFromCohere
}



//assembly ai
//hidden ai