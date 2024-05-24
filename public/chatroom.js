const socket = io();

let input = document.getElementById("textBar");
let chatBar = document.getElementById("chatBar");
let messageSection = document.getElementById("messageSection");

// RECEIVING SOCKET DATA SECTION

// handle message being sent
socket.on("message", (messageContent) => {
    const message = document.createElement("li");
    message.innerHTML = `
    <div class="w-full rounded-lg text-lg p-2 flex box-border">
        <img src="${messageContent.profilePic ? messageContent.profilePic : `images/defaultProfilePicture.webp`}" class="w-12 h-12 mr-4 rounded-full">
        <div class="flex flex-col">
            <p class="font-bold text-blue-950">${messageContent.username} <span class="text-xs font-normal text-gray-500">${messageContent.time}</span></p>
            <p class="text-gray-800 text-sm rounded-lg whitespace-normal break-all pr-6">${messageContent.text}</p>
        </div>
    </div>
    `;
    messageSection.appendChild(message);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on("systemMessage", (messageContent) => {
    const message = document.createElement("li");
    message.innerHTML = `
    <div class="flex">
        <p class="text-sky-500 pl-2">➤</p>
        <p class="text-gray-500 pl-2 whitespace-normal break-normal">
            ${messageContent.text}. <span class="text-xs">${messageContent.time}</span>
        </p>
    </div>
    `;
    messageSection.appendChild(message);
    window.scrollTo(0, document.body.scrollHeight);
});

// SENDING SOCKET DATA SECTION

// handle joining lobby
document.addEventListener("DOMContentLoaded", () => { socket.emit("joinLobby"); });

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