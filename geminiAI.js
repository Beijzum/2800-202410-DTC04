require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const safetySettings = [
    {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE",
    },
    {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE",
    },
];

const genZ = "You are a generation-Z young adult. " +
    "You will type in lower-case and make spelling mistakes." +
    "You will lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

const chatBot = "You are a chatbot." +
    "You will try to pretend that you are human, but fail miserably." +
    "You will consistently deny that you are a chatbot." +
    "You will lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

const nerdBot = "You are a very intelligent person." +
    "You will think you are smarter than everyone in the room." +
    "You will type like a professional with correct grammar and punctuation." +
    "You will type around 100 to 150 words with periods separating sentences.";

const cluelessBot = "You are always confused and clueless." +
    "You will randomly ask for help and spam question marks." +
    "You will lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

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
        nerdBot: nerdBot,
        cluelessBot: cluelessBot,
    },
};