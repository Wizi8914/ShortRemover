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

function resetStatistics() { // Development function
    statistics.forEach((stat) => {
        chrome.storage.local.set({ [stat.getAttribute('data-key')]: 0 });
    });
}

statistics.forEach((stat)=> {
    getStatistics(stat.getAttribute('data-key'), async (count) => {
        stat.setAttribute('data-value', count);

        if (stat.getAttribute('data-key') === 'timeSaved') {
            count = await formatTime(count);
        }
        
        stat.textContent = count;
    });
});

async function formatTime(minutes) {

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
    if (theme.classList.contains('custom')) return;

    theme.addEventListener('click', () => {
        document.body.classList.forEach((item) => {
            if (item.startsWith('theme-')) {
                document.body.classList.remove(item);
            }
        });

        document.querySelectorAll('.custom').forEach((customTheme) => {
            customTheme.classList.remove('active');
        });

        document.body.style.removeProperty('--gradient-color');

        document.body.classList.add(`theme-${i+1}`);
        chrome.storage.local.set({ colorTheme: i+1 });
        
        themes.forEach((theme) => {
            theme.classList.remove('active');
        });

        theme.classList.add('active');
    });
});

chrome.storage.local.get('colorTheme', function (result) {

    if (typeof result.colorTheme === 'string') return;

    const colorTheme = result.colorTheme !== undefined ? result.colorTheme : 1;
    document.body.classList.add(`theme-${colorTheme}`);
    
    themes[colorTheme-1].classList.add('active');
});

// Custom theme //

const themeContainer = document.querySelector('.themes__container');

function getIndexOfCustomTheme(element) {
    const customThemeList = document.querySelectorAll('.custom');

    let index = 0;

    customThemeList.forEach((theme, i) => {
        if (theme === element) {
            index = i;
        }
    });

    return index;
}

function setActiveCustomTheme(index) {
    const customThemes = document.querySelectorAll('.custom');

    customThemes.forEach((theme, i) => {
        if (i === index) {
            theme.classList.add('active');
        }
    });
}

function displayCustomTheme(customGradientList) {
    const customThemeTemplate = 
    `
    <div class="theme-delete">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
    </div>
    <div class="theme-modify">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M362.7 19.3L314.3 67.7 444.3 197.7l48.4-48.4c25-25 25-65.5 0-90.5L453.3 19.3c-25-25-65.5-25-90.5 0zm-71 71L58.6 323.5c-10.4 10.4-18 23.3-22.2 37.4L1 481.2C-1.5 489.7 .8 498.8 7 505s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L421.7 220.3 291.7 90.3z"/></svg>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>
    `;

    for (let index = 0; index < customGradientList.length; index++) {
        const customTheme = document.createElement('div');
        customTheme.classList.add('themes__container--item', 'custom');
        
        customTheme.innerHTML = customThemeTemplate;
    
        customTheme.style.background = customGradientList[index];
        
        themeContainer.insertBefore(customTheme, themeContainer.children[themeContainer.children.length - 1]);
    }

    const customThemes = document.querySelectorAll('.custom');

    customThemes.forEach(customTheme => {
        let deleteButton = customTheme.getElementsByClassName('theme-delete')[0];
        let modifyButton = customTheme.getElementsByClassName("theme-modify")[0];

        deleteButton.addEventListener('click', event => {
            event.stopPropagation()
            
            if (customTheme.classList.contains('active')) {
                document.querySelector(".themes__container--item").classList.add('active');
                document.body.style.removeProperty('--gradient-color');

                chrome.storage.local.set({ colorTheme: 1 });
            }

            customGradientList.splice(getIndexOfCustomTheme(customTheme), 1);
            customTheme.remove();

            chrome.storage.local.set({ customGradientList: customGradientList });
        });

        modifyButton.addEventListener('click', event => {
            event.stopPropagation()

            window.location.href = `../pages/configurator.html?theme-id=${getIndexOfCustomTheme(customTheme)}`
        })

        customTheme.addEventListener('click', () => {
            chrome.storage.local.set({ colorTheme: `custom-${getIndexOfCustomTheme(customTheme) + 1}` });
            document.body.style.setProperty('--gradient-color', `${customGradientList[getIndexOfCustomTheme(customTheme)]}`);

            themes.forEach((theme) => {
                theme.classList.remove('active');
            });
            
            customThemes.forEach((theme) => {
                theme.classList.remove('active');
            });
            
            customTheme.classList.add('active');
        });
    });
}

chrome.storage.local.get('customGradientList').then((result) => {
    displayCustomTheme(result.customGradientList);
    activateCustomTheme(result.customGradientList);
});

function activateCustomTheme(customGradientList) {
    chrome.storage.local.get('colorTheme', function (result) {
        if (typeof result.colorTheme !== 'string') return;

        let customThemeIndex = parseInt(result.colorTheme.split('-')[1]) - 1;

        setActiveCustomTheme(customThemeIndex);
        document.body.style.setProperty('--gradient-color', `${customGradientList[customThemeIndex]}`);
    });
}



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

language.forEach((lang) => {
    lang.addEventListener('click', async () => {
        language.forEach((lang) => {
            lang.classList.remove('active');
        });

        
        lang.classList.add('active');
        chrome.storage.local.set({ language: lang.getAttribute('lang-data') });
        
        changeLanguage(); // This function is defined in translation.js

        let timeSaved = document.querySelector('.statistics__container_element--value[data-key="timeSaved"]'); // Exeption for time saved Statistics
        timeSaved.textContent = await formatTime(timeSaved.getAttribute('data-value'));
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