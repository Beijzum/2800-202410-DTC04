const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");
const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter(); // used for passing control from server to self
const aiModel = require("./geminiAI.js");

// PHASES: WRITE, VOTE, RESULT, WAIT, TRANSITION
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
const statusBarTemplate = fs.readFileSync("./socketTemplates/statusBar.ejs", "utf8"); // pass status: "alive" OR "dead" OR "spectate"
const postGameModalWin = fs.readFileSync("./views/templates/postGameModalWin.ejs", "utf8")
const postGameModalLose = fs.readFileSync("./views/templates/postGameModalWin.ejs", "utf8")

function runGame(io) {

    const game = io.of("/game");

    // BUG, TRYING SOMETIMES SOCKET JOINS WITHOU SESSION FOR SOME REASON, REPLICATING IT IS INCONSISTENT
    game.on("connection", (socket) => {

        // player connects to game lobby
        socket.on("joinGame", async () => {
            // for starting game solo (comment out when pushing)
            // socket.request.session.game = {};

            //player joins alive
            socket.join("alive");

            // if handle spectators (joining but not part of game)
            if (!socket.request.session.game && !gameRunning) {
                let renderedNoGameTemplate = ejs.render(noGameTemplate);
                socket.emit("noGameRunning", renderedNoGameTemplate);
                return;
            } else if (!socket.request.session.game && gameRunning) {
                let renderedStatusBarTemplate = ejs.render(statusBarTemplate, { status: "spectate" });
                socket.emit("updateStatus", renderedStatusBarTemplate);
                socket.emit("roundUpdate", round);
                socket.emit("notPlaying");
                handleSpectatorView();
                return;
            }

            // handle players that disconnect and reconnect
            if (socket.request.session.game?.dead) {
                socket.join("dead");
                let renderedStatusBarTemplate = ejs.render(statusBarTemplate, { status: "dead" });
                socket.emit("updateStatus", renderedStatusBarTemplate);
                socket.emit("roundUpdate", round);
                socket.emit("notPlaying");
                handleSpectatorView();
                return;
            }

            // user has joined and is part of the game, and is the first to join
            if (!gameRunning) {
                gameRunning = true;
                createAIs(Math.ceil(getTotalPlayerCount() / 3));
                round = 1;
            }

            // send round number to frontend
            assignClientAlias(socket);
            socket.emit("roundUpdate", round);
            let renderedStatusBarTemplate = ejs.render(statusBarTemplate, { status: "alive", socket: socket });
            socket.emit("updateStatus", renderedStatusBarTemplate);
            ee.emit("runWrite");
        });

        // CLIENT LISTENER SECTION

        // when player submit response
        socket.on("submitResponse", (response) => {
            socket.request.session.game.response = response;
        });

        socket.on("submitVote", (socketId) => {

            // handle AI voted
            let isAI = false;
            AIs.forEach(AI => {
                if (AI.id !== socketId) return;
                AI.request.session.game.votes += 1;
                isAI = true;
            })
            if (isAI) return;

            // handle players voted
            let votedPlayerSocket = game.sockets.get(socketId);
            let votedPlayerSession = votedPlayerSocket.request.session;

            if (!votedPlayerSession.game.votes) votedPlayerSession.game.votes = 1;
            else votedPlayerSession.game.votes += 1;
        });

        socket.on("disconnect", () => {
            if (!socket.request.session.game) return;
            reloadSession(socket);
            socket.request.session.game.dead = true;
            socket.request.session.save();
        });

        // FUNCTION DEFINITIONS THAT REQUIRE INDIVIDUAL SOCKETS
        async function handleSpectatorView() {
            switch (currentPhase) {
                case "WRITE":
                    let renderedWriteTemplate = ejs.render(writeTemplate, { prompt: pool.prompts[promptIndex] });
                    socket.emit("changeView", renderedWriteTemplate);
                    break;
                case "VOTE":
                    let renderedVoteTemplate = ejs.render(voteTemplate, { players: playerList, prompt: pool.prompts[promptIndex] });
                    socket.emit("changeView", renderedVoteTemplate);
                    break;
                case "RESULT":
                    // result page needs logic to render most voted player
                    let playerSocketList = await game.in("alive").fetchSockets();
                    AIs.forEach(AI => { playerSocketList.push(AI); });
                    let eliminatedSocket = getMajorityVotedSocket(playerSocketList);
                    shuffleArray(playerSocketList);

                    // if someone has majority vote
                    if (eliminatedSocket) {
                        let renderedResultTemplate = ejs.render(resultTemplate, {
                            eliminatedPlayer: mostVotedSocket,
                            remainingPlayers: playerSocketList, voteCount: mostVotedSocket.request.session.game.votes
                        });
                        socket.emit("changeView", renderedResultTemplate);
                    } else {
                        // if no one has majority vote
                        let renderedResultTemplate = ejs.render(resultTemplate, { eliminatedPlayer: null, remainingPlayers: playerSocketList });
                        socket.emit("changeView", renderedResultTemplate);
                    }
                    break;
                case "WAIT":
                    let renderedWaitTemplate = ejs.render(waitTemplate);
                    socket.emit("changeView", renderedWaitTemplate);
                    break;
                case "TRANSITION":
                    let renderedTransitionTemplate = ejs.render(transitionTemplate, { transitionMessage: "Get Ready To Vote!" });
                    socket.emit("changeView", renderedTransitionTemplate);
                    break;
                default:
                    let renderedNoGameTemplate = ejs.render(noGameTemplate);
                    socket.emit("noGameRunning", renderedNoGameTemplate);
            }
        }
    });

    // GAME CONTROL FLOW SECTION

    // handle logic for write screen
    ee.on("runWrite", async () => {
        currentPhase = "WRITE";
        game.emit("roundUpdate", round);

        // only generate new prompt when first person joins
        if (!promptIndex) promptIndex = Math.floor(Math.random() * pool.prompts.length);

        // update frontend UI for alive players
        let renderedWriteTemplate = ejs.render(writeTemplate, { prompt: pool.prompts[promptIndex] });
        game.emit("changeView", renderedWriteTemplate);

        // only run when the first user connects
        if (!phaseDuration || phaseDuration <= 0) {
            phaseDuration = 61; // 61

            // need a transition screen to be able to receive all players input, even if they havent pressed submit
            let timeout = createDelayedRedirect(phaseDuration + 1, "runTransition");

            let timer = setInterval(() => {
                handleGameTick(timer);

                if (!gameRunning) {
                    clearInterval(timer);
                    clearTimeout(timeout);
                }
            }, 1000);

            for (let i = 0; i < AIs.length; i++) {
                // ai gets chat prompt
                let aiGetPrompt = await AIs[i].chatBot.sendMessage(pool.prompts[promptIndex]);
                let aiResponse = aiGetPrompt.response;
                let aiText = aiResponse.text();

                AIs[i].request.session.game.response = aiText;
            }

        }
    });

    // handle transition between write and vote
    ee.on("runTransition", () => {
        currentPhase = "TRANSITION"

        // retrieve inputs from players that did not press submit
        game.emit("retrieveResponse");

        let renderedTransitionTemplate = ejs.render(transitionTemplate, { transitionMessage: "Get Ready To Vote!" });
        game.emit("changeView", renderedTransitionTemplate);

        if (phaseDuration <= 0) {
            phaseDuration = 6; // 6
            let timeout = createDelayedRedirect(phaseDuration + 1, "runVote");

            let timer = setInterval(() => {
                handleGameTick(timer);
                if (!gameRunning) {
                    clearInterval(timer);
                    clearTimeout(timeout)
                }
            }, 1000);
        }
    });

    // handle logic for vote screen
    // BUG, THE CSS RIGHT NOW PUSHES THE VOTE BUTTON OFF SCREEN INSTEAD OF WRAPPING, NEED TO FIX IT
    ee.on("runVote", async () => {
        currentPhase = "VOTE";

        let playerList = await game.in("alive").fetchSockets();

        // add AI to player list to populate vote page
        AIs.forEach(AI => {
            playerList.push(AI);
        });

        // shuffle list so AI is not always at bottom of the list
        shuffleArray(playerList);

        let renderedVoteTemplate = ejs.render(voteTemplate, { players: playerList, prompt: pool.prompts[promptIndex] });
        game.emit("changeView", renderedVoteTemplate);

        if (phaseDuration <= 0) {
            phaseDuration = 61; // 61

            let timeout = createDelayedRedirect(phaseDuration + 1, "runResult");
            let timer = setInterval(() => {
                handleGameTick(timer);
                if (!gameRunning) {
                    clearInterval(timer);
                    clearTimeout(timeout);
                }
            }, 1000);
        }
    });

    // handle logic for result screen
    ee.on("runResult", async () => {
        currentPhase = "RESULT";

        // get the player with the most votes
        let playerSocketList = await game.in("alive").fetchSockets();
        AIs.forEach(AI => { playerSocketList.push(AI); });
        let majorityVotedSocket = getMajorityVotedSocket(playerSocketList);

        if (majorityVotedSocket) {
            killPlayer(majorityVotedSocket);
            playerSocketList.splice(playerSocketList.indexOf(majorityVotedSocket), 1);

            shuffleArray(playerSocketList);
            let renderedResultTemplate = ejs.render(resultTemplate, {
                eliminatedPlayer: majorityVotedSocket,
                remainingPlayers: playerSocketList, voteCount: majorityVotedSocket.request.session.game.votes
            });
            game.emit("changeView", renderedResultTemplate);
        } else {
            shuffleArray(playerSocketList);
            let renderedResultTemplate = ejs.render(resultTemplate, { eliminatedPlayer: null, remainingPlayers: playerSocketList });
            game.emit("changeView", renderedResultTemplate);
        }

        if (phaseDuration <= 0) {
            phaseDuration = 11; // 11
            let timeout = createDelayedRedirect(phaseDuration + 1, "runWait");
            let timer = setInterval(() => {
                handleGameTick(timer);
                if (!gameRunning) {
                    clearInterval(timer);
                    clearTimeout(timeout);
                }
            }, 1000);
        }
    });

    // handle logic for wait screen
    ee.on("runWait", async () => {
        currentPhase = "WAIT";
        if (checkEndConditions()) {
            stopGame();
            return;
        }

        let playerSocketList = await game.in("alive").fetchSockets();

        // reset vote counter after result, so spectate still has vote count to render their pages
        playerSocketList.forEach(player => { player.request.session.game.votes = 0; });

        // move onto rendering page if game has not ended
        let renderedWaitTemplate = ejs.render(waitTemplate);
        game.emit("changeView", renderedWaitTemplate);

        // randomly remove 1 player
        let randomSocket = playerSocketList[Math.floor(Math.random() * playerSocketList.length)];
        killPlayer(randomSocket);

        // checks for if players win or lose, NEED TO ADD MORE CHECKS LATER ON WHEN AI IS ADDED


        // move onto next round
        if (phaseDuration <= 0) {
            phaseDuration = 6;
            round++;

            let timeout = setTimeout(() => {
                if (gameRunning) ee.emit("runWrite");
                else game.emit("gameOver");
            }, (phaseDuration + 1) * 1000);

            let timer = setInterval(() => {
                handleGameTick(timer);
                if (!gameRunning) {
                    clearInterval(timer);
                    clearTimeout(timeout);
                }
            }, 1000);

        }
    });

    // FUNCTION DEFINITIONS THAT REQUIRE IO 
    function checkEndConditions() {
        if (getAlivePlayerCount() === 0 || getAlivePlayerCount() <= AIs.length) {
            console.log("Defeat");
            let renderedModal = ejs.render(postGameModalLose);
            game.emit("gameLose", renderedModal);
            return true;
        } else if (AIs.length === 0) {
            console.log("Victory")
            let renderedModal = ejs.render(postGameModalWin);
            game.emit("gameWin", renderedModal);
            return true;
        } else if (getTotalPlayerCount() === 0) return true;
        else return false;
    }

    function killPlayer(socket) {
        if (!socket) return;
        // if most voted socket was AI, then remove from AI list
        if (socket.bot) {
            let index = AIs.indexOf(socket);
            AIs.splice(index, 1);
            return;
        }
        // otherwise edit which room they are in
        socket.leave("alive");
        socket.join("dead");

        let renderedStatusBarTemplate = ejs.render(statusBarTemplate, { status: "dead" });
        socket.emit("updateStatus", renderedStatusBarTemplate);
        socket.emit("notPlaying");
        socket.request.session.game.dead = true;
    }

    function getMajorityVotedSocket(playerSocketList) {
        if (playerSocketList.length === 0) return;

        let mostVotedSocket = playerSocketList[0];
        playerSocketList.forEach(socket => {
            if (socket.request.session.game.votes > mostVotedSocket.request.session.game.votes)
                mostVotedSocket = socket;
        });

        if (getAlivePlayerCount() === 0) return;
        if (mostVotedSocket.request.session.game.votes / getAlivePlayerCount() > 0.5) return mostVotedSocket;
        else return null;
    }

    function createDelayedRedirect(delayTimeInSeconds, nextRoute) {
        return setTimeout(async () => {
            // set up next round if one last phase
            if (nextRoute === "runWrite") setupNextRound();
            ee.emit(nextRoute);
        }, delayTimeInSeconds * 1000);
    }

    function handleGameTick(timer) {

        if (phaseDuration > 0) {
            phaseDuration--;
            game.emit("timerUpdate", convertFormat(phaseDuration));
            if (getTotalPlayerCount() === 0) stopGame();
        } else clearInterval(timer);
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

function shuffleArray(array) {
    let currentIndex = array.length;

    while (currentIndex !== 0) {
        let swapIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[swapIndex]] = [array[swapIndex], array[currentIndex]];
    }
}

function createAIs(numberToMake) {
    for (let i = 0; i < numberToMake; i++) {
        const aiPersonalities = Object.values(aiModel.personalities);
        let randomPersonality = aiPersonalities[Math.floor(Math.random() * aiPersonalities.length)];
        let chatBot = aiModel.createChatbot(randomPersonality).startChat();

        let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
        let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
        let randomNumber = Math.floor(Math.random() * 10000);
        let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

        let AI = {};
        AI.chatBot = chatBot;
        AI.id = randomFirstName + randomLastName + randomNumber;
        AI.bot = true;
        AI.request = {
            session: {
                game: {
                    alias: randomFirstName + randomLastName + randomNumber,
                    aliasPicture: randomAvatar,
                    votes: 0
                }
            }
        };

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
        votes: 0,
        dead: false,
        response: "",
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
    AIs = null;
    console.log("Game has stopped");
}

module.exports = {
    runGame: runGame,
    reloadSession: reloadSession
}