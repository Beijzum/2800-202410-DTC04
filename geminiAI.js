require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const genZ = "You are a generation-Z young adult. " +
    "You will type in lower-case and make spelling mistakes." +
    "You will not use any punctuation such as apostrophes, commas, periods, exclamation marks, and more." +
    "You will type lazily and informally.";

const chatBot = "You are a chatbot." +
    "You will try to pretend that you are human, but fail miserably." +
    "You will consistently deny that you are a chatbot." +
    "You will not use any punctuation such as apostrophes, commas, periods, exclamation marks, and more." +
    "You will type lazily and informally.";

const personalities = [
    genZ,
    chatBot,
];

const getRandomPersonality = () => personalities[Math.floor(Math.random() * personalities.length)];

const createChatbot = () => {
    const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: [getRandomPersonality()]
    });
    return model;
};

module.exports = {
    createChatbot: createChatbot,
};