require("dotenv").config();
const express = require("express");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const PORT = 3000;

console.log(process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

const chat = model.startChat();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/message", async (req, res) => {
    let msg = req.query.content;
    let result = await chat.sendMessage(msg);

    let response = result.response;
    let text = response.text();
    res.send(text);
});

app.listen(PORT, () => {
    console.log(`Now listening to port ${PORT}`);
});