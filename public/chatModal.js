// templates for the modal
const card = document.createElement("div");
card.appendChild(document.createElement("p"));
card.classList.add("flex", "flex-row", "my-2", "mx-8", "w-auto", "border-b", "border-black");

const modal = document.querySelector("#userDisplays");

modal.addEventListener("click", function(e) {
    if (e.target === modal) {
        modal.close();
    }
});
// handle receiving the updated user list
socket.on("updateUserList", (users) => { 
    /* This logic handles lazily managing the content of the user modal */
    const userIds = [];
    // Removes all users that have left
    modal.childNodes.forEach(function(node) {
        console.log(node, node.id, node.nodeName)
        if (node.nodeName !== "H1" && !users.includes(node.id)) {
            node.remove();
        }
    })
    // get all users that have been added
    const user_arr = users.filter(user => !userIds.includes(user));
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

    modal.showModal();
});