const express = require("express");
const router = express.Router();
const database = require("./database");

router.get("/", async (req, res) => {
    let top10Players = await database.getLeaderboard();
    res.render("index", {authenticated: req.session.username !== undefined, topUsers: top10Players});
});

router.get("/game", (req, res) => {
    // redirect to login if unauthenticated
    if (req.session.username) res.render("game", {authenticated: true})
    else res.redirect("/login");
});

router.get("/lobby", (req, res) => {
    if (req.session.username) res.render("lobby", {authenticated: true});
    else res.redirect("/login");
});

router.get("/login", (req, res) => {
    if (req.session.username) res.redirect("/index");
    else res.render("login", {authenticated: false});
})

router.get("/signup", (req, res) => {
    if (req.session.username) res.redirect("/index");
    else res.render("signup", {authenticated: false});
})

router.get("/profile", (req, res) => {
    if (req.session.username) res.render("profile", {authenticated: true});
    else res.redirect("/login");
})

router.get("/logout", (req, res) => {
    req.session.destroy();
    req.session = null;
    res.redirect("/");
})

router.get("*", (req, res) => {
    res.status(404).render("404", {authenticated: req.session.username !== undefined});
})

module.exports = router;