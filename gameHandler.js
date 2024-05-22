const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");
const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter(); // used for passing control from server to self

// PHASES: WRITE, VOTE, RESULT, WAIT
var currentPhase, gameRunning = false, promptIndex, phaseDuration, round, AIs = [];

// CHECK TO SEE IF REDIRECTING TO NEW PAGE CAUSES A NEW SOCKET SESSION TO BE CREATE ---> DIFFERENT ID SO PLAYERS WONT BE COUNTED AS "IN-GAME"

// CURRENT SETUP ASSUMES THAT EVERY USER REDIRECTING TO THIS PAGE IS A PLAYER AND NO ONE HAS JOINED LATE, THIS HAS TO BE CHANGED LATER ON

// ejs templates for game windows
const writeTemplate = fs.readFileSync("./socketTemplates/write.ejs", "utf8");
const voteTemplate = fs.readFileSync("./socketTemplates/vote.ejs", "utf8");
const noGameTemplate = fs.readFileSync("./socketTemplates/noGame.ejs", "utf8");
const waitTemplate = fs.readFileSync("./socketTemplates/wait.ejs", "utf8");
const resultTemplate = fs.readFileSync("./socketTemplates/result.ejs", "utf8");
const transitionTemplate = fs.readFileSync("./socketTemplates/transition.ejs", "utf8");

function runGame(io) {

    const game = io.of("/game");

    game.on("connection", (socket) => {
        
        // player connects to game lobby
        socket.on("joinGame", async () => {

            // joining game indicates you are a player
            if (socket.request.session.game) socket.join("alive");

            // user has joined, but no game is running
            if (getTotalPlayerCount() === 0) {
                let renderedNoGameTemplate = ejs.render(noGameTemplate);
                socket.emit("noGameRunning", renderedNoGameTemplate);
                return;
            }

            // joining dead indicates you are dead
            if (socket.request.session.game?.dead) {
                socket.join("dead");
                socket.emit("notPlaying");
            }
    
            // user has joined and is part of the game, and is the first to join
            if (gameRunning === false) {
                gameRunning = true;
                round = 1;
            }
    
            // send round number to frontend
            socket.emit("roundUpdate", round);

            // user has joined, and is part of the game
            if (socket.request.session.game) {
                await assignClientAlias(socket);
                ee.emit("runWrite", socket);
            } else {
                // user has joined, but is not part of the game
                socket.emit("notPlaying");
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
    
        // CLIENT LISTENER SECTION
    
        // when player submit response
        socket.on("submitResponse", (response) => {
            socket.request.session.game.response = response;
        });
    
        socket.on("submitVote", (socketId) => {
            let votedPlayerSocket = game.sockets.get(socketId);
            let votedPlayerSession = votedPlayerSocket.request.session;
            
            if (!votedPlayerSession.game.votes) votedPlayerSession.game.votes = 1;
            else votedPlayerSession.game.votes += 1;
        });

        socket.on("disconnect", () => {
            // if you are part of the game, stop the entire game, need to implement logic later
            if (socket.rooms.has("alive") || socket.rooms.has("dead")) {
                
            }
        })
    });

    // GAME CONTROL FLOW SECTION

    // handle logic for write screen
    ee.on("runWrite", () => {
        currentPhase = "WRITE";

        // only generate new prompt when first person joins
        if (!promptIndex) promptIndex = Math.floor(Math.random() * pool.prompts.length);

        // update frontend UI for alive players
        let renderedWriteTemplate = ejs.render(writeTemplate, {prompt: pool.prompts[promptIndex]});
        game.emit("changeView", renderedWriteTemplate);

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

        // retrieve inputs from players that did not press submit
        game.emit("retrieveResponse");

        let renderedTransitionTemplate = ejs.render(transitionTemplate, {transitionMessage: "Get Ready To Vote!"});
        game.emit("changeView", renderedTransitionTemplate);

        if (phaseDuration <= 0) {
            phaseDuration = 6;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runVote");
        }
    });

    // handle logic for vote screen
    // BUG, THE CSS RIGHT NOW PUSHES THE VOTE BUTTON OFF SCREEN INSTEAD OF WRAPPING, NEED TO FIX IT
    ee.on("runVote", async () => {
        currentPhase = "VOTE";

        let playerList = await game.in("alive").fetchSockets();

        let renderedVoteTemplate = ejs.render(voteTemplate, {players: playerList, prompt: pool.prompts[promptIndex]});
        game.emit("changeView", renderedVoteTemplate);
        
        if (phaseDuration <= 0) {
            
            phaseDuration = 61;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runResult");
        }
    });

    // handle logic for result screen
    ee.on("runResult", async () => {
        currentPhase = "RESULT";

        // get the player with the most votes
        let playerSocketList = await game.in("alive").fetchSockets();
        let mostVotedSocket = playerSocketList[0];
        playerSocketList.forEach(socket => {
            if (socket.request.session.game.votes > mostVotedSocket.request.session.game.votes)
                mostVotedSocket = socket;
        });

        // if voted player has majority votes
        if (mostVotedSocket.request.session.game.votes / getAlivePlayerCount() > 0.5) {
            killPlayer(mostVotedSocket);

            playerSocketList.splice(playerSocketList.indexOf(mostVotedSocket), 1);
            let renderedResultTemplate = ejs.render(resultTemplate, {eliminatedPlayer: mostVotedSocket, 
                remainingPlayers: playerSocketList, voteCount: mostVotedSocket.request.session.game.votes});
            game.emit("changeView", renderedResultTemplate);
        } else {
            // if no majority vote
            let renderedResultTemplate = ejs.render(resultTemplate, {eliminatedPlayer: null, remainingPlayers: playerSocketList});
            game.emit("changeView", renderedResultTemplate);
        }

        // reset vote counter after results have been calculated
        playerSocketList.forEach(player => {player.request.session.game.votes = 0; });

        if (phaseDuration <= 0) {
            
            phaseDuration = 11;
            let timer = setInterval(updateClientTimers, 1000);
            createDelayedRedirect(phaseDuration + 1, timer, "runWait");
        }
    });

    // handle logic for wait screen
    ee.on("runWait", async () => {
        currentPhase = "WAIT";

        // move onto rendering page if game has not ended
        let renderedWaitTemplate = ejs.render(waitTemplate);
        game.emit("changeView", renderedWaitTemplate);
        game.emit("roundUpdate", round);

        // randomly remove 1 player
        let playerSocketList = await game.in("alive").fetchSockets();
        let randomSocket = playerSocketList[Math.floor(Math.random() * playerSocketList.length)];
        killPlayer(randomSocket);

        // checks for if players win or lose, NEED TO ADD MORE CHECKS LATER ON WHEN AI IS ADDED
        if (getAlivePlayerCount() === 0)
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
                    game.emit("gameOver");
            }, (phaseDuration + 1) * 1000);
        }
    });


    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function killPlayer(socket) {
        if (!socket) return;
        socket.leave("alive");
        socket.join("dead");
        socket.emit("notPlaying");
        socket.request.session.game.dead = true;
    }

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
            game.emit("timerUpdate", convertFormat(phaseDuration));
        }
    }

    function getTotalPlayerCount() {
        let alivePlayers = game.adapter.rooms.get("alive")?.size ? game.adapter.rooms.get("alive").size : 0;
        let deadPlayers = game.adapter.rooms.get("dead")?.size ? game.adapter.rooms.get("dead").size : 0;
        return alivePlayers - deadPlayers;
    }


    function getAlivePlayerCount() {
        let alivePlayers = game.adapter.rooms.get("alive")?.size ? game.adapter.rooms.get("alive").size : 0;
        return alivePlayers;
    }
}

// GENERAL FUNCTION DEFINITIONS

function createAIs(numberToMake) {
    for (let i = 0; i < numberToMake; i++) {
        let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
        let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
        let randomNumber = Math.floor(Math.random() * 10000);
        let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

        let AI = {};
        AI.request = {session: {game: {
            alias: randomFirstName + randomLastName + randomNumber,
            aliasPicture: randomAvatar,
            votes: 0
        }}};
        
        AIs.push(AI);
    }
}

function assignClientAlias(socket) {
    let req = socket.request;

    let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
    let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
    let randomNumber = Math.floor(Math.random() * 10000);
    let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

    req.session.game = {
        alias: randomFirstName + randomLastName + randomNumber,
        aliasPicture: randomAvatar,
        votes: 0
    }

}

async function reloadSession(socket) {
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
    runGame: runGame,
    reloadSession: reloadSession
}