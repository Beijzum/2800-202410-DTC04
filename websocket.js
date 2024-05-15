function runSocket(io) {
    io.on("connection", (socket) => {
        // When current user joins the chat
        socket.emit("message", "You have joined a room")
        // When any other user joins the chat
        socket.broadcast.emit("message", "User has joined the chat")
        // Player joins chatroom lobby
        socket.on("joinLobby", (player) => {
            // Players are given unique ID
            const playerId = socket.id;
            // playerName, playerProfile, and ready status is false
            players[playerId] = { id: playerId, playerName: player.playerName, playerProfile: player.playerProfile, ready: false };
            // Show other players that a new player has joined.
        });

        socket.on("message", (message) => {
            io.emit("message", message);
        })

        // When other users disconnect
        socket.on("disconnect", () => {
            io.emit("message", "A user has disconnected");
        })
    })
}

module.exports = {
    runSocket: runSocket
}