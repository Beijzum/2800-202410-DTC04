const socket = io();

let input = document.getElementById("textBar");
let chatBar = document.getElementById("chatBar");
let messageSection = document.getElementById("messageSection");

// RECEIVING SOCKET DATA SECTION

// handle message being sent
socket.on("message", (messageContent) => {
    let message = document.createElement("li");
    message.textContent = messageContent;
    messageSection.appendChild(message);
    window.scrollTo(0, document.body.scrollHeight);
})

// SENDING SOCKET DATA SECTION

// handle joining lobby
document.addEventListener("DOMContentLoaded", () => {socket.emit("joinLobby");});

// handle enter press
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        if (input.value) {
            socket.emit("message", input.value);
            input.value = "";
        }
    }
})

// handle manually press enter key with mouse
chatBar.addEventListener("submit", (e) => {
    console.log("submitted");
    e.preventDefault();

    if (input.value) {
        socket.emit("message", input.value);
        input.value = "";
    }
})