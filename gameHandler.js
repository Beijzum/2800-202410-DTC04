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
const transitionTemplate = fs.readFileSync("./socketTemplates/transition.ejs", "utf8");

function runGame(io, socket) {

    // player connects to game lobby
    socket.on("joinGame", () => {
        socket.join("game"); // keep just for testing purposes, remove later
        socket.join("alive");

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
            assignClientAlias(socket); // might have to move to websocket.js if id is not persistent
            ee.emit("runWrite");
        } else {
            // user has joined, but is not part of the game
            switch(currentPhase) {
                // jump to whatever screen the game is currently on
                case "WRITE":
                    ee.emit("runWrite");
                    break;
                case "VOTE":
                    ee.emit("runVote");
                    break;
                case "RESULT":
                    ee.emit("runResult");
                    break;
                case "WAIT":
                    ee.emit("runWait");
                    break;
                case "TRANSITION":
                    ee.emit("runTransition");
                    break;
                default:
                    let renderedNoGameTemplate = ejs.render(noGameTemplate);
                    socket.emit("noGameRunning", renderedNoGameTemplate);
            }
        }
    });

    // handle logic for write screen
    ee.on("runWrite", () => {
        currentPhase = "WRITE";
        console.log(currentPhase)

        // only generate new prompt when first person joins
        if (!promptIndex) promptIndex = Math.floor(Math.random() * pool.prompts.length);

        // update frontend UI
        let renderedWriteTemplate = ejs.render(writeTemplate, {prompt: pool.prompts[promptIndex]});
        socket.emit("changeView", renderedWriteTemplate);

        // only run when the first user connects
        if (!phaseDuration || phaseDuration <= 0) {
            phaseDuration = 61;
            let timer = setInterval(updateClientTimers, 1000);
            
            // need a transition screen to be able to receive all players input, even if they havent pressed submit
            createDelayedRedirect(phaseDuration + 1, timer, "runTransition");
        }
    });

    // handle transition between write and vote
    ee.on("runTransition", () => {
        currentPhase = "TRANSITION"
        console.log(currentPhase)
        
        // retrieve inputs from players that did not press submit
        io.emit("retrieveResponse");

        let renderedTransitionTemplate = ejs.render(transitionTemplate, {transitionMessage: "Get Ready To Vote!"});
        socket.emit("changeView", renderedTransitionTemplate);

        if (phaseDuration <= 0) {
            phaseDuration = 11;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runVote");
        }
    });

    // handle logic for vote screen
    // BUG, THE RUN VOTE RUNS TWICE FOR SOME REASON, SEE CONSOLE FIRING TWICE FOR VOTE
    // ANOTHER BUG, THE CSS RIGHT NOW PUSHES THE VOTE BUTTON OFF SCREEN INSTEAD OF WRAPPING, NEED TO FIX IT
    ee.on("runVote", async () => {
        currentPhase = "VOTE";
        console.log(currentPhase);

        let playerList = await io.in("game").fetchSockets();

        let renderedVoteTemplate = ejs.render(voteTemplate, {players: playerList, prompt: pool.prompts[promptIndex]});
        socket.emit("changeView", renderedVoteTemplate);
        
        if (phaseDuration <= 0) {
            
            phaseDuration = 61;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runResult");
        }
    });

    // handle logic for result screen
    // BUG, THE RUN VOTE RUNS TWICE SOMETIMES, IF IT DOES RUN TWICE THE RESULTS PAGE MIGHT BRICK, NEED TO FIX
    ee.on("runResult", async () => {
        currentPhase = "RESULT";
        console.log(currentPhase);

        // get the player with the most votes
        let playerSocketList = await io.in("game").fetchSockets();
        let mostVotedSocket = playerSocketList.reduce((prev, cur) => {
            return prev > cur ? prev : cur;
        });

        // if voted player has majority votes
        if (mostVotedSocket.request.session.game.votes / io.sockets.adapter.rooms.get("alive")?.size > 0.5) {
            mostVotedSocket.leave("alive");

            playerSocketList.splice(playerSocketList.indexOf(mostVotedSocket), 1);
            let renderedResultTemplate = ejs.render(resultTemplate, {eliminatedPlayer: mostVotedSocket, 
                remainingPlayers: playerSocketList, voteCount: mostVotedSocket.request.session.game.votes});
            socket.emit("changeView", renderedResultTemplate);
        } else {
            // if no majority vote
            let renderedResultTemplate = ejs.render(resultTemplate, {eliminatedPlayer: null, remainingPlayers: playerSocketList});
            socket.emit("changeView", renderedResultTemplate);
        }

        if (phaseDuration <= 0) {
            
            phaseDuration = 11;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runWait");
        }
    });

    // handle logic for wait screen
    ee.on("runWait", async () => {
        currentPhase = "WAIT";
        console.log(currentPhase);

        // move onto rendering page if game has not ended
        let renderedWaitTemplate = ejs.render(waitTemplate);
        socket.emit("changeView", renderedWaitTemplate);
        socket.emit("roundUpdate", round);

        // randomly remove 1 player
        let playerSocketList = await io.in("game").fetchSockets();
        let randomSocket = playerSocketList[Math.floor(Math.random() * playerSocketList.length)];
        randomSocket.leave("alive");

        // checks for if players win or lose, NEED TO ADD MORE CHECKS LATER ON WHEN AI IS ADDED
        if (!io.sockets.adapter.rooms.get("alive") || io.sockets.adapter.rooms.get("alive").size === 0)
            stopGame();

        // move onto next round
        if (phaseDuration <= 0) {
            phaseDuration = 11;
            if (round) round++;
            let timer = setInterval(updateClientTimers, 1000);
            setTimeout(() => {
                clearInterval(timer);
                if (gameRunning)
                    ee.emit("runWrite");
                else
                    io.emit("gameOver");
            }, (phaseDuration + 1) * 1000);
        }
    });

    // CLIENT LISTENER SECTION

    // when player submit response
    socket.on("submitResponse", (response) => {
        socket.request.session.game.response = response;
    });

    socket.on("submitVote", (socketId) => {
        let votedPlayerSocket = io.sockets.sockets.get(socketId);
        let votedPlayerSession = votedPlayerSocket.request.session;
        
        if (!votedPlayerSession.game.votes) votedPlayerSession.game.votes = 1;
        else votedPlayerSession.game.votes += 1;
    });

    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function createDelayedRedirect(delayTimeInSeconds, timer, nextRoute) {
        setTimeout(async () => {
            clearInterval(timer);
            // set up next round if one last phase
            if (nextRoute === "runWrite") setupNextRound();
            ee.emit(nextRoute);
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

function assignClientAlias(socket) {
    let req = socket.request
    reloadSession(socket);

    let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
    let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
    let randomNumber = Math.floor(Math.random() * 10000);
    let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

    req.session.game = {
        alias: randomFirstName + randomLastName + randomNumber,
        aliasPicture: randomAvatar

    }
    req.session.save();
}

function reloadSession(socket) {
    socket.request.session.reload((err) => {
        if (err) return socket.disconnect();
    })
}

function convertFormat(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" + seconds % 60 : seconds % 60}`;
}

function setupNextRound() {
    promptIndex = null;
    phaseDuration = null;
}

function stopGame() {
    currentPhase = null;
    gameRunning = false;
    promptIndex = null;
    phaseDuration = null;
    round = null;
}

module.exports = {
    runGame: runGame
}