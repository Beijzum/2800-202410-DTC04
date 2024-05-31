// Add this JavaScript to your game.js or inside a <script> tag in the HTML file
document.addEventListener('DOMContentLoaded', function () {
    const openDialogButton = document.getElementById('openDialog');
    const closeDialogButton = document.getElementById('closeDialog');
    const dialogBox = document.getElementById('dialogBox');

    // Function to show the dialog
    const showDialog = () => {
        dialogBox.showModal();
    };

    // Function to hide the dialog
    const hideDialog = () => {
        window.location.href = "/lobby";
    };

    // Event listeners
    openDialogButton.addEventListener('click', showDialog);
    closeDialogButton.addEventListener('click', hideDialog);

});