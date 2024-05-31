/* Part of code from: https://socket.io/docs/v4/, https://www.youtube.com/watch?v=jD7FnbI76Hg */

const { Server, Socket } = require("socket.io");
const gameHandler = require("./gameHandler");

/**
 * Handles the socket server.
 * 
 * This function is responsible for handling the socket server. It will handle the following events:
 * - When a user joins the lobby
 * - When a user sends a message
 * - When a user disconnects
 * - When a user is ready
 * - When a user is unready
 * - When a game starts, pulling all players into the game
 * 
 * For game logic, it will delegate to the gameHandler module.
 * 
 * @param {Server} io the server for handling socketing
 */
function runSocket(io) {
    const userList = new Map(); // used to keep track of connected users

    let readyTimer = null, countdown;
    io.on("connection", async (socket) => {

        if (socket.request.session.game) removeClientFromGame(socket);

        // Player joins chatroom lobby
        socket.on("joinLobby", () => {
            socket.join("lobby");
            socket.emit("systemMessage", formatMessage("", "", "You have joined the room"));
            socket.broadcast.emit("systemMessage", formatMessage(socket.request.session.username, socket.request.session.profilePic, `${socket.request.session.username} has joined the room`));
            updateReadyMessage(socket);
            userList.set(socket.request.session.username, socket.request.session.profilePic);
            // userList.add({username: socket.request.session.username, profilePicture: socket.request.session.profilePic}); // update user list
            io.emit("updateUserList", Array.from(userList.entries())); // notify client
        });

        // when users message
        socket.on("message", (message) => {
            io.emit("message", formatMessage(socket.request.session.username, socket.request.session.profilePic, message));
        });

        // When disconnect
        socket.on("disconnect", () => {
            io.emit("systemMessage", formatMessage("", "", `${socket.request.session.username} has disconnected`));
            
            // stop countdown if leaver drops player count to less than 3
            if (io.sockets.adapter.rooms.get("readyList")?.size < 3 && readyTimer) {
                clearInterval(readyTimer);
                readyTimer = null;
                updateReadyMessage(socket);
                // move everyone out of ready list
                io.sockets.adapter.rooms.get("readyList").forEach(client => io.sockets.sockets.get(client).leave("readyList"));
                io.emit("cancelReady");
            }
            userList.delete(socket.request.session.username); // update user list
            io.emit("updateUserList", Array.from(userList.entries())); // notify client
        });

        // Triggered when a user readies up
        socket.on("ready", async () => {
            socket.join("readyList");
            gameHandler.eventEmitter.emit("updatePlayerCount", 1);
            addClientToGame(socket);
            if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) return;
            
            if (io.sockets.adapter.rooms.get("lobby")?.size >= 3) {
                if (readyTimer) return;
                io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList")?.size}/${io.sockets.adapter.rooms.get("lobby")?.size})`);
            } else {
                socket.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby")?.size}/3)`);
            }

            if (io.sockets.adapter.rooms.get("lobby")?.size < 3) return;

            if (io.sockets.adapter.rooms.get("readyList")?.size / io.sockets.adapter.rooms.get("lobby")?.size >= 0.5) {
                if (readyTimer) return;
                countdown = 60;
                io.emit("readyTimerUpdate", countdown);
                readyTimer = setInterval(async () => {
                    countdown--;
                    if (countdown > 0) {
                        io.emit("readyTimerUpdate", countdown);
                        return;
                    }

                    clearInterval(readyTimer);
                    io.emit("startGame");
                }, 1000);

            } else {
                if (!readyTimer) return;
                clearInterval(readyTimer);
                readyTimer = null;
                updateReadyMessage(socket);
            }
        });

        // Triggered when a user un-readies
        socket.on("unready", () => {
            gameHandler.eventEmitter.emit("updatePlayerCount", -1);
            removeClientFromGame(socket);
            socket.leave("readyList");
            if (readyTimer) {
                if (io.sockets.adapter.rooms.get("readyList")?.size / io.sockets.adapter.rooms.get("lobby")?.size < 0.5) {
                    clearInterval(readyTimer);
                    readyTimer = null;
                    updateReadyMessage(socket);
                } 
            } else updateReadyMessage(socket);

        });

        // Triggers when the game starts
        socket.on("forceJoin", async () => {
            addClientToGame(socket);
            socket.join("readyList");
        });
    });
    
    // Delegate game logic sockets to external module
    gameHandler.runGame(io);
    
    /**
     * Updates the ready message for all clients.
     */
    function updateReadyMessage() {
        if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) {
            io.emit("updateReadyMessage", "Waiting for Game to Start...");
            return;
        }

        if (io.sockets.adapter.rooms.get("lobby")?.size < 3)
            io.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby")?.size}/3)`);
        else
            io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList")?.size}/${io.sockets.adapter.rooms.get("lobby")?.size})`);
    }

}

// Format message. Could probably move it elsewhere.
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

function removeClientFromGame(socket) {
    gameHandler.reloadSession(socket);
    socket.request.session.game = false;
    socket.request.session.save();
}

function addClientToGame(socket) {
    gameHandler.reloadSession(socket);
    socket.request.session.game = true;
    socket.request.session.save();
}

/**
 * Formats a user's message for client display.
 * 
 * @param {String} username username of the user
 * @param {String} profilePic profile picture of the user
 * @param {String} text message text
 * @returns object with the message formatted and the time
 */
function formatMessage(username, profilePic, text) {
    return {
        username,
        profilePic,
        text,
        time: dayjs().tz('America/Vancouver').format("h:mm a")
    };
}

module.exports = {
    runSocket: runSocket
};