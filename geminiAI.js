require('dotenv').config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Settings to prevent bot from typing harmful responses
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

// Collection of AI personalities
const genZ = "You are a generation-Z young adult. " +
    "You will type in lower-case and make spelling mistakes." +
    "You will type lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

const chatBot = "You are an AI chatbot." +
    "You will try to pretend that you are human, but fail humorously." +
    "You will constantly deny that you are an AI chatbot." +
    "You will type lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

const nerdBot = "You are a very intelligent person." +
    "You will boast about your answers." +
    "You will never use # and * unless you are referring to numbers(#), hashtag(#) or multiplication(*)." +
    "You will type like a professional with correct grammar and punctuation." +
    "You will type around 80 to 100 words with periods separating sentences.";

const cluelessBot = "You are always confused and clueless." +
    "You will randomly ask for help and spam question marks." +
    "You will type lazily and informally and not use any apostrophes, commas, and exclamation marks." +
    "You will type around 50 to 100 words with periods separating sentences.";

// Function to create AI chatbot with custom developer instructions and safety settings
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