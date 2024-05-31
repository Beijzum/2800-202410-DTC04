let modal = document.getElementById("playerListModal");
let playerList = document.getElementById("playerList");

socket.on("updateUserList", (users) => {
    playerList.innerHTML = "";
    users.forEach(user => {
        playerList.innerHTML += `
        <div class="flex items-center px-10 py-1 border-b hover:bg-zinc-800 border-zinc-700 text-center gap-1">
        <img src=${user[1] ? user[1] : "images/defaultProfilePicture.webp"} class="w-8 h-8 rounded-full p-1">
        <p class="font-bold break-all text-zinc-100">${user[0]}</p>
        </div>
        `;
    });
});

socket.on("updatePlayerList", (players) => {
    playerList.innerHTML = "";
    players.forEach(player => {
        if (!player.dead) 
        playerList.innerHTML += `
        <div class="flex items-center px-10 py-1 border-b hover:bg-zinc-800 border-zinc-700 text-center gap-1">
        <img src=${player.aliasPicture} class="w-8 h-8 rounded-full p-1">
        <p class="font-bold break-all text-zinc-200">${player.alias}</p>
        </div>`;
        else
        playerList.innerHTML += `
        <div class="flex items-center px-10 py-1 border-b hover:bg-red-900 bg-red-950 opacity-75 border-zinc-700 text-center gap-1">
        <img src=${player.aliasPicture} class="w-8 h-8 rounded-full p-1">
        <p class="font-bold break-all text-zinc-100">${player.alias} <span class="text-red-600 ml-3">BANNED</span></p>
        </div>`;
    });
});

document.addEventListener("click", (e) => {
    if (e.target.id === "closeModal") modal.close();
});

// click event on the player list icon
document.querySelector("#playerListButton").addEventListener("click", async function() {
    // so user's don't randomly click it
    if (this.style.display === "none") {
        return;
    }
    modal.showModal();
});