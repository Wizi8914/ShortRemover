const availableLanguages = ['en', 'fr'];
const defaultLanguage = navigator.language.split('-')[0];

document.addEventListener('DOMContentLoaded', () => {
    changeLanguage();
});

async function changeLanguage () {
    const elements = document.querySelectorAll('[i18n-data]');
    const language = await getLanguage();

    elements.forEach((element) => {
        let messageKey = element.getAttribute('i18n-data'); 

        setMessage(element, messageKey, language);
    });
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
    const response = await fetch(`../_locales/${language}/messages.json`);
    const json = await response.json();

    return json[messageKey]['message'];
}