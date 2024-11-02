const defaultLanguage = navigator.language.split('-')[0];
const availableLanguages = ["en", "fr", "ko", "ru"];

async function changeLanguage() {
    const elements = document.querySelectorAll('[i18n-data]');
    const language = await getLanguage();

    elements.forEach((element) => {
        let messageKey = element.getAttribute('i18n-data'); 

        setMessage(element, messageKey, language);

    });

    document.querySelectorAll('.param-name').forEach((element) => console.log(element.textContent));
}

function getAvailableLanguages() {
    return new Promise((resolve, reject) => 
        chrome.runtime.getPackageDirectoryEntry(root => 
            root.getDirectory('_locales', {}, localesDir => 
                localesDir.createReader().readEntries(entries => 
                    resolve(entries.filter(e => e.isDirectory).map(e => e.name))
                )
            )
        )
    );
}

function getLanguage() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('language', function (result) {
            let lang;
            
            if (availableLanguages.includes(defaultLanguage)) {
                lang = result.language !== undefined ? result.language : defaultLanguage;
            } else {
                lang = result.language !== undefined ? result.language : 'en';
            }

            chrome.storage.local.set({ language: lang });
            resolve(lang);

        });
    });
}


function setMessage(element, messageKey, language) {    
    fetch(`../_locales/${language}/messages.json`)
        .then((response) => response.json())
        .then((json) => {
            element.textContent = json[messageKey]['message'];
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

async function getMessage(messageKey) {
    const language = await getLanguage();
    const pageURL = chrome.runtime.getURL(`_locales/${language}/messages.json`);

    const response = await fetch(pageURL);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const message = json[messageKey]['message'];
    
    return message;
}

function fitTextSize() {
    const parameters = document.querySelectorAll('.param-name');
    const fontSize = Number(window.getComputedStyle(parameters[0]).getPropertyValue('font-size').replace('px', ''));
    
    parameters[0].setAttribute('width', "100%");

    console.log(parameters[0])

    const maxWidth = parameters[0].clientWidth;


    parameters[0].removeAttribute('width');


    parameters.forEach((parameter) => {
        let parameterFontSize = fontSize;

        console.log(parameter.clientWidth + " " + maxWidth);  

        while (parameter.clientWidth == maxWidth) {


            parameterFontSize--;
            parameter.style.fontSize = `${parameterFontSize}px`;
        }
    });
}