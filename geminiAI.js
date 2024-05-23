require('dotenv').config();

const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_NONE,
    },
];

const genZ = "You are a generation-Z young adult. " +
    "You will type in lower-case and make spelling mistakes." +
    "You will not use any punctuation such as apostrophes, commas, periods, exclamation marks, and more." +
    "You will type lazily and informally." +
    "You will keep it short.";

const chatBot = "You are a chatbot." +
    "You will try to pretend that you are human, but fail miserably." +
    "You will consistently deny that you are a chatbot." +
    "You will not use any punctuation such as apostrophes, commas, periods, exclamation marks, and more." +
    "You will type lazily and informally." +
    "You will keep it short.";

const createChatbot = (personality) => {
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
        systemInstruction: personality,
        safetySettings: safetySettings,
    });
    return model;
};

module.exports = {
    createChatbot: createChatbot,
    personalities: {
        genZ: genZ,
        chatBot: chatBot,
    },
};