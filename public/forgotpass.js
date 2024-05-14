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

    if (response.ok) {
        document.querySelector("main").innerHTML = await response.text();
    }
    else if (response.status >= 400 && response.status < 500) { // TODO: handle response; check status, add error to main element
        const label = document.querySelector("label");
        label.textContent = (await response.json()).error;

        const emailField = document.querySelector("#emailField");

        label.classList.add("text-red-500");
        emailField.classList.add("border-red-500");
    }
});