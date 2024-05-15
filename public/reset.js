document.querySelector("#resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const { action, method } = e.target;

    const newPass = new FormData(e.target).get("passwordField");

    let response = await fetch(action, {
        method: method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            password: newPass,
        })
    });

    // TODO: Actually handle the response
});