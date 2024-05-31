let menuToggleButton = document.getElementById("hamburgerButton");

menuToggleButton.addEventListener("click", () => {
    let navbarItems = document.getElementById("navbarItems");
    if (navbarItems.className.includes("hidden")) navbarItems.className = navbarItems.className.replace("hidden", "block");
    else navbarItems.className = navbarItems.className.replace("block", "hidden");
});