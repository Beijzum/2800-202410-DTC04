document.getElementById("loginForm").addEventListener("submit", async (e) => {
    // stop page from refreshing before handle is done
    e.preventDefault();

    // get field entries
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

    window.location.href = response.url;
});