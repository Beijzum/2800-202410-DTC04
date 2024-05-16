function runGame(io, socket) {
    socket.on("joinGame", () => {
        console.log("player joined");
    })
}





module.exports = {
    runGame: runGame
}