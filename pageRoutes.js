require('dotenv').config();
const express = require("express");
const router = express.Router();
const database = require("./database");

router.get("/", async (req, res) => {
    let top10Players = await database.getLeaderboard();
    if (req.session.username) {
        let userData = await database.findUser({ username: req.session.username });
        res.render("index", { authenticated: true, data: { winCount: userData.winCount, loseCount: userData.loseCount }, topUsers: top10Players, userExist: { isTrue : true }, sessionData: req.session });
    } else { res.render("index", { authenticated: req.session.username !== undefined, topUsers: top10Players, data: { winCount: 0 , loseCount: 0 }, userExist: { isTrue : false  }  }) };
});

router.get("/game", (req, res) => {
    // redirect to login if unauthenticated
    if (req.session.username) res.render("game", { authenticated: true, url: req.origin }) // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/victory", (req, res) => {
    if (req.session.username) res.render("victory", { authenticated: true, url: req.origin }) // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/defeat", (req, res) => {
    if (req.session.username) res.render("defeat", { authenticated: true, url: req.origin }); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/lobby", (req, res) => {
    if (req.session.username) res.render("lobby", { authenticated: true, url: req.origin }); // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/leaderboard", async (req, res) => {
    let top10Players = await database.getLeaderboard();
    if (req.session.username) {
        let userData = await database.findUser({ username: req.session.username });
        res.render("leaderboard", { authenticated: true, data: { winCount: userData.winCount, loseCount: userData.loseCount }, topUsers: top10Players, userExist: { isTrue: true }, sessionData: req.session });
    } else { res.render("leaderboard", { authenticated: req.session.username !== undefined, topUsers: top10Players, data: { winCount: 0, loseCount: 0 }, userExist: { isTrue: false } }) };
});


router.get("/login", (req, res) => {
    if (req.session.username) res.redirect("/index");
    else res.render("login", { authenticated: false });
})

router.get("/forgotpass", (req, res) => {
    if (req.session.username) res.redirect("/index");
    else res.render("forgotpass", {authenticated: false})
});

router.get("/reset", async (req, res) => {
    const user = await database.getResetDoc(req.query.id);

    if (!user) {
        res.redirect("/");
        return;
    }

    res.render("reset", {authenticated: false, hash: req.query.id});
});

router.get("/verify", async (req, res) => {
    const { v } = req.query;
    const user = await database.client.db(process.env.MONGODB_DATABASE)
    .collection("unverifiedUsers").findOne({ "hash": v });
    
    if (!user) {
        res.redirect("/");
        return;
    }

    if (await database.promoteUnverifiedUser(user)) {
        req.session.username = user.username;
        res.render("verify", {authenticated: true});
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
    if (req.session.username) res.redirect("/index");
    else res.render("signUp", { authenticated: false });
})

router.get("/profile", async (req, res) => {
    if (!req.session.username) {
        res.redirect("/login");
        return;
    }
    let userData = await database.findUser({ username: req.session.username });
    res.render("profile", { authenticated: true, session: req.session, data: { winCount: userData.winCount, loseCount: userData.loseCount, profilePictureUrl: userData.profilePictureUrl, email: userData.email } });

})

router.get("/logout", (req, res) => {
    req.session.destroy();
    req.session = null;
    res.redirect("/");
})

router.get("/changePass", (req, res) => {
    if (!req.session.username) {
        res.redirect("/");
        return;
    }

    res.render("changePassModal", {name: req.session.username});
});

router.get("/memes", (req, res) => {
    if (req.session.username) res.render("memes", { authenticated: true });
    else res.render("memes", { authenticated: false });
});

router.get("/howToPlay", (req, res) => {
    if (req.session.username) res.render("howToPlay", { authenticated: true });
    else res.render("howToPlay", { authenticated: false });
});

router.get("/privacy", async (req, res) => {
    res.render("privacy", { authenticated: req.session.username !== undefined });
});

router.get("*", (req, res) => {
    res.status(404).render("404", { authenticated: req.session.username !== undefined });
})

module.exports = router;