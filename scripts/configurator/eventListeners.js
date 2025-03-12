window.addEventListener("load", () => {
    var styleTag = document.getElementById('disable-transitions');
    
    setTimeout(() => {
        if (styleTag) styleTag.parentNode.removeChild(styleTag);
    }, 50);
});

document.addEventListener('DOMContentLoaded', async () => {
    changeLanguage();
    await loadCustomTheme();
    initializeUIComponents();
    updateColor();
});

chrome.storage.local.get('theme', function (result) {
    const theme = result.theme !== undefined ? result.theme : 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
});

document.addEventListener("mousemove", (e) => {
    if (isDraggingGradientSlider) updateGradientThumbPosition(COLOR_LIST[CURRENT_INDEX].HTMLelement, (e.clientX - gradientBar.getBoundingClientRect().left));
});

document.addEventListener("mousemove", (event) => {
    if (!isDraggingKnob) return;

    let newAngle = getAngle(event);
    let delta = newAngle - lastAngle;
    
    if (delta > 180) {
        newAngle -= 360;
    } else if (delta < -180) {
        newAngle += 360;
    }
    
    ANGLE = newAngle;
    lastAngle = newAngle;
    knob.style.transform = `rotate(${ANGLE}deg)`;

    angleInput.value = normalizeAngle(ANGLE);

    updateGradientRender();
});

document.addEventListener("mousemove", handleDragging);

document.addEventListener("mouseup", () => {
    isDraggingKnob = false;
    isDraggingSlider = false;
    isDraggingPicker = false;
    isDraggingGradientSlider = false;
    updateGradientRender();
});

gradientBar.addEventListener("mousedown", e => {
    const x = clamp((e.clientX - gradientBar.getBoundingClientRect().left), 0, gradientBar.offsetWidth);
    const percent = (x / gradientBar.offsetWidth) * 100;
    const color = "#FFFFFF";

    const index = getIndexOfPosition(percent);
    CURRENT_INDEX = index;

    const sliderThumb = createSliderThumb(color, percent);

    gradientBar.insertBefore(sliderThumb, gradientBar.children[index]);
    
    const elementObject = { HTMLelement: sliderThumb, color: color, position: percent };

    COLOR_LIST.splice(index, 0, elementObject);
    initThumbEventListener(COLOR_LIST[index].HTMLelement);

    updateAllParametersValue(color);
    
    initializeColorInColorList(percent);
    updateGradientThumbActive();

    updateColorSelectorActive();
    checkLastColorInList();
});

colorSlider.addEventListener("mousedown", startDraggingSlider);
gradientBox.addEventListener("mousedown", startDraggingPicker);

knob.addEventListener("mousedown", (event) => {
    isDraggingKnob = true;
    lastAngle = ANGLE;
    ANGLE = getAngle(event);
    knob.style.transform = `rotate(${ANGLE}deg)`;
    event.preventDefault();

    angleInput.value = Math.round(ANGLE);

    updateGradientRender();
});

submitBtn.addEventListener("click", () => {
    chrome.storage.local.get('customGradientList', function (result) {
        let customGradientList = result.customGradientList !== undefined ? result.customGradientList : [];
        const themeID = getThemeID();

        if (themeID == -1) {
            customGradientList.push(document.body.style.getPropertyValue("--configurator-gradient"));
        
            chrome.storage.local.set({ colorTheme: `custom-${customGradientList.length}` });
        } else {
            customGradientList[themeID] = document.body.style.getPropertyValue("--configurator-gradient");
            
            chrome.storage.local.set({ colorTheme: `custom-${themeID + 1 == customGradientList.length ? themeID + 1 : themeID}` });
        }

        chrome.storage.local.set({ customGradientList: customGradientList });
        window.location.href = "../pages/options.html";
    });
});

function initializeUIComponents() {
    displayGradientsElement();
    updateGradientThumbActive();
    updateColorSelectorActive();
    updateAllParametersValue(COLOR_LIST[0].color);
}