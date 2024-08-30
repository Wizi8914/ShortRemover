const checkbox = document.querySelectorAll('.param-button input');
const params = document.querySelectorAll('.param');

checkbox.forEach((box, i) => {
    chrome.storage.local.get(box.value, function (result) {
        box.checked = result[box.value] !== undefined ? result[box.value]: true;
        params[i].classList.toggle('active', box.checked);
    });
});

checkbox.forEach((box, i) => {
    box.addEventListener('change', (event) => {
        chrome.runtime.sendMessage({ command: event.target.value, value: event.target.checked });
        params[i].classList.toggle('active');
    });
});