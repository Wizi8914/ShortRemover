const checkbox = document.querySelectorAll('.param-button input');
const params = document.querySelectorAll('.param');
const themeButton = document.querySelector('.header-right__theme');

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

// Statistics //

const statistics = document.querySelectorAll('.statistics__container_element--value');

function getStatistics(dataKey, callback) {
    chrome.storage.local.get(dataKey, function(result) {
        const count = result[dataKey] || 0;
        callback(count);
    })
}


statistics.forEach((stat, i)=> {
    getStatistics(stat.getAttribute('data-key'), async (count) => {
        if (stat.getAttribute('data-key') === 'timeSaved') {
            count = await formatTime(count);
        }
        
        stat.textContent = count;
    });
});

async function formatTime (minutes) {

    if (minutes < 60) {
        const minutesLabel = await getMessage('minute_label');

        return `${minutes} ${minutesLabel}`;
    }

    let hours = minutes / 60;
    hours = Number.isInteger(hours) ? hours : hours.toFixed(1);
    
    const hourLabel = await getMessage('hour_label');

    return `${hours} ${hourLabel}`;
}

// Theme //

const themes = document.querySelectorAll('.themes__container--item');

themes.forEach((theme, i) => {
    theme.addEventListener('click', () => {
        document.body.classList.forEach((item) => {
            if (item.startsWith('theme-')) {
                document.body.classList.remove(item);
            }
        });

        document.body.classList.add(`theme-${i+1}`);
        chrome.storage.local.set({ colorTheme: i+1 });
        
        themes.forEach((theme) => {
            theme.classList.remove('active');
        });

        theme.classList.add('active');
    });
});

chrome.storage.local.get('colorTheme', function (result) {
    const colorTheme = result.colorTheme !== undefined ? result.colorTheme : 1;
    document.body.classList.add(`theme-${colorTheme}`);
    
    themes[colorTheme-1].classList.add('active');
});


// Dark and Light Theme //

const lightTheme = document.querySelector('.header-right__theme--light');
const darkTheme = document.querySelector('.header-right__theme--dark');

themeButton.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');

    chrome.storage.local.get('theme', function (result) {
        const theme = result.theme !== undefined ? result.theme : 'dark';
        chrome.storage.local.set({ theme: theme === 'dark' ? 'light' : 'dark' });
    });
});

chrome.storage.local.get('theme', function (result) {
    const theme = result.theme !== undefined ? result.theme : 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
});

window.addEventListener('load', function() {
    var styleTag = document.getElementById('disable-transitions');

    setTimeout(() => {
        if (styleTag) {
            styleTag.parentNode.removeChild(styleTag);
        }
    }, 50);
});


// Language //

const language = document.querySelectorAll('.languages__container--item');

language.forEach((lang, i) => {
    lang.addEventListener('click', () => {
        language.forEach((lang) => {
            lang.classList.remove('active');
        });

        lang.classList.add('active');
        chrome.storage.local.set({ language: lang.getAttribute('lang-data') });

        changeLanguage(); // This function is defined in translation.js
    });

    chrome.storage.local.get('language', function (result) {
        if (lang.getAttribute('lang-data') == result.language) {
            lang.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    changeLanguage();
});