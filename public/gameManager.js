var socket = io();

document.addEventListener("DOMContentLoaded", () => { socket.emit("joinGame")} );