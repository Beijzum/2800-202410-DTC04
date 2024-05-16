const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");

// PHASES: WRITE, VOTE, RESULT, WAIT
var currentPhase, gameRunning = false, promptIndex, timerValue, timer, round;

// CHECK TO SEE IF REDIRECTING TO NEW PAGE CAUSES A NEW SOCKET SESSION TO BE CREATE ---> DIFFERENT ID SO PLAYERS WONT BE COUNTED AS "IN-GAME"

// CURRENT SETUP ASSUMES THAT EVERY USER REDIRECTING TO THIS PAGE IS A PLAYER AND NO ONE HAS JOINED LATE, THIS HAS TO BE CHANGED LATER ON

// ejs templates for game windows
const writeTemplate = fs.readFileSync("./socketTemplates/write.ejs", "utf8");
const voteTemplate = fs.readFileSync("./socketTemplates/vote.ejs", "utf8");
const noGameTemplate = fs.readFileSync("./socketTemplates/noGame.ejs", "utf8");
const waitTemplate = fs.readFileSync("./socketTemplates/wait.ejs", "utf8");
const resultTemplate = fs.readFileSync("./socketTemplates/result.ejs", "utf8");

function runGame(io, socket) {
    socket.on("joinGame", () => {
        socket.join("game"); // keep just for testing purposes, remove later
        
        // user has joined, but no game is running
        if (!io.sockets.adapter.rooms.get("game") || io.sockets.adapter.rooms.get("game").size === 0) {
            let renderedNoGameTemplate = ejs.render(noGameTemplate);
            socket.emit("noGameRunning", renderedNoGameTemplate);
            return;
        }

        // user has joined and is part of the game, and is the first to join
        if (gameRunning === false) {
            gameRunning = true;
        }

        // user has joined, and is part of the game
        if (socket.rooms.has("game")) {
            socket.emit("writePhase");
        } else {
            // user has joined, but is not part of the game
            switch(currentPhase) {
                // jump to whatever screen the game is currently on
                case "WRITE":
                    let renderedWriteTemplate = ejs.render(writeTemplate);
                    socket.emit("changeView", renderedWriteTemplate);
                    break;
                case "VOTE":
                    let renderedVoteTemplate = ejs.render(voteTemplate);
                    socket.emit("changeView", renderedVoteTemplate);
                    break;
                case "RESULT":
                    let renderedResultTemplate = ejs.render(resultTemplate);
                    socket.emit("changeView", renderedResultTemplate);
                    break;
                case "WAIT":
                    let renderedWaitTemplate = ejs.render(waitTemplate);
                    socket.emit("changeView", renderedWaitTemplate);
                    break;
                default:
                    let renderedNoGameTemplate = ejs.render(noGameTemplate);
                    socket.emit("changeView", renderedNoGameTemplate);
            }
        }
    });

    socket.on("runWrite", () => {
        if (!promptIndex) promptIndex = Math.floor(Math.random() * pool.prompts.length);
        let renderedWriteTemplate = ejs.render(writeTemplate, {prompt: pool.prompts[promptIndex]});
        io.emit("changeView", renderedWriteTemplate);
        if (!timer) {
            timerValue = 60;
            createTimer();
            // let renderedVoteTemplate = ejs.render(voteTemplate)
            // createDelayedRedirect(timerValue + 1, () => { io.emit("changeView", )})
        }
    });

    socket.on("runVote", () => {
        
    });

    socket.on("runResult", () => {

    })

    socket.on("runWait", () => {
        if (!io.sockets.adapter.rooms.get("game") || io.sockets.adapter.rooms.get("game").size === 0)
            stopGame();
    })

    socket.on("submitResponse", () => {

    });



    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function createDelayedRedirect(delayTimeInSeconds, functionToUse) {
        setTimeout(functionToUse, delayTimeInSeconds * 1000);
    }

    function createTimer() {
        timer = setInterval(() => {
            if (timerValue <= 0) {
                clearInterval(timer);
                timer = null;
            } else {
                timerValue--;
                io.emit("timerUpdate", convertFormat(timerValue));
            }
        }, 1000);
    }
}

// GENERAL FUNCTION DEFINITIONS

function convertFormat(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds < 10 ? "0" + seconds % 60 : seconds % 60}`;
}

function stopGame() {
    currentPhase = null;
    gameRunning = false;
    promptIndex = null;
    timerValue = null;
    timer = null;
    round = null;
}

module.exports = {
    runGame: runGame
}