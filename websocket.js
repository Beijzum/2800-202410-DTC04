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
    // when a user connects to the server
    io.on("connection", (socket) => {

        // Player joins chatroom lobby
        socket.on("joinLobby", () => {
            socket.join("lobby");
            socket.emit("systemMessage", formatMessage("", "", "You have joined the room"));
            socket.broadcast.emit("systemMessage", formatMessage(socket.request.session.username, socket.request.session.profilePic, `${socket.request.session.username} has joined the room`));
            updateReadyMessage(socket);
            userList.set(socket.request.session.username, socket.request.session.profilePic);
            // userList.add({username: socket.request.session.username, profilePicture: socket.request.session.profilePic}); // update user list
            io.emit("updateUserList", Array.from(userList.entries())); // notify client

            // handle players that just returned back to lobby, ADD SHOWING MODAL WHEN SESSION HAS A WIN/LOSE STATE THAT WILL BE ADDED IN GAME HANDLER
            if (socket.request.session.game) {
                removeClientFromGame(socket);
            }
        });

        // when users message
        socket.on("message", (message) => {
            io.emit("message", formatMessage(socket.request.session.username, socket.request.session.profilePic, message));
        });

        // When disconnect
        socket.on("disconnect", () => {
            io.emit("systemMessage", formatMessage("", "", `${socket.request.session.username} has disconnected`));
            updateReadyMessage(socket);
            userList.delete(socket.request.session.username); // update user list
            io.emit("updateUserList", Array.from(userList.entries())); // notify client
        });

        // Triggered when a user readies up
        socket.on("ready", async () => {
            socket.join("readyList");

            if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) return;

            if (io.sockets.adapter.rooms.get("lobby").size >= 3) {
                io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList").size}/${io.sockets.adapter.rooms.get("lobby").size})`);
            } else {
                socket.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby").size}/3)`);
            }

            if (io.sockets.adapter.rooms.get("lobby").size < 3) return;

            if (io.sockets.adapter.rooms.get("readyList").size / io.sockets.adapter.rooms.get("lobby").size >= 0.5) {
                // TODO: cleanup this crime against humanity
                if (readyTimer) return;
                countdown = 10;
                io.emit("readyTimerUpdate", countdown);
                readyTimer = setInterval(() => {
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(readyTimer);
                        readyTimer = null;
                        addClientToGame(socket)
                        .then(()=> io.emit("startGame"))
                    } else io.emit("readyTimerUpdate", countdown);
                }, 1000);
            } else {
                if (readyTimer) {
                    clearInterval(readyTimer);
                    readyTimer = null;
                    updateReadyMessage(socket);
                }
            }
        });

        // Triggered when a user un-readies
        socket.on("unready", () => {
            socket.leave("readyList");
            if (readyTimer) {
                if (io.sockets.adapter.rooms.get("readyList").size / io.sockets.adapter.rooms.get("lobby").size < 0.5) {
                    clearInterval(readyTimer);
                    readyTimer = null;
                    updateReadyMessage(socket);
                } 
            } else updateReadyMessage(socket);

        });

        // Triggers when the game starts
        socket.on("forceJoin", async () => {
            socket.join("readyList");
            await addClientToGame(socket);
        })
    });
    
    // Delegate game logic sockets to external module
    gameHandler.runGame(io);
    
    /**
     * Updates the ready message for all clients.
     * 
     * @param {Socket} _ client socket - unsused
     */
    function updateReadyMessage(_) {
        if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) {
            io.emit("updateReadyMessage", "Waiting for Game to Start...");
            return;
        }

        if (io.sockets.adapter.rooms.get("lobby").size < 3)
            io.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby").size}/3)`);
        else
            io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList").size}/${io.sockets.adapter.rooms.get("lobby").size})`);
    }

}

// Format message. Could probably move it elsewhere.
const dayjs = require("dayjs");
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc)
dayjs.extend(timezone)

/**
 * Unsets the game session for a client.
 * 
 * @param {Socket} socket client to remove from game
 */
async function removeClientFromGame(socket) {
    await gameHandler.reloadSession(socket);
    socket.request.session.game = null;
    socket.request.session.save();
}

/**
 * Sets the game session for a client.
 * 
 * @param {Socket} socket client to add to game
 */
async function addClientToGame(socket) {
    await gameHandler.reloadSession(socket);
    socket.request.session.game = {};
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
    }
}

module.exports = {
    runSocket: runSocket
}