document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let email = document.getElementById("emailField").value;
    let password = document.getElementById("passwordField").value;

    let response = await fetch(e.target.action, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password,
        })
    });

    if (response.ok) {
        window.location.href = response.url;
    } else {
        let errorData = await response.json();
        let errors = errorData.errors;

        let errorContainer = document.getElementById("errorContainer");
        errorContainer.innerHTML = ""; // Clear previous errors
        
        // Clear any previous error borders
        document.querySelectorAll('.border-red-500').forEach(element => {
            element.classList.replace('border-red-500', 'border-gray-300');
        });
        
        if (errorData.message === "Email not found") {
            document.getElementById("emailField").classList.replace("border-gray-300", "border-red-500");
        } else if (errorData.message === "Incorrect password") {
            document.getElementById("passwordField").classList.replace("border-gray-300", "border-red-500");
        }
        errorContainer.innerText = errorData.message;
        
        // Check which field has the error and apply red border
        errors.forEach(error => {
            if (error.field === 'email') {
                errorContainer.innerText = error.message;
                document.getElementById("emailField").classList.replace("border-gray-300", "border-red-500");
                console.log("checked inner text:" + errorContainer.innerText)
                return;
            } else if (error.field === 'password') {
                errorContainer.innerText = error.message;
                document.getElementById("passwordField").classList.replace("border-gray-300", "border-red-500");
                return;
            }
        });
    }
});
