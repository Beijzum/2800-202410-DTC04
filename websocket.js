/* Part of code from: https://socket.io/docs/v4/, https://www.youtube.com/watch?v=jD7FnbI76Hg */

const gameHandler = require("./gameHandler");

var readyList = [];

function runSocket(io) {
    io.on("connection", (socket) => {

        // Player joins chatroom lobby
        socket.on("joinLobby", () => {
            socket.emit("message", "You have joined a room");
            socket.broadcast.emit("message", `${socket.request.session.username} has joined the room`);
        });

        // when users message
        socket.on("message", (message) => {
            io.emit("message", message);
        })

        // When other users disconnect
        socket.on("disconnect", () => {
            io.emit("message", `${socket.request.session.username} has disconnected`);
        })

        // Delegate game logic sockets to external module
        gameHandler.runGame(socket);
    })
}

module.exports = {
    runSocket: runSocket
}