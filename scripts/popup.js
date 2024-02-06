document.addEventListener('DOMContentLoaded', function () {
    var toggleCheckbox = document.getElementById('main-button')
    
    toggleCheckbox.addEventListener('change', function () {
        chrome.runtime.sendMessage({ command: 'toggleExtension', value: toggleCheckbox.checked });
    });
});