// templates for the modal
const card = document.createElement("div");
card.appendChild(document.createElement("p"));
card.classList.add("flex", "flex-row", "py-2", "px-4", "w-full");

// init the modal
document.addEventListener("DOMContentLoaded", (_) => {
    const modal = document.createElement('dialog');
    modal.id = "userDisplays";
    modal.classList.add("w-1/3", "h-2/3", "overflow-y-auto");
    document.body.appendChild(modal);

    modal.addEventListener("click", function(e) {
        if (e.target === modal) {
            modal.close();
        }
    });

    const userCards = [];
    
    // handle receiving the updated user list
    socket.on("updateUserList", (users) => {      
        const userIds = [];
        // Removes all users that have left
        modal.childNodes.forEach(function(node) {
            if (!users.includes(node.id)) {
                node.remove();
            }
        })
        // filters out all players still in game
        const user_arr = users.filter(user => !userIds.includes(user));
        // adds card a card for every new player
        user_arr.forEach(user => {
            let userCard = card.cloneNode(true);
            
            userCard.id = user;
            userCard.querySelector("p").innerText = user;
            userCards.push(userCard);
        });
    });
    
    // click event on the player list icon
    document.querySelector("#playerListButton").addEventListener("click", async function(e) {
        // so user's don't randomly click it
        if (this.style.display === "none") {
            return;
        }

        while (modal.firstChild) {
            modal.removeChild(modal.firstChild);
        }

        userCards.map(card => modal.appendChild(card));
        modal.showModal();
    });
})