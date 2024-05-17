// templates for the modal
const card = document.createElement("div");
card.appendChild(document.createElement("p"));
card.classList.add("flex", "flex-row", "py-2", "px-4", "w-full");

// handle receiving the updated user list
socket.on("updateUserList", (users) => {
    const modal = document.querySelector("#userDisplays");

    let user_arr = users;
    const userIds = [];
    // Removes all users that have left
    modal.childNodes.forEach(function(node) {
        if (!user_arr.includes(node.id)) {
            node.remove();
        }
    })
    // filters out all players still in game
    user_arr = user_arr.filter(user => !userIds.includes(user));
    // adds card a card for every new player
    user_arr.forEach(user => {
        let userCard = card.cloneNode(true);
        
        userCard.id = user;
        userCard.querySelector("p").innerText = user;
        modal.appendChild(userCard);
    });
});

// click event on the player list icon
document.querySelector("#playerListButton").addEventListener("click", async function(e) {
    // so user's don't randomly click it
    if (this.style.display === "none") {
        return;
    }

    console.log(`
    <dialog id="userDisplays" class="flex flex-col w-1/3 h-5/6 overflow-y-auto"></dialog>
    `)
});