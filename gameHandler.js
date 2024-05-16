const phases = ["write", "vote", "result", "wait"];
var currentPhase = cycle(phases);
var gameRunning;

function runGame(io, socket) {
    socket.on("joinGame", () => {
        if (!io.sockets.adapter.rooms.get("game")) gameRunning = false;

        console.log(gameRunning);
        console.log(currentPhase.next().value);
        console.log(currentPhase.next().value);
        console.log(currentPhase.next().value);
        console.log(currentPhase.next().value);
        console.log(currentPhase.next().value);
    });

    
}

function* cycle(array) {
    let index = 0;
    while (true) {
        yield array[index];
        index = (index + 1) % array.length;
    }
}

function resetGame() {
    currentPhase = phases[0];
    gameRunning = false;
}


module.exports = {
    runGame: runGame
}