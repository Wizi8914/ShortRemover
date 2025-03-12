function getThemeID() {
    return parseInt(window.location.href.split("=")[1]);
}

async function loadCustomTheme() {
    const themeID = getThemeID();
    if (themeID != -1) {
        submitBtn.setAttribute("i18n-data", "configurator_modifyTheme");
        isLoadingCustomGradient = true;
        await initializeGradient(themeID);
    }
}

async function initializeGradient(themeID) {
    const gradientComponents = await getGradientComponents(themeID);
    let colorElements = gradientComponents.colorElements;

    ANGLE = normalizeAngle(gradientComponents.angle);
    angleInput.value = Math.round(ANGLE);
    knob.style.transform = `rotate(${ANGLE}deg)`;

    if (isSingleColorGradient(colorElements)) {
        colorElements = [colorElements[0]];
    }

    COLOR_LIST = colorElements;
    initializeColorElements(colorElements);
}

function isSingleColorGradient(colorElements) {
    return colorElements.length == 2 && colorElements[0].color === colorElements[1].color && colorElements[1].position == 100;
}

function normalizeAngle(angle) {
    if (angle > 360) {
        return Math.round(angle - 360);
    } else if (angle > 720) {
        return Math.round(angle - 720);
    } else if (angle < 0) {
        return Math.round(angle + 360);
    } else if (angle < -360) {
        return Math.round(angle + 720);
    } else {
        return Math.round(angle);
    }
}

function initializeColorElements(colorElements) {
    hexInput.value = colorElements[0].color;
    updateRGBValue(colorElements[0].color);
    updateSlidersFromHex(colorElements[0].color);
    updateGradientRender();
}

function getGradientComponents(themeID) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('customGradientList', function (result) {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError); // Error handling
            
            const customGradientList = result.customGradientList;

            const themeGradient = customGradientList[themeID];

            if (themeGradient == null) return resolve(null);

            const gradientComponents = themeGradient
            .replace("linear-gradient(", "")
            .replace(")", "")
            .split(",");

            const angle = Number(gradientComponents[0].replace("deg", ""));

            const colorElement = [];

            for (let index = 1; index < gradientComponents.length; index++) {
                const colorAndPosition = gradientComponents[index].trim().split(" ");
                
                colorElement.push({ color: colorAndPosition[0], position: colorAndPosition[1].replace("%", "") });
            }

            resolve({ angle: angle, colorElements: colorElement });
        });
    });
}

function updateGradientRender() {
    if (COLOR_LIST.length == 1) {
        let gradient = `linear-gradient(${ANGLE}deg, ${COLOR_LIST.map(({ color, position }) => `${color} ${position}%`).join(", ")}, ${COLOR_LIST[0].color} 100%)`;
        document.body.style.setProperty('--configurator-gradient', gradient);
    } else {
        let gradient = `linear-gradient(${ANGLE}deg, ${COLOR_LIST.map(({ color, position }) => `${color} ${position}%`).join(", ")})`;
        document.body.style.setProperty('--configurator-gradient', gradient);
    }
}