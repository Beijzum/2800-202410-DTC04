document.getElementById("signUpForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const form = new FormData(e.target);

    let username = form.get("usernameField");
    let email = form.get("emailField");
    let password = form.get("passwordField");
    let repeatPassword = form.get("repeatPasswordField");
    let consent = form.get("privacy");

    if (password !== repeatPassword) {
        displayErrors([{field: "repeatPassword", message: "Passwords do not match." }]);
        return;
    }

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
            consent: consent
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

    // Clear any previous error borders
    document.querySelectorAll('.border-red-500').forEach(element => {
        element.classList.replace('border-red-500', 'border-gray-300');
    });

    errors.forEach(error => {
        let errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = error.message || `${error.usernameField || ""} ${error.emailField || ""}`;
        errorContainer.appendChild(errorDiv);

        // Add error border to the corresponding input field
        switch (error.field) {
            case 'username':
                document.getElementById("usernameField").classList.replace("border-gray-300", "border-red-500");
                break;
            case 'email':
                document.getElementById("emailField").classList.replace("border-gray-300", "border-red-500");
                break;
                case 'repeatPassword':
                    document.getElementById("repeatPasswordField").classList.replace("border-gray-300", "border-red-500");
                    // break intentionally omitted
            case 'password':
                document.getElementById("passwordField").classList.replace("border-gray-300", "border-red-500");
                break;
            case "privacy":
                document.getElementById("privacy").classList.replace("bg-gray-300", "bg-red-500");
                break;
        }

        if (error.usernameField) {
            console.log("entered username field for border");
            document.getElementById("usernameField").classList.replace("border-gray-300", "border-red-500");
        } else if (error.emailField) {
            console.log("entered email field for border");
            document.getElementById("emailField").classList.replace("border-gray-300", "border-red-500");
        }
    });
}