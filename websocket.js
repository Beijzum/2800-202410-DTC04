/* Part of code from: https://socket.io/docs/v4/, https://www.youtube.com/watch?v=jD7FnbI76Hg */

const { Server } = require("socket.io");
const gameHandler = require("./gameHandler");

/**
 * Handles the socket server.
 * 
 * @param {Server} io the server for handling socketing
 */
function runSocket(io) {
    const userList = new Set(); // used to keep track of connected users
    io.on("connection", (socket) => {



        // Player joins chatroom lobby
        socket.on("joinLobby", () => {
            socket.join("lobby");
            socket.emit("message", "You have joined the room");
            socket.broadcast.emit("message", `${socket.request.session.username} has joined the room`);
            updateReadyMessage(socket);
            userList.add(socket.request.session.username); // update user list
            io.emit("updateUserList", Array.from(userList)); // notify client
        });

        // when users message
        socket.on("message", (message) => {
            io.emit("message", message);
        })

        // When disconnect
        socket.on("disconnect", () => {
            socket.emit("message", `${socket.request.session.username} has disconnected`);
            updateReadyMessage(socket);
            userList.delete(socket.request.session.username); // update user list
            io.emit("updateUserList", Array.from(userList)); // notify client
        })

        socket.on("ready", () => {
            socket.join("readyList");
            
            if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) return;
            
            if (io.sockets.adapter.rooms.get("lobby").size >= 3) {
                io.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList").size}/${io.sockets.adapter.rooms.get("lobby").size})`);
            } else {
                socket.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby").size}/3)`);
            }
            
            if (io.sockets.adapter.rooms.get("lobby").size < 3) return;

            if (io.sockets.adapter.rooms.get("readyList").size / io.sockets.adapter.rooms.get("lobby").size >= 0.5) {
                moveClients("lobby", "game");
                io.emit("startGame");
            }
        })

        socket.on("unready", () => {
            socket.leave("readyList");
            updateReadyMessage(socket);
        })

        // Delegate game logic sockets to external module
        gameHandler.runGame(io, socket);
    })

    function updateReadyMessage(socket) {
        if (!io.sockets.adapter.rooms.get("lobby") || !io.sockets.adapter.rooms.get("readyList")) return;

        if (io.sockets.adapter.rooms.get("lobby").size < 3)
            socket.broadcast.emit("updateReadyMessage", `Not Enough Players to Start (${io.sockets.adapter.rooms.get("lobby").size}/3)`);
        else 
            socket.broadcast.emit("updateReadyMessage", `Waiting for other players (${io.sockets.adapter.rooms.get("readyList").size}/${io.sockets.adapter.rooms.get("lobby").size})`);
    }

    function moveClients(source, destination) {
        let clients = io.sockets.adapter.rooms.get(source);
        for (let client of clients) {
            let clientSocket = io.sockets.sockets.get(client);
            clientSocket.leave(source);
            clientSocket.join(destination);
        }
    }
}

module.exports = {
    runSocket: runSocket
}