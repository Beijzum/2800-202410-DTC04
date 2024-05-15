function runSocket(io) {
    io.on("connection", (socket) => {
        // Player joins chatroom lobby
        socket.on("joinLobby", (player) => {
            // Players are given unique ID
            const playerId = socket.id;
            // playerName, playerProfile, and ready status is false
            players[playerId] = { id: playerId, playerName: player.playerName, playerProfile: player.playerProfile, ready: false };
            // Show other players that a new player has joined.
            io.emit("playerJoined", players[playerId]);
        });

        socket.on("message", (message) => {
            io.emit("message", message);
        })
    })
}

module.exports = {
    runSocket: runSocket
}