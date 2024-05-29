document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let username = document.getElementById("usernameField").value;
    let email = document.getElementById("emailField").value;
    let password = document.getElementById("passwordField").value;

    let response = await fetch(e.target.action, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password,
        })
    });

    if (response.ok) {
        let result = await response.json();
        window.location.href = result.redirectUrl;
    } else {
        let result = await response.json();
        displayErrors(result.errors);
    }
});

/**
 * Handles displaying errors to the user.
 * 
 * @param {Array} errors array of errors encountered during sign up 
 */
function displayErrors(errors) {
    let errorContainer = document.getElementById("errorContainer");
    errorContainer.innerHTML = ""; // Clear previous errors
    errors.forEach(error => {
        let errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = error.message || `${error.usernameField || ""} ${error.emailField || ""}`;
        errorContainer.appendChild(errorDiv);
    });
}
