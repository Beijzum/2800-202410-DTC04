/* Part of code from: https://socket.io/docs/v4/, https://www.youtube.com/watch?v=jD7FnbI76Hg */

const { Server, Socket } = require("socket.io");
const gameHandler = require("./gameHandler");

/**
 * Handles the socket server.
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
            updateReadyMessage(socket);
            userList.delete(socket.request.session.username); // update user list
            io.emit("updateUserList", Array.from(userList.entries())); // notify client
        });

        socket.on("ready", async () => {
            socket.join("readyList");
            gameHandler.eventEmitter.emit("updatePlayerCount", 1);
            addClientToGame(socket);
            if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) return;

            if (io.sockets.adapter.rooms.get("lobby").size >= 3) {
                io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList").size}/${io.sockets.adapter.rooms.get("lobby").size})`);
            } else {
                socket.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby").size}/3)`);
            }

            if (io.sockets.adapter.rooms.get("lobby").size < 3) return;

            if (io.sockets.adapter.rooms.get("readyList").size / io.sockets.adapter.rooms.get("lobby").size >= 0.5) {
                if (readyTimer) return;
                countdown = 10;
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

        socket.on("unready", () => {
            gameHandler.eventEmitter.emit("updatePlayerCount", -1);
            removeClientFromGame(socket);
            socket.leave("readyList");
            if (readyTimer) {
                if (io.sockets.adapter.rooms.get("readyList").size / io.sockets.adapter.rooms.get("lobby").size < 0.5) {
                    clearInterval(readyTimer);
                    readyTimer = null;
                    updateReadyMessage(socket);
                } 
            } else updateReadyMessage(socket);

        });

        socket.on("forceJoin", async () => {
            addClientToGame(socket);
            socket.join("readyList");
        })
    });
    
    // Delegate game logic sockets to external module
    gameHandler.runGame(io);
    
    function updateReadyMessage(socket) {
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