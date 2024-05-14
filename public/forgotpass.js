document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    // stop page from refreshing before handle is done
    e.preventDefault();

    const form = e.target;

    const { action, method } = form; // action = url, method = post/get

    const email = new FormData(form).get("emailField");

    let response = await fetch(action, {
        method: method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            email: email,
        })
    });

    // TODO: handle response; check status, add error to main element, replace main content with resp HTML
});