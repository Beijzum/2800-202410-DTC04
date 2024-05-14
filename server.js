require('dotenv').config();

// import externals
const express = require('express');
const session = require("express-session");
const cors = require("cors");
const app = express();
const socketManager = require("./websocket.js");
const database = require("./database");
const schemas = require("./joiValidation");

// set port
const PORT = 3000;

// requirements for websocket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

// requirements for geminiAI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// session configuration
app.use(session({
    secret: process.env.NODE_SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: { 
        secure: false,
        maxAge: 3 * 60 * 60 * 1000
    },
    store: database.mongoSessionStorage,
    unset: "destroy"
}))

// set up ejs
app.set("view engine", "ejs");

// set up middleware
app.use(express.json());
app.use(cors());

// set up routes
app.use(express.static(__dirname + "/public"));
app.use(require("./pageRoutes"));

// GET ROUTES SECTION

app.get("/logout", (req, res) => {
    req.session.destroy();
    req.session = null;
    res.redirect("/");
})



// POST ROUTES SECTION

app.post("/createAccount", async (req, res) => {
    let validationResult = schemas.signUpSchema.validate(req.body);
    if (validationResult.error) {
        console.log(validationResult.error.message);
    } else { 
        let errorList = await database.signUpUser(req.body);
        if (errorList.length === 0) {
            req.session.username = req.body.username;
            res.redirect("/");
            return;
        }
    }
    res.redirect("/signUp");
})

app.post("/loginAccount", async (req, res) => {
    let validationResult = schemas.loginSchema.validate(req.body);
    if (validationResult.error) {
        console.log(validationResult.error.message);
    } else { 
        let loginResult = await database.loginUser(req.body);
        if (loginResult) {
            req.session.username = loginResult.username;
            res.redirect("/");
            return;
        }
        res.redirect("/login");
    }
})

app.post("/forgotpass", async (req, res) => {
    if (req.session.username) {
        res.redirect("/index");
        return;
    }
    
    const { email } = req.body;

    let validationResult = schemas.emailSchema.validate(email);
    if (validationResult.error) {
        console.log(validationResult.error.message);
        res.status(400).send({"error": "Error with email entry"});
        return;
    }

    let user = await database.findUser({ "email": email });

    if (user) {
        // TODO: Handle emailing the specified user a link to reset pass (or login without pass?)
        res.status(200).render("forgotPassSuccess.ejs", { email: email });
    } else {
        res.status(404).send({"error": "No account with specified email"});
    }
});

startServer();

async function startServer() {
    let connection = await database.client.connect();
    if (connection.topology.isConnected()) {
        const server = app.listen(PORT, () => { 
            console.log(`Database succesfully connected, now listening to port ${PORT}`);
        });

        // connect to websocket server
        const io = new Server(server);
        socketManager.runSocket(io);
    }
    else console.log("Error, could not connect to database, to try again, restart the server.");
}