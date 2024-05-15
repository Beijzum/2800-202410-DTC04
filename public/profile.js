document.getElementById("uploadFile").addEventListener("submit", async (e) => {
    // stop page from refreshing before handle is done
    e.preventDefault();

    // get field entries
    let file = document.getElementById("fileField").files[0];
    let formData = new FormData();

    formData.append("file", file);

    let response = await fetch(backendLink + "/uploadFile", {
        method: "POST",
        body: formData
    });
    
    let responseText = await response.text();
    console.log(responseText);
    window
    .location

    .href = response.url;
});