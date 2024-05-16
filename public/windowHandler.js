var socket = io();

let gameNavbar = document.getElementById("gameNavbar");
let roundCounter = document.getElementById("roundCounter");
let timeDisplay = document.getElementById("timeDisplay");


document.addEventListener("DOMContentLoaded", () => { socket.emit("joinGame")} );

function changePhase(newHtml) {
    document.getElementById("gameMenu").innerHTML = newHtml;
}