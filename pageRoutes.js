require('dotenv').config();
const express = require("express");
const router = express.Router();
const database = require("./database");

router.get("/", async (req, res) => {
    let top10Players = await database.getLeaderboard();
    res.render("index", { authenticated: req.session.username !== undefined, topUsers: top10Players });
});

router.get("/game", (req, res) => {
    // redirect to login if unauthenticated
    console.log(req.origin)
    if (req.session.username) res.render("game", { authenticated: true, url: req.origin }) // Pass authentication and url to view
    else res.redirect("/login");
});

router.get("/lobby", (req, res) => {
    console.log(req.origin)
    if (req.session.username) res.render("lobby", { authenticated: true, url: req.origin }); // Pass authentication and url to view
    else res.redirect("/login");
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
    res.render("profile", { authenticated: true, session: req.session, data: { winCount: userData.winCount, loseCount: userData.loseCount } });

})

router.get("/logout", (req, res) => {
    req.session.destroy();
    req.session = null;
    res.redirect("/");
})

router.get("*", (req, res) => {
    res.status(404).render("404", { authenticated: req.session.username !== undefined });
})

module.exports = router;