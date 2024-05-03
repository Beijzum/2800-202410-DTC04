var testLink = "http://localhost:3000"

var messages = document.getElementById('messages');
var form = document.getElementById('form');
var input = document.getElementById('input');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let senderMsg = document.createElement("li");
    senderMsg.textContent = input.value;
    messages.appendChild(senderMsg);

    let response = await fetch(testLink + `/message/?content=${input.value}`);
    let msg = await response.text();
    input.value = "";

    let item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
});