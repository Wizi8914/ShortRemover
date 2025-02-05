"use strict";
(() => {
    function disableParams(element) {
        var paramContainer = document.querySelector('.param-container');
        var disableLayer = document.querySelector('.disable-params');
    
        if (element) {
            paramContainer.style.filter = "brightness(1)";
            disableLayer.style.display = 'none';
        } else {
            paramContainer.style.filter = "brightness(0.5)";
            disableLayer.style.display = 'block';
        }
    }
    
    function activateCustomTheme(customGradientList) {
        chrome.storage.local.get('colorTheme', function (result) {
            if (typeof result.colorTheme !== 'string') return;

            let customThemeIndex = parseInt(result.colorTheme.split('-')[1]) - 1;

            document.body.style.setProperty('--gradient-color', `${customGradientList[customThemeIndex]}`);
        });
    }
    
    document.addEventListener('DOMContentLoaded', function () {
        const manifest = chrome.runtime.getManifest();
        const extensionVersionLabel = document.querySelector('.footer-version--text');
        var toggleCheckbox = document.getElementById('main-button')
        var paramButtons = document.querySelectorAll('.param-button input');
        var refreshButton = document.querySelector('.refresh-button');
    
        chrome.storage.local.get('extensionIsActive', function (result) {
            toggleCheckbox.checked = result.extensionIsActive !== undefined ? result.extensionIsActive : true;  
            disableParams(toggleCheckbox.checked);
        });

        chrome.storage.local.get('customGradientList').then((result) => {
            activateCustomTheme(result.customGradientList);
        });
    
        paramButtons.forEach((button) => {
            chrome.storage.local.get(button.value, function (result) {
                button.checked = result[button.value] !== undefined ? result[button.value]: true;
            });
        });
    
        document.addEventListener("change", (event) => {
            if (event.target.type == 'checkbox' && event.target.id != 'main-button') {
                chrome.runtime.sendMessage({ command: event.target.value, value: event.target.checked });
                refreshButton.style.display = 'block';
            }
        });
        
        toggleCheckbox.addEventListener('change', () => {
            chrome.runtime.sendMessage({ command: 'toggleExtension', value: toggleCheckbox.checked });
            disableParams(toggleCheckbox.checked);
            refreshButton.style.display = 'block';
        });
    
        refreshButton.addEventListener('click', () => {
            if (refreshButton.style.display == 'none') return;
            
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.reload(tabs[0].id);
            });
            refreshButton.style.display = 'none';
        });

        extensionVersionLabel.textContent = `v${manifest.version}`;

    });
    
    chrome.storage.local.get('theme', function (result) {
        const theme = result.theme !== undefined ? result.theme : 'dark';
        document.body.classList.toggle('light-theme', theme === 'light');
    });
    
    chrome.storage.local.get('colorTheme', function (result) {
        const colorTheme = result.colorTheme !== undefined ? result.colorTheme : 1;
        document.body.classList.add(`theme-${colorTheme}`);
    });
    
    window.addEventListener('load', function() {
        var styleTag = document.getElementById('disable-transitions');
    
        setTimeout(() => {
            if (styleTag) {
                styleTag.parentNode.removeChild(styleTag);
            }
        }, 50);
    });
    
    // Translation
    
    document.addEventListener('DOMContentLoaded', () => {
        changeLanguage();
    });
})();

