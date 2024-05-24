let modal = document.getElementById("playerListModal");
let playerList = document.getElementById("playerList");

socket.on("updateUserList", (users) => {
    playerList.innerHTML = "";
    // users = map.entries() object -> [username, pictureURL]
    users.forEach(user => {
        playerList.innerHTML += `
        <div class="flex items-center px-10 py-1 border-b hover:bg-zinc-800 border-zinc-700 text-center gap-1">
        <img src=${user[1] ? user[1] : "images/defaultProfilePicture.webp"} class="w-8 h-8 rounded-full p-1">
        <p class="font-bold break-all text-zinc-100">${user[0]}</p>
        </div>
        `;
    });
});

document.addEventListener("click", (e) => {
    if (e.target.id === "closeModal") modal.close();
});

// click event on the player list icon
document.querySelector("#playerListButton").addEventListener("click", async function(e) {
    // so user's don't randomly click it
    if (this.style.display === "none") {
        return;
    }
    modal.showModal();
});