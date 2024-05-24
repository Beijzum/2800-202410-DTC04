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
const { randomBytes } = require("crypto");

// set port
const port = process.env.PORT || 3000;

// requirements for websocket
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");

// requirements for cloudinary
const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;

const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CLOUD_KEY,
    api_secret: process.env.CLOUDINARY_CLOUD_SECRET
});

const multer = require('multer')
const multerStorage = multer.memoryStorage()
const upload = multer({ storage: multerStorage })

// session configuration

const sessionConfig = session({
    secret: process.env.NODE_SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 12 * 60 * 60 * 1000
    },
    store: database.mongoSessionStorage,
    unset: "destroy"
});

app.use(sessionConfig);

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
        res.status(400).json({ errors: validationResult.error.details });
    } else {
        const hash = randomBytes(12).toString('hex');
        let errorList = await database.signUpUser({ ...req.body, hash });
        if (errorList?.length) {
            res.status(400).json({ errors: errorList });
        } else {
            const link = `${req.protocol}://${req.get("host")}/verify?v=${hash}`;
            await email.sendEmailWithLink(req.body.email, req.body.username, link, "2T6THXEN274N58HG4QHDZ1R47XGX");
            res.json({redirectUrl: `/registerSuccess?h=${hash}`});
            return;
        }
    }
});


app.post("/resendReg", async (req, res) => {
    const { hash } = req.body;
    const doc = await database.client.db(process.env.MONGODB_DATABASE).collection("unverifiedUsers").findOne({ "hash": hash });

    const link = `${req.protocol}://${req.get("host")}/verify?v=${hash}`;
    if (await email.sendEmailWithLink(doc.email, doc.username, link, "2T6THXEN274N58HG4QHDZ1R47XGX")) {
        res.redirect(`/registerSuccess?h=${hash}`);
    } else {
        // This should show some error, or clientside should handle this case.
        res.redirect("/");
    }
});

app.post("/loginAccount", async (req, res) => {
    let validationResult = joiValidation.loginSchema.validate(req.body);
    if (validationResult.error) {
        console.log(validationResult.error.message);
        res.status(400).json({ message: validationResult.error.message });
    } else {
        let loginResult = await database.loginUser(req.body);
        if (loginResult.message === undefined) {
            req.session.username = loginResult.user.username;
            req.session.profilePic = loginResult.user.profilePictureUrl;
            res.redirect("/");
        } else {
            res.status(400).json({ message: loginResult.message });
        }
    }
});





app.post("/forgotpass", async (req, res) => {
    if (req.session.username) {
        res.redirect("/index");
        return;
    }

    const userEmail = req.body.email;

    let validationResult = joiValidation.emailSchema.validate(userEmail);
    if (validationResult.error) {
        console.log(validationResult.error.message);
        res.status(400).send({ "error": "Error with email entry" });
        return;
    }

    let user = await database.findUser({ "email": userEmail });

    if (!user) {
        res.status(404).send({ "error": "No account with specified email" });
        return;
    }

    const hash = randomBytes(12).toString('hex');
    const link = `${req.protocol}://${req.get("host")}/reset?id=${hash}`;

    if (await email.sendEmailWithLink(userEmail, user.username, link, "RDPCSGVYMQMG5SNGNKEDJ9PP9BEV")) {
        await database.writeResetDoc(user, hash)
        res.status(200).render("forgotPassSuccess.ejs", { email: userEmail });
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

app.post("/changePass", async (req, res) => {
    if (!req.session.username) {
        res.redirect("/");
        return;
    }

    let validPass = joiValidation.passwordSchema.validate(req.body.password);

    if (validPass.error) {
        console.log(validPass.error.message);
        res.status(400).send({ "error": validPass.error.message.replace("", "") });
        return;
    }

    try {
        database.updateUserPass(await database.findUser({ "username": req.session.username }), req.body.password);
        res.status(200).send();
    } catch (e) {
        console.error(e);
        res.status(500).send({ "error": "Internal server error" });
    }
});

// post routes for uploading images
app.post('/uploadProfilePic', upload.single('image'), async (req, res) => {
    if (!req.session.username) {
        res.redirect('/login');
        return;
    }

    const databaseServer = database.client.db(process.env.MONGODB_DATABASE);
    const userCollection = databaseServer.collection('users');

    let buf64 = req.file.buffer.toString('base64');
    stream = cloudinary.uploader.upload("data:image/octet-stream;base64," + buf64, async function (result) {
        console.log(result)
        try {
            await userCollection.updateOne(
                { username: req.session.username },
                { $set: { profilePictureUrl: result.secure_url } }
            );
            req.session.profilePic = result.secure_url;
            console.log('updated mongodb');
            res.status(200).send({ message: 'Profile picture updated', imageUrl: result.secure_url });
        } catch (error) {
            console.error('Error updating profile picture:', error);
            res.status(500).send({ error: 'Failed to update profile picture' });
        }
    });

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
        io.engine.use(sessionConfig);
        socketManager.runSocket(io);
    }
    else console.log("Error, could not connect to database, to try again, restart the server.");
}