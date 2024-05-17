// Add this JavaScript to your game.js or inside a <script> tag in the HTML file

document.addEventListener('DOMContentLoaded', function () {
    const toggleModalButton = document.getElementById('toggleModal');
    const closeModalButton = document.getElementById('closeModal');
    const myModal = document.getElementById('myModal');
    const acceptModalButton = document.getElementById('acceptModal');
    const declineModalButton = document.getElementById('declineModal');

    // Function to show the modal
    const showModal = () => {
        myModal.classList.remove('hidden');
        myModal.classList.add('fixed');
    };

    // Function to hide the modal
    const hideModal = () => {
        myModal.classList.remove('fixed');
        myModal.classList.add('hidden');
    };

    // Event listeners
    toggleModalButton.addEventListener('click', showModal);
    closeModalButton.addEventListener('click', hideModal);
    acceptModalButton.addEventListener('click', hideModal);
    declineModalButton.addEventListener('click', hideModal);

    // Hide the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === myModal) {
            hideModal();
        }
    });

    console.log('Modal script loaded')
});
