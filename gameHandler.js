const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");
const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter(); // used for passing control from server to self

// PHASES: WRITE, VOTE, RESULT, WAIT
var currentPhase, gameRunning = false, promptIndex, phaseDuration, round;

// CHECK TO SEE IF REDIRECTING TO NEW PAGE CAUSES A NEW SOCKET SESSION TO BE CREATE ---> DIFFERENT ID SO PLAYERS WONT BE COUNTED AS "IN-GAME"

// CURRENT SETUP ASSUMES THAT EVERY USER REDIRECTING TO THIS PAGE IS A PLAYER AND NO ONE HAS JOINED LATE, THIS HAS TO BE CHANGED LATER ON

// ejs templates for game windows
const writeTemplate = fs.readFileSync("./socketTemplates/write.ejs", "utf8");
const voteTemplate = fs.readFileSync("./socketTemplates/vote.ejs", "utf8");
const noGameTemplate = fs.readFileSync("./socketTemplates/noGame.ejs", "utf8");
const waitTemplate = fs.readFileSync("./socketTemplates/wait.ejs", "utf8");
const resultTemplate = fs.readFileSync("./socketTemplates/result.ejs", "utf8");

function runGame(io, socket) {

    // player connects to game lobby
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
            round = 1;
        }

        // send round details to frontend
        socket.emit("roundUpdate", round);

        // user has joined, and is part of the game
        if (socket.rooms.has("game")) {
            ee.emit("runWrite");
        } else {
            // user has joined, but is not part of the game
            switch(currentPhase) {
                // jump to whatever screen the game is currently on
                case "WRITE":
                    ee.emit("WRITE");
                    break;
                case "VOTE":
                    ee.emit("VOTE");
                    break;
                case "RESULT":
                    ee.emit("RESULT");
                    break;
                case "WAIT":
                    ee.emit("WAIT");
                    break;
                default:
                    let renderedNoGameTemplate = ejs.render(noGameTemplate);
                    socket.emit("changeView", renderedNoGameTemplate);
            }
        }
    });

    // handle logic for write screen
    ee.on("runWrite", () => {
        currentPhase = "WRITE";

        // only generate new prompt when first person joins
        if (!promptIndex) promptIndex = Math.floor(Math.random() * pool.prompts.length);

        // update frontend UI
        let renderedWriteTemplate = ejs.render(writeTemplate, {prompt: pool.prompts[promptIndex]});
        socket.emit("changeView", renderedWriteTemplate);

        // only run when the first user connects
        if (!phaseDuration || phaseDuration <= 0) {
            phaseDuration = 5;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runVote");
        }
    });

    // handle logic for vote screen
    ee.on("runVote", () => {
        currentPhase = "VOTE";
        let renderedTemplate = ejs.render(noGameTemplate);
        socket.emit("changeView", renderedTemplate);

        // let renderedVoteTemplate = ejs.render(renderedVoteTemplate, {});
        // socket.emit("changeView", renderedVoteTemplate);
        
        if (phaseDuration <= 0) {
            console.log('vote')
            phaseDuration = 5;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runResult");
        }
    });

    // handle logic for result screen
    ee.on("runResult", () => {
        currentPhase = "RESULT"

        let renderedTemplate = ejs.render(noGameTemplate);
        socket.emit("changeView", renderedTemplate);

        // let renderedResultTemplate = ejs.render(renderedResultTemplate, {});
        // socket.emit("changeView", renderedResultTemplate);
        
        if (phaseDuration <= 0) {
            console.log('result')
            phaseDuration = 5;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runWait");
        }
    })

    // handle logic for wait screen
    ee.on("runWait", () => {
        currentPhase = "WAIT";
        if (!io.sockets.adapter.rooms.get("game") || io.sockets.adapter.rooms.get("game").size === 0)
            stopGame();

        // ADD LOGIC TO HANDLE PLAYERS WIN OR LOSE HERE

        // move onto rendering page if game has not ended
        let renderedWaitTemplate = ejs.render(waitTemplate);
        socket.emit("changeView", renderedWaitTemplate);
        socket.emit("roundUpdate", round);

        // move onto next round
        if (phaseDuration <= 0) {
            console.log('wait')
            phaseDuration = 5;
            round++;
            setupNextRound();
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runWrite");
        }
    })

    // CLIENT LISTENER SECTION

    // when player submit response
    socket.on("submitResponse", () => {

    });



    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function createDelayedRedirect(delayTimeInSeconds, timer, nextRoute) {
        setTimeout(() => {
            ee.emit(nextRoute);
            clearInterval(timer);
        }, delayTimeInSeconds * 1000);
    }

    function updateClientTimers() {
        if (phaseDuration > 0) {
            phaseDuration--;
            io.emit("timerUpdate", convertFormat(phaseDuration));
        }
    }
}

// GENERAL FUNCTION DEFINITIONS

function convertFormat(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds < 10 ? "0" + seconds % 60 : seconds % 60}`;
}

function setupNextRound() {
    promptIndex = null;
    timer = null;
    phaseDuration = null;
}

function stopGame() {
    currentPhase = null;
    gameRunning = false;
    promptIndex = null;
    phaseDuration = null;
    timer = null;
    round = null;
}

module.exports = {
    runGame: runGame
}