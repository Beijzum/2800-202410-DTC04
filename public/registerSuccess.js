document.getElementById("resendForm").addEventListener("submit", async (e) => {
    // stop page from refreshing before handle is done
    e.preventDefault();

    if (document.querySelector("#feedback")) {
        document.querySelector("#feedback").remove();
    }

    const form = e.target;

    const { action, method } = form; // action = url, method = post/get

    const hash = new FormData(form).get("hash");
    // changing the request to json
    let response = await fetch(action, {
        method: method,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json" 
        },
        body: JSON.stringify({
            hash: hash,
        })
    });

    const feedback = document.createElement("p");
    feedback.classList.add("text-center", "my-2");
    feedback.id = "feedback";
    feedback.textContent = response.ok ? "Successfully sent!" : "error sending email";
    document.querySelector("#resendForm").appendChild(feedback);
});