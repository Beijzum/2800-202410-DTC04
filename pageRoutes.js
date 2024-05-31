require('dotenv').config();
const express = require("express");
const router = express.Router();
const database = require("./database");

router.get("/", async (req, res) => {
    if (req.session.username) {
        res.render("index", { authenticated: true, sessionData: req.session });
    } else res.render("index", { authenticated: false });
});

router.get("/game", (req, res) => {
    // redirect to login if unauthenticated
    if (req.session.username) res.render("game", { authenticated: true, url: req.origin, sessionData: req.session }); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/victory", (req, res) => {
    if (req.session.username) res.render("victory", { authenticated: true, url: req.origin, sessionData: req.session }); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/defeat", (req, res) => {
    if (req.session.username) res.render("defeat", { authenticated: true, url: req.origin, sessionData: req.session}); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/lobby", (req, res) => {
    if (req.session.username) res.render("lobby", { authenticated: true, url: req.origin, sessionData: req.session }); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/leaderboard", async (req, res) => {
    let top10Players = await database.getLeaderboard();
    if (req.session.username)
        res.render("leaderboard", { authenticated: true, topUsers: top10Players, sessionData: req.session });
    else 
        res.render("leaderboard", { authenticated: false, topUsers: top10Players });
});


router.get("/login", (req, res) => {
    if (req.session.username) res.redirect("/");
    else res.render("login", { authenticated: false });
});

router.get("/forgotpass", (req, res) => {
    if (req.session.username) res.redirect("/");
    else res.render("forgotpass", {authenticated: false})
});

router.get("/reset", async (req, res) => {
    const { id } = req.query;

    if (!id) {
        res.redirect("/");
        return;
    }

    let user;
    try {   
        user = await database.getResetDoc(id);
    } catch (error) {
        res.status(404).render("error", {authenticated: false,
            errorTitle: "Reset  password error",
            errorCode: 404,
            errorMessage: "Could not find a user to reset password."
        });
        return;
    }

    if (!user) {
        res.redirect("/");
        return;
    }

    res.render("reset", {authenticated: false, hash: id});
});

router.get("/verify", async (req, res) => {
    const { v } = req.query;

    if (!v) {
        res.redirect("/");
    }

    let user;
    try {
        user = await database.client.db(process.env.MONGODB_DATABASE)
        .collection("unverifiedUsers").findOne({ "hash": v });
    } catch (error) {
        res.status(500).render("error", {authenticated: false,
            errorTitle: "Database error",
            errorCode: 500,
            errorMessage: "An error occurred while trying to validate your account. Please try again later."
        });
        return;
    }
    
    if (!user) {
        res.status(404).render("error", {authenticated: false,
            errorTitle: "Validation error",
            errorCode: 404,
            errorMessage: "Could not find a user to validate."
        });
        return;
    }

    let promotionWasSuccessful;

    try {
        promotionWasSuccessful = await database.promoteUnverifiedUser(user);
    } catch (error) {
        res.status(500).render("error", {authenticated: false,
            errorTitle: "Database error",
            errorCode: 500,
            errorMessage: "An error occurred while trying to validate your account. Please contact support at bcit.deadnet@gmail.com."
        });
    }

    if (promotionWasSuccessful) {
        database.updateSessionID(loginResult, req.session.id);
        req.session.username = user.username;
        res.render("verify", {authenticated: true, sessionData: req.session});
    } else {
        /* 
         * Should render an error page, but I'm assuming at this point
         * that the user is logged in, or something to that effect.
         */
        res.redirect("/");
    }
});

router.get("/registerSuccess", (req, res) => {
    const { h } = req.query;
    if (!h || req.session.username) {
        res.redirect("/");
        return;
    }

    res.render("registerSuccess", { authenticated: false, hash: h });
});

router.get("/signUp", (req, res) => {
    if (req.session.username) res.redirect("/");
    else res.render("signUp", { authenticated: false });
});

router.get("/profile", async (req, res) => {
    if (!req.session.username) {
        res.redirect("/login");
        return;
    }
    let userData = await database.findUser({ username: req.session.username });
    res.render("profile", { authenticated: true, sessionData: req.session, data: { winCount: userData.winCount, loseCount: userData.loseCount, profilePictureUrl: userData.profilePictureUrl, email: userData.email } });

});

router.get("/logout", async (req, res) => {
    console.log(`Logging out user: ${req.session.username}`);
    try {
        if (req.session.username) { // make sure session still exists
            const user = await database.findUser({ "username": req.session.username }); // get user object
            
            await database.setLoggedInStatus(user, false); // set user's logged in status to false

            req.session.destroy(err => { // destroy the session
                if (err) {
                    console.error('Error destroying session:', err);
                    return res.status(500).send("Internal Server Error");
                }
                console.log('Session destroyed');
                res.redirect("/"); // redirect to home page
            });
        } else {
            res.redirect("/");
        }
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/memes", (req, res) => {
    if (req.session.username) res.render("memes", { authenticated: true, sessionData: req.session });
    else res.render("memes", { authenticated: false });
});

router.get("/howToPlay", (req, res) => {
    if (req.session.username) res.render("howToPlay", { authenticated: true, sessionData: req.session });
    else res.render("howToPlay", { authenticated: false });
});

router.get("/privacy", async (req, res) => {
    res.render("privacy", { authenticated: req.session.username !== undefined });
});

router.get("*", (req, res) => {
    res.status(404).render("404", { authenticated: req.session.username !== undefined });
});

module.exports = router;