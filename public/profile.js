document.getElementById('uploadProfilePicForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);

    const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });

    const result = await response.json();

    if (response.ok) {
        alert(result.message);
        // Optionally, refresh the page or update the image URL dynamically
        location.reload();
    } else {
        alert(result.error);
    }
});
