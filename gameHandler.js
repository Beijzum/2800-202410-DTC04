const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");
const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter(); // used for passing control from server to self
const aiModel = require("./geminiAI.js");

// PHASES: WRITE, VOTE, RESULT, WAIT, TRANSITION
var currentPhase, gameRunning = false, promptIndex, phaseDuration, round, playerCount = 0;

// AIs = list of AIs, players = list of players, combinedList = list of both players and AIs, remove players from combinedList
const AIs = [], playerList = [], combinedList = [];

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

        // socket.on("connect", () => {
        //     if (!socket.request.session.game) return;

        //     // compare if joined game session is in player list
        //     playerList.forEach(gameSession => {
        //         if (gameSession.username === socket.request.session.username)
        //             socket.id = gameSession.originalSocketId;
        //     });
        // })

        // player connects to game lobby
        socket.on("joinGame", () => {
            // for starting game solo (comment out when pushing)
            // socket.request.session.game = {};

            // first person to join the lobby before game has started signals to server to start game
            if (socket.request.session.game && !gameRunning) startGame();

            // if game didnt start, then game isn't running
            if (!gameRunning) {
                renderCurrentPhase();
                return;
            }
            
            // navigated to screen but not part of game
            if (!socket.request.session.game) renderUI("spectate");

            // player refreshed the page (should be dead after disconnecting)
            else if (socket.request.session.game.dead) renderUI("dead");
            
            // player is part of the game (joined at the beginning of game, no disconnect)
            else {
                assignClientAlias(socket);
                playerList.push(socket);
                combinedList.push(socket);
                // shuffle array once last player joins
                if (playerCount === playerList.length) shuffleArray(combinedList);
                renderUI("alive");
            }
            renderCurrentPhase();
        });

        // CLIENT LISTENER SECTION

        // when player submit response
        socket.on("submitResponse", (response) => {
            socket.request.session.game.response = response;
        });

        socket.on("submitVote", (socketId) => {
            let votedPlayer = combinedList.find(player => player.id === socketId);
            votedPlayer.request.session.game.votes += 1;
        });

        socket.on("disconnect", async () => {
            if (!socket.request.session.game) return;
            await reloadSession(socket);
            socket.request.session.game.dead = true;
            socket.request.session.save();
        });

        // FUNCTION DEFINITIONS THAT REQUIRE INDIVIDUAL SOCKETS

        // status can only be "alive", "dead", "spectate"
        function renderUI(status) {
            if (!gameRunning) return;

            let statusBarHTML;
            if (status === "alive")
                statusBarHTML = ejs.render(statusBarTemplate, { status: "alive", socket: socket });
            else 
                statusBarHTML = ejs.render(statusBarTemplate, { status: status });

            socket.emit("updateStatus", statusBarHTML);
            socket.emit("roundUpdate", round);
            if (status === "dead" || status === "spectate")
                socket.emit("notPlaying");
        }

        function renderCurrentPhase() {
            if (currentPhase === "WRITE") {
                let writeHTML = ejs.render(writeTemplate, { prompt: pool.prompts[promptIndex] });
                socket.emit("changeView", writeHTML);

            } else if (currentPhase === "TRANSITION") {
                let transitionHTML = ejs.render(transitionTemplate, { transitionMessage: "Get Ready to Vote!" });
                socket.emit("changeView", transitionHTML);

            } else if (currentPhase === "VOTE") {
                let voteHTML = ejs.render(voteTemplate, { players: combinedList, prompt: pool.prompts[promptIndex] });
                socket.emit("changeView", voteHTML);

            } else if (currentPhase === "RESULT") {
                let eliminatedSocket = getMajorityVotedPlayer();
                let resultHTML;
                if (eliminatedSocket)
                    resultHTML = ejs.render(resultTemplate, { eliminatedPlayer: eliminatedSocket, remainingPlayers: combinedList });
                else
                    resultHTML = ejs.render(resultTemplate, { eliminatedPlayer: null, remainingPlayers: combinedList });
                socket.emit("changeView", resultHTML);

            } else if (currentPhase === "WAIT") {
                let waitHTML = ejs.render(waitTemplate);
                socket.emit("changeView", waitHTML);

            } else {
                // runs when no phase (i.e. no game running)
                let noGameHTML = ejs.render(noGameTemplate);
                socket.emit("changeView", noGameHTML);
            }
        }
    });

    // CROSS NAMESPACE UPDATERS
    ee.on("updatePlayerCount", (updateValue) => {
        if (gameRunning) return;
        playerCount += updateValue;
    })

    // GAME CONTROL FLOW SECTION

    // write screen logic
    ee.on("runWrite", async () => {
        currentPhase = "WRITE";
        if (!gameRunning) return;

        game.emit("roundUpdate", round);

        // render prompt and screen to connected clients
        promptIndex = Math.floor(Math.random() * pool.prompts.length);
        let writeHTML = ejs.render(writeTemplate, { prompt: pool.prompts[promptIndex] });
        game.emit("changeView", writeHTML);
        prepareNextPhase(1, "runTransition"); // Original duration: 61

        // get AIs response
        for(let i = 0; i < AIs.length; i++) {
            if (AIs[i].dead === true) continue;
            let AIResponse = (await AIs[i].chatBot.sendMessage(pool.prompts[promptIndex])).response.text();
            AIs[i].request.session.game.response = AIResponse;
        }
    });

    // transition screen logic
    ee.on("runTransition", () => {
        currentPhase = "TRANSITION"
        if (!gameRunning) return;

        // retrieve inputs from players that did not press submit
        game.emit("retrieveResponse");

        let transitionHTML = ejs.render(transitionTemplate, { transitionMessage: "Get Ready To Vote!" });
        game.emit("changeView", transitionHTML);
        prepareNextPhase(1, "runVote"); // Original duration: 6
    });

    // vote screen logic
    ee.on("runVote", async () => {
        currentPhase = "VOTE";
        if (!gameRunning) return;
        combinedList.forEach(session => {
            console.log(session);
        })
        let voteHTML = ejs.render(voteTemplate, { players: combinedList, prompt: pool.prompts[promptIndex] });
        game.emit("changeView", voteHTML);
        prepareNextPhase(1, "runResult"); // Original duration: 61
    });

    // result screen logic
    ee.on("runResult", async () => {
        currentPhase = "RESULT";
        if (!gameRunning) return;

        // get the player with the most votes
        let majorityVotedSocket = getMajorityVotedPlayer();
        killPlayer(majorityVotedSocket); // will do nothing if no majority
        let resultHTML = ejs.render(resultTemplate, { 
            eliminatedPlayer: majorityVotedSocket, remainingPlayers: combinedList,
            voteCount: majorityVotedSocket?.request.session.game.votes
        });
        game.emit("changeView", resultHTML);
        prepareNextPhase(1, "runWait"); // Original duration: 11
    });

    // wait screen logic
    ee.on("runWait", async () => {
        currentPhase = "WAIT";
        killRandomPlayer();
        let waitHTML = ejs.render(waitTemplate);
        game.emit("changeView", waitHTML);

        // check if win or lose conditions have been met, early return if met
        handleGameEnd();
        if (!gameRunning) return;

        // reset vote counts
        combinedList.forEach(player => { player.request.session.game.votes = 0; });

        // handle next round if game has not ended
        round++;
        prepareNextPhase(1, "runWrite"); // Original duration: 6
    });

    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function handleGameEnd() {
        if (getAlivePlayerCount() < AIs.length) {
            stopGame();
            let postModalHTML = ejs.render(postGameModalLose);
            game.emit("gameLose", postModalHTML);
        } else if (AIs.length === 0) {
            stopGame();
            let postModalHTML = ejs.render(postGameModalWin);
            game.emit("gameWin", postModalHTML);
        }
    }

    function killRandomPlayer() {
        let playerListCopy = [...playerList], killedPlayer = false;
        while (!killedPlayer) {
            let randomIndex = Math.floor(Math.random() * playerListCopy.length);
            if (playerListCopy[randomIndex].request.session.game.dead)
                playerListCopy.splice(randomIndex, 1);
            else {
                killPlayer(playerListCopy[randomIndex]);
                killedPlayer = true;
            }
        }
    }

    function killPlayer(player) {
        // player = socket or bot
        if (!player) return;

        player.request.session.game.dead = true;
        combinedList.splice(combinedList.indexOf(player), 1);

        // early return when voted is bot
        if (player.bot) return;

        let statusBarHTML = ejs.render(statusBarTemplate, { status: "dead" });
        player.emit("updateStatus", statusBarHTML);
        player.emit("notPlaying");
    }

    function getMajorityVotedPlayer() {
        let mostVotedPlayer = combinedList[0];
        
        // find most voted
        combinedList.forEach(player => {
            if (player.request.session.game.votes > mostVotedPlayer.request.session.game.votes)
                mostVotedPlayer = player;
        });
        if (mostVotedPlayer.request.session.game.votes / getAlivePlayerCount() > 0.5) return mostVotedPlayer;
        else return null;
    }

    function prepareNextPhase(length, nextPhase) {
        phaseDuration = length;
        let timeout = createDelayedRedirect(phaseDuration + 1, nextPhase);
        let timer = setInterval(() => handleGameTick(timeout, timer), 1000);
    }

    function createDelayedRedirect(delayTimeInSeconds, nextRoute) {
        return setTimeout(() => {
            // set up next round if one last phase
            if (nextRoute === "runWrite") setupNextRound();
            ee.emit(nextRoute);
        }, delayTimeInSeconds * 1000);
    }

    function handleGameTick(timeout, timer) {
        if (!gameRunning) {
            clearTimeout(timeout);
            clearInterval(timer);
            return;
        }
        if (phaseDuration > 0) {
            phaseDuration--;
            game.emit("timerUpdate", convertFormat(phaseDuration));
            if (playerList.length === 0) stopGame();
        } else clearInterval(timer);
    }

    function getAlivePlayerCount() {
        let count = 0;
        playerList.forEach(player => {
            if (!player.request.session.game.dead) count++;
        });
        return count;
    }
}

// GENERAL FUNCTION DEFINITIONS

// Taken from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array, based on the Fisher-Yates shuffling algorithm
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
                    votes: 0,
                    dead: false
                }
            }
        };
        AIs.push(AI);
        combinedList.push(AI);
    }
}

function assignClientAlias(socket) {
    let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
    let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
    let randomNumber = Math.floor(Math.random() * 10000);
    let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

    socket.request.session.game = {
        originalSocketId: socket.id,
        username: socket.request.session.username,
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
    });
}

function convertFormat(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" + seconds % 60 : seconds % 60}`;
}

function startGame() {
    gameRunning = true;
    round = 1;
    createAIs(Math.ceil(playerCount / 3));
    ee.emit("runWrite");
}

function setupNextRound() {
    promptIndex = null;
    phaseDuration = null;
}

function stopGame() {
    // reset global variables
    currentPhase = null;
    gameRunning = false;
    promptIndex = null;
    phaseDuration = null;
    round = null;
    playerCount = 0;
    AIs.length = 0;
    playerList.length = 0;
    combinedList.length = 0;

    // clear everyones game session at end of game
    playerList.forEach(player => {
        reloadSession(player);
        player.request.session.game = null;
        player.request.session.save();
    });

    console.log("Game has stopped");
}

module.exports = {
    runGame: runGame,
    reloadSession: reloadSession,
    eventEmitter: ee
}