document.querySelector("#resetForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const { action, method } = e.target;

    const form = new FormData(e.target);

    let response = await fetch(action, {
        method: method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            hash: form.get("hash"),
            password: form.get("passwordField"),
        })
    });

    window.location.href = response.url;
});