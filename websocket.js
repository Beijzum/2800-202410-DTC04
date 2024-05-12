function runSocket(io) {
    io.on("connection", (socket) => {

        socket.on("message", (message) => {
            io.emit("message", message);
        })
    })
}

module.exports = {
    runSocket: runSocket
}