const fs = require("fs");
const ejs = require("ejs");
const pool = require("./socketConstants");
const EventEmitter = require("events").EventEmitter;
const ee = new EventEmitter(); // used for passing control from server to self
const aiModel = require("./geminiAI.js");

// PHASES: WRITE, VOTE, RESULT, WAIT, TRANSITION
var currentPhase, gameRunning = false, promptIndex, round, playerCount = 0;
var connectedClients = 0, timer = null;

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

    game.on("connection", (socket) => {

        connectedClients++;

        // if game running, tell client game is ready
        if (gameRunning) socket.emit("gameReady");
        // if game isn't running, and client doesnt have game, then show no game
        else if (!gameRunning && !socket.request.session.game) renderCurrentPhase();

        // first person to join the lobby before game has started signals to server to start game
        if (socket.request.session.game && !gameRunning) startGame();
        
        // assign new socket to old id if they were originally a player
        let gameSession = playerList.find(session => session.username === socket.request.session.username);
        if (gameSession) {
            socket.id = gameSession.originalSocketId;
            socket.request.session.game = true;
        }
        socket.emit("idAssigned");
  
        // player connects to game lobby
        socket.on("joinGame", () => {
            
            // if no game running then do nothing
            if (!gameRunning) {
                renderCurrentPhase();
                return;
            }
            
            // navigated to screen but not part of game
            if (!socket.request.session.game) {
                renderUI("spectate");
                renderCurrentPhase();
                return;
            }

            // no game session means first time joining, meaning start of the game
            if (!gameSession) {
                gameSession = createGameSession(socket);
                playerList.push(gameSession);
                combinedList.push(gameSession);
                if (playerCount === playerList.length) shuffleArray(combinedList);
            }
            if (gameSession.dead) renderUI("dead");
            else renderUI("alive");
            renderCurrentPhase();
        });

        // CLIENT LISTENER SECTION

        // when player submit response
        socket.on("submitResponse", (response) => {
            playerList.find(player => player.originalSocketId === socket.id).response = response;
        });

        socket.on("submitVote", (socketId) => {
            let votedPlayer = combinedList.find(player => player.originalSocketId === socketId || player.id === socketId);
            votedPlayer.votes += 1;
        });

        socket.on("disconnect", async () => {
            connectedClients--;
            reloadSession(socket);
            socket.request.session.game = false;
            socket.request.session.save();
        });

        // FUNCTION DEFINITIONS THAT REQUIRE INDIVIDUAL SOCKETS

        // status can only be "alive", "dead", "spectate"
        function renderUI(status) {
            if (!gameRunning) return;

            let statusBarHTML;
            if (status === "alive")
                statusBarHTML = ejs.render(statusBarTemplate, { status: "alive", player: gameSession });
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
                let eliminatedPlayer = getMajorityVotedPlayer();
                let resultHTML = ejs.render(resultTemplate, { eliminatedPlayer: eliminatedPlayer, remainingPlayers: combinedList });
                socket.emit("changeView", resultHTML);

            } else if (currentPhase === "WAIT") {
                let waitHTML = ejs.render(waitTemplate);
                socket.emit("changeView", waitHTML);

            } else {
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
        prepareNextPhase(61, "runTransition"); // Original duration: 61

        // get AIs response
        for(let i = 0; i < AIs.length; i++) {
            if (AIs[i].dead === true) continue;
            let AIResponse = (await AIs[i].chatBot.sendMessage(pool.prompts[promptIndex])).response.text();
            AIs[i].response = AIResponse;
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
        prepareNextPhase(6, "runVote"); // Original duration: 6
    });

    // vote screen logic
    ee.on("runVote", async () => {
        currentPhase = "VOTE";
        if (!gameRunning) return;
        let voteHTML = ejs.render(voteTemplate, { players: combinedList, prompt: pool.prompts[promptIndex] });
        game.emit("changeView", voteHTML);
        prepareNextPhase(61, "runResult"); // Original duration: 61
    });

    // result screen logic
    ee.on("runResult", async () => {
        currentPhase = "RESULT";
        if (!gameRunning) return;

        // get the player with the most votes
        let majorityVotedPlayer = getMajorityVotedPlayer();
        killPlayer(majorityVotedPlayer); // will do nothing if no majority
        let resultHTML = ejs.render(resultTemplate, { 
            eliminatedPlayer: majorityVotedPlayer, remainingPlayers: combinedList,
            voteCount: majorityVotedPlayer?.votes
        });
        game.emit("changeView", resultHTML);
        prepareNextPhase(11, "runWait"); // Original duration: 11
    });

    // wait screen logic
    ee.on("runWait", async () => {
        currentPhase = "WAIT";
        
        let waitHTML = ejs.render(waitTemplate);
        game.emit("changeView", waitHTML);

        // check if win or lose conditions have been met, early return if met
        handleGameEnd();
        if (!gameRunning) return;
        killRandomPlayer();
        handleGameEnd();
        if (!gameRunning) return;

        // reset vote counts
        combinedList.forEach(player => { player.votes = 0; });

        // handle next round if game has not ended
        prepareNextPhase(6, "runWrite"); // Original duration: 6
    });

    // FUNCTION DEFINITIONS THAT REQUIRE IO 

    function startGame() {
        gameRunning = true;
        round = 1;
        createAIs(Math.ceil(playerCount / 3));
        ee.emit("runWrite");
        console.log("A game session has started");
        game.emit("gameReady");
    }

    function stopGame() {
        // reset global variables
        currentPhase = null;
        gameRunning = false;
        promptIndex = null;
        round = null;
        playerCount = 0;
        AIs.length = 0;
        combinedList.length = 0;
        clearInterval(timer);
        timer = null;
        
        // clear everyones game session at end of game
        playerList.forEach(player => {
            let socket = game.sockets.get(player.originalSocketId);
            if (!socket) return;
            reloadSession(socket);
            socket.request.session.game = false;
            socket.request.session.save();
            
        });
        playerList.length = 0;
        console.log("A game session has ended");
    }

    function handleGameEnd() {
        if (getAlivePlayerCount() < getAliveAICount()) {
            stopGame();
            let postModalHTML = ejs.render(postGameModalLose);
            game.emit("gameLose", postModalHTML);
        } else if (getAliveAICount() === 0) {
            stopGame();
            let postModalHTML = ejs.render(postGameModalWin);
            game.emit("gameWin", postModalHTML);
        }
    }

    function killRandomPlayer() {
        let playerListCopy = [...playerList], killedPlayer = false;
        while (!killedPlayer) {
            let randomIndex = Math.floor(Math.random() * playerListCopy.length);
            if (playerListCopy[randomIndex].dead)
                playerListCopy.splice(randomIndex, 1);
            else {
                killPlayer(playerListCopy[randomIndex]);
                killedPlayer = true;
            }
        }
    }

    function killPlayer(player) {
        if (!player) return;

        player.dead = true;
        combinedList.splice(combinedList.indexOf(player), 1);

        // early return when voted is bot
        if (player.bot) return;

        let playerSocket = game.sockets.get(player.originalSocketId);
        if (!playerSocket) return;
        let statusBarHTML = ejs.render(statusBarTemplate, { status: "dead" });
        playerSocket.emit("updateStatus", statusBarHTML);
        playerSocket.emit("notPlaying");
        if (currentPhase === "WAIT") playerSocket.emit("killedByAI");
    }

    function getMajorityVotedPlayer() {
        let mostVotedPlayer = combinedList[0];
        
        // find most voted
        combinedList.forEach(player => {
            if (player.votes > mostVotedPlayer.votes)
                mostVotedPlayer = player;
        });
        if (mostVotedPlayer.votes / getAlivePlayerCount() > 0.5) return mostVotedPlayer;
        else return null;
    }

    function prepareNextPhase(length, nextPhase) {
        console.log(`Current Phase: ${currentPhase}`);
        if (timer) clearInterval(timer);
        let timeout = createDelayedRedirect(length + 1, nextPhase);
        let countdown = length;
        timer = setInterval(() => {
            countdown--;
            handleGameTick(timeout, countdown);
        }, 1000);
    }

    function createDelayedRedirect(delayTimeInSeconds, nextRoute) {
        return setTimeout(() => {
            // set up next round if one last phase
            if (nextRoute === "runWrite") setupNextRound();
            ee.emit(nextRoute);
        }, delayTimeInSeconds * 1000);
    }

    function handleGameTick(timeout, length) {
        if (!gameRunning) {
            clearTimeout(timeout);
            return;
        }
        if (length >= 0) {
            if (connectedClients <= 0) stopGame();
            game.emit("timerUpdate", convertFormat(length));
        } else clearInterval(timer);
    }

}

// GENERAL FUNCTION DEFINITIONS

function getAlivePlayerCount() {
    let count = 0;
    playerList.forEach(player => {
        if (!player.dead) count++;
    });
    return count;
}

function getAliveAICount() {
    let count = 0;
    AIs.forEach(AI => {
        if (!AI.dead) count++;
    });
    return count;
}

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

        let name = randomFirstName + randomLastName + randomNumber;
        let AI = {chatBot: chatBot, id: name, alias: name, bot: true,
            aliasPicture: randomAvatar, votes: 0, dead: false
        };

        AIs.push(AI);
        combinedList.push(AI);
    }
}

function createGameSession(socket) {
    let randomFirstName = pool.firstNames[Math.floor(Math.random() * pool.firstNames.length)];
    let randomLastName = pool.lastNames[Math.floor(Math.random() * pool.lastNames.length)];
    let randomNumber = Math.floor(Math.random() * 10000);
    let randomAvatar = pool.avatars[Math.floor(Math.random() * pool.avatars.length)];

    let session = {
        originalSocketId: socket.id,
        username: socket.request.session.username,
        alias: randomFirstName + randomLastName + randomNumber,
        aliasPicture: randomAvatar,
        votes: 0,
        dead: false,
        response: "",
    }
    return session;
}

function reloadSession(socket) {
    socket.request.session.reload((err) => {
        if (err) return socket.disconnect();
    });
}

function convertFormat(seconds) {
    return `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? "0" + seconds % 60 : seconds % 60}`;
}

function setupNextRound() {
    round++;
    promptIndex = null;
}

module.exports = {
    runGame: runGame,
    reloadSession: reloadSession,
    eventEmitter: ee
}