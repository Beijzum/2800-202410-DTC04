let gameMenu = document.getElementById("gameMenu");
let winSound = new Audio("sfx/gameWin.mp3");
let loseSound = new Audio("sfx/gameLose.mp3");
winSound.volume = 0.1;
loseSound.volume = 0.1;

socket.on("changeView", () => {
    let currentView = gameMenu.children[0];
    switch (currentView.id) {
        case "writeView":
            handleWriteView();
            break;
        case "voteView":
            handleVoteView();
            break;
        default:
            // transition, resultView, and waitView do not have logic
            break;
    }
});

socket.on('gameWin', () => {
    winSound.play();
    document.getElementById('dialogBoxWin').showModal();
});

socket.on('gameLose', () => {
    loseSound.play();
    document.getElementById('dialogBoxLose').showModal();
});

document.getElementsByClassName('closeDialog')[0].onclick = () => {
    document.getElementById('dialogBoxWin').close();
    window.location.href = "/lobby";
};

document.getElementsByClassName('closeDialog')[1].onclick = () => {
    document.getElementById('dialogBoxLose').close();
    window.location.href = "/lobby";
};

/**
 * Handles the game view for the write phase.
 */
function handleWriteView() {
    /**
     * Handles disabling the response text area and submit button.
     *
     * @param {String} buttonMessage Message to display on the submit button
     */
    function disableInputs(buttonMessage) {
        let responseArea = document.getElementById("promptResponse");
        let submitButton = document.getElementById("submitResponse");
        let prompt = document.getElementById("prompt");

        // change prompt color
        prompt.className = prompt.className.replace("bg-white", "bg-gray-100");
        prompt.className += " opacity-75";

        // disable textarea
        responseArea.disabled = true;
        responseArea.className = responseArea.className.replace("bg-white", "bg-gray-100");
        responseArea.className += " opacity-75";

        // disable submit button
        submitButton.disabled = true;
        submitButton.className = submitButton.className.replace("bg-sky-400", "bg-sky-600");
        submitButton.className += " opacity-75";
        submitButton.value = buttonMessage;
    }

    // check to see if client already sent a response
    socket.emit("checkResponse");

    if (!playing) {
        disableInputs("You Are Spectating");
        return;
    }

    let responseArea = document.getElementById("promptResponse");
    let submitButton = document.getElementById("submitResponse");

    submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        disableInputs("Response Received");
        socket.emit("submitResponse", responseArea.value);
    });
    
    // runs when client has already sent a response
    socket.once("disableResponse", (originalResponse) => {
        let responseArea = document.getElementById("promptResponse");
        responseArea.value = originalResponse;
        if (originalResponse) disableInputs("Response Received");
        else disableInputs("You Are Dead");
    });
}

// SOCKET LISTENERS ON WRITE SCREEN

socket.on("retrieveResponse", () => {
    if (!playing) return;
    let responseArea = document.getElementById("promptResponse");
    socket.emit("submitResponse", responseArea.value);
});

/**
 * Handles the game view for the vote phase.
 */
function handleVoteView() {
    if (!playing) return;

    let voted = false;
    let selected = false;
    let responseCards = document.querySelectorAll(".responseCard");

    // check if player previously voted
    socket.emit("checkVote");

    responseCards.forEach((card) => {

        let buttonsDiv = card.children[0].children[1];
        let voteButton = buttonsDiv.children[0];
        let cancelButton = buttonsDiv.children[1];

        /**
         * Handles hiding the vote and cancel buttons.
         * 
         * @param {Boolean} boolean whether to hide the buttons or not 
         */
        function hideButtons(boolean) {
            if (boolean)
                buttonsDiv.className = buttonsDiv.className.replace("opacity-100", "opacity-0");
            else
                buttonsDiv.className = buttonsDiv.className.replace("opacity-0", "opacity-100");
            voteButton.disabled = boolean;
            cancelButton.disabled = boolean;
        }

        voteButton.addEventListener("click", () => {
            if (voted) return;

            voted = true;
            card.className = card.className.replace("bg-white", "bg-gray-200");
            card.className += " opacity-75";
            hideButtons(true);
            socket.emit("submitVote", card.id);
        });

        cancelButton.addEventListener("click", () => {
            selected = false;
            hideButtons(true);
        });

        card.addEventListener("click", function (e) {
            if (voted || e.target === cancelButton || selected) return;
            hideButtons(false);
            selected = true;
        });
    });
    
    socket.once("disableVote", (voteTarget) => {
        let votedCard = document.getElementById(voteTarget);
        if (!votedCard) return;
        voted = true;
        votedCard.className = votedCard.className.replace("bg-white", "bg-gray-200");
        votedCard.className += " opacity-75";
    });
}