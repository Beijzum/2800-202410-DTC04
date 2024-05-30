document.getElementById('uploadProfilePicForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    let resultMessage = document.getElementById("savedChangesMessage");
    resultMessage.classList.add("hidden");

    const form = e.target;
    const formData = new FormData(form);

    const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    
    const result = await response.json();

    if (response.ok) {
        resultMessage.innerHTML = result.message;
        if (resultMessage.classList.contains("hidden"))
            resultMessage.classList.toggle("hidden");
        resultMessage.className = resultMessage.className.replace("red", "green");
    } else {
        resultMessage.innerHTML = result.error;
        if (resultMessage.classList.contains("hidden"))
            resultMessage.classList.toggle("hidden");
        resultMessage.className = resultMessage.className.replace("green", "red");
    }
});

// preview picture upon upload
document.getElementById("imageInput").addEventListener("change", function() {
    if (!this.files) return;
    let fileReader = new FileReader();
    let profilePicture = document.getElementById("profilePicture");
    fileReader.onload = (event) => { profilePicture.setAttribute("src", event.target.result); }
    fileReader.readAsDataURL(this.files[0]);
})

document.querySelector("#changePass").addEventListener("click", async (e) => {
    e.preventDefault();

    const response = await fetch(e.target.href);
    const htmlString = await response.text();

    const parser = new DOMParser();
    const htmlDocument = parser.parseFromString(htmlString, "text/html");
    const modal = htmlDocument.querySelector("dialog");

    if (!modal) {
        console.error("No dialog element found in the fetched HTML");
    }

    document.body.appendChild(modal);
    modal.showModal();

    modal.addEventListener("click", (event) => {
        // If the clicked target is the dialog itself instead of it's content, close the dialog
        if (event.target === modal) {
            modal.remove();
        }
    });

    const form = modal.querySelector("form"); 

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const data = e.target;

        let resp = await fetch(data.action, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: new FormData(data).get("passwordField")
            })
        });

        if (!resp.ok) {
            let errorMessage = document.getElementById("errorMessage");
            errorMessage.innerHTML = (await resp.json()).error;
            form.querySelector("#passwordField").classList.add("border-red-500");
            return;
        }

        const submitButton = form.querySelector("#submit");
        submitButton.classList.remove("hover:bg-zinc-700");
        submitButton.classList.add("transition", "bg-green-500");
        submitButton.value = "Success!";

        setTimeout(() => {modal.remove()}, 500) // deletes the modal after 0.5 seconds

    });
});