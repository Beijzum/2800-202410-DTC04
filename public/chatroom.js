const socket = io();

let input = document.getElementById("textBar");
let chatBar = document.getElementById("chatBar");
let messageSection = document.getElementById("messageSection");

// RECEIVING SOCKET DATA SECTION

// handle message being sent
socket.on("message", (messageContent) => {
    const message = document.createElement("li");
    message.innerHTML = `
    <div class="max-w-lg ml-3 my-3 p-3 rounded-lg intense-shadow_2 text-lg">
        <div class="flex justify-between items-center bg-blue-500 p-2 rounded-t-lg">
            <div class="flex items-center">
                ${messageContent.profilePic ? `<img src="${messageContent.profilePic}" class="w-8 h-8 rounded-full mr-3">` : ""}
                <span class="font-bold text-white">${messageContent.username}</span>
            </div>
            <div class="flex-grow flex justify-end">
                <span class="text-xs text-white font-bold">${messageContent.time}</span>
            </div>
        </div>
        <div class="bg-gray-300 text-black p-2 rounded-b-lg whitespace-normal break-words">
            ${messageContent.text}
        </div>
    </div>
    `;
    messageSection.appendChild(message);
    window.scrollTo(0, document.body.scrollHeight);
});

socket.on("systemMessage", (messageContent) => {
    const message = document.createElement("li");
    message.innerHTML = `
    <div class="max-w-lg ml-3 my-3 p-3 rounded-lg intense-shadow_2 text-lg">
        <div class="flex justify-between items-center bg-red-500 p-2 rounded-t-lg">
            <div class="flex items-center">
                <span class="font-bold text-white">System Message</span>
            </div>
            <div class="flex-grow flex justify-end">
                <span class="text-xs text-white font-bold">${messageContent.time}</span>
            </div>
        </div>
        <div class="bg-gray-300 text-black p-2 rounded-b-lg whitespace-normal break-words">
            ${messageContent.text}
        </div>
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