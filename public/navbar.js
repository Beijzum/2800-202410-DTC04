let menuToggleButton = document.getElementById("hamburgerButton");
let navbarItems = document.getElementById("navbarItems");

menuToggleButton.addEventListener("click", () => {
    navbarItems.classList.toggle("hidden");
});

// only toggle the CSS when on homepage
if (menuToggleButton.classList.contains("homepage-hamburger-button")) {
    menuToggleButton.addEventListener("click", () => {
        menuToggleButton.classList.toggle("border-2");
        menuToggleButton.classList.toggle("light-opacity-background");
    });
}