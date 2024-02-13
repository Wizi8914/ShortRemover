function disableParams(element) {
    var paramContainer = document.querySelector('.param-container');
    var disableLayer = document.querySelector('.disable-params');

    if (element) {
        paramContainer.style.opacity = 1;
        disableLayer.style.display = 'none';
    } else {
        paramContainer.style.opacity = 0.3;
        disableLayer.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var toggleCheckbox = document.getElementById('main-button')
    var paramButtons = document.querySelectorAll('.param-button input');

    chrome.storage.local.get('extensionIsActive', function (result) {
        toggleCheckbox.checked = result.extensionIsActive !== undefined ? result.extensionIsActive : true;  
        disableParams(toggleCheckbox.checked);
    });

    paramButtons.forEach((button) => {
        chrome.storage.local.get(button.value, function (result) {
            button.checked = result[button.value] !== undefined ? result[button.value]: true;
        });
    });

    document.addEventListener("change", (event) => {
        if (event.target.type == 'checkbox' && event.target.id != 'main-button') {
            chrome.runtime.sendMessage({ command: event.target.value, value: event.target.checked });
        }
    });
    
    toggleCheckbox.addEventListener('change', () => {
        chrome.runtime.sendMessage({ command: 'toggleExtension', value: toggleCheckbox.checked });
        disableParams(toggleCheckbox.checked);
    });
});