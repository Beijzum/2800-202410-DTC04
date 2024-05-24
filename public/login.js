document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    let email = document.getElementById("emailField").value;
    let password = document.getElementById("passwordField").value;
    let errorContainer = document.getElementById("errorContainer");

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
        errorContainer.innerText = errorData.message;
    }
});
