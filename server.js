require('dotenv').config();

const express = require('express');
const app = express();
const PORT = 3000;

// requirements for websocket
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// requirements for geminiAI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

app.use(express.static(__dirname + 'public'));

app.listen(PORT, () => {
    console.log(`Now listening to port ${PORT}`);
})