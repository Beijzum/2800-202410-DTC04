require('dotenv').config();

// import externals
const express = require('express');
const session = require("express-session");
const cors = require("cors");
const app = express();
const socketManager = require("./websocket.js");
const database = require("./database");
const joiValidation = require("./joiValidation");
const email = require("./emailNotification.js");
const middleware = require("./middleware.js");

// set port
const port = process.env.PORT || 3000;

// requirements for websocket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

// requirements for geminiAI
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// requirements for cloudinary
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_CLOUD_KEY,
  api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const multer  = require('multer')
const multerStorage = multer.memoryStorage()
const upload = multer({ storage: multerStorage })



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
app.use(middleware.requestTime);
app.use(middleware.originUrl);

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
    let validationResult = joiValidation.signUpSchema.validate(req.body);
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
    let validationResult = joiValidation.loginSchema.validate(req.body);
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

    const user_email = req.body.email;

    let validationResult = joiValidation.emailSchema.validate(user_email);
    if (validationResult.error) {
        console.log(validationResult.error.message);
        res.status(400).send({ "error": "Error with email entry" });
        return;
    }

    let user = await database.findUser({ "email": user_email });

    if (!user) {
        res.status(404).send({ "error": "No account with specified email" });
        return;
    }

    const hash = require("crypto").randomBytes(12).toString('hex');
    const link = `${req.protocol}://${req.get("host")}/reset?id=${hash}`;

    if (email.sendResetLink(user_email, user.username, link)) {
        await database.writeResetDoc(user, hash)
        res.status(200).render("forgotPassSuccess.ejs", { email: user_email });
    } else {
        res.status(500).send({ "error": "Error with sending email" })
    }
});

app.post("/reset", async (req, res) => {
    const { password, hash } = req.body;

    if (joiValidation.passwordSchema.validate(password).error) {
        res.status(400).send({ "error": "Invalid password" });
        return;
    }

    try {
        const resetDoc = await database.getResetDoc(hash);
        const user = await database.findUser({ "_id": resetDoc.user_id });
        await database.updateUserPass(user, password);
        await database.deleteResetDoc(hash);
        res.redirect("/login");
    } catch (e) {
        console.error(e);
        res.status(500).send({ "error": "Error accessing database" })
    }
});

// post routes for uploading images
app.post('/uploadProfilePic', upload.single('image'), async (req, res) => {
    if (!req.session.username) {
        res.redirect('/login');
        return;
    }

    const file = req.file;
    const databaseServer = database.client.db(process.env.MONGODB_DATABASE);
    const userCollection = databaseServer.collection('users');
    
    try {
        // Await the result of findOne method

        const result = await cloudinary.uploader.upload(file.originalname, { resource_type: 'image' });


        await userCollection.updateOne(
            { username: req.session.username },
            { $set: { profilePictureUrl: result.secure_url } }
        );
        console.log('updated mongodb');
        res.status(200).send({ message: 'Profile picture updated', imageUrl: result.secure_url });
    } catch (error) {
        console.error('Error updating profile picture:', error);
        res.status(500).send({ error: 'Failed to update profile picture' });
    }
});



startServer();

async function startServer() {
    let connection = await database.client.connect();
    if (connection.topology.isConnected()) {
        const server = app.listen(port, () => {
            console.log(`Database succesfully connected, now listening to port ${port}`);
        });

        // connect to websocket server
        const io = new Server(server);
        socketManager.runSocket(io);
    }
    else console.log("Error, could not connect to database, to try again, restart the server.");
}