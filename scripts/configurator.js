let COLOR_LIST = [ // Default ShortRemover theme gradient value
    { HTMLelement: "", color: "#AE67fA", position: 0 },
    { HTMLelement: "", color: "#F49867", position: 100 },
];

let CURRENT_INDEX = 0;
let ANGLE = 90;

window.addEventListener("load", () => {
    var styleTag = document.getElementById('disable-transitions');
    
    setTimeout(() => {
        if (styleTag) styleTag.parentNode.removeChild(styleTag);
    }, 50);
})

function getThemeID() {
    return parseInt(window.location.href.split("=")[1]);
}

let isLoadingCustomGradient = false;

document.addEventListener('DOMContentLoaded', async () => {
    changeLanguage();
    await loadCustomTheme();
    initializeUIComponents();
    updateColor();
});

async function loadCustomTheme() {
    const themeID = getThemeID();
    if (themeID != -1) {
        submitBtn.setAttribute("i18n-data", "configurator_modifyTheme");
        isLoadingCustomGradient = true;
        await initializeGradient(themeID);
    }
}

function initializeUIComponents() {
    displayGradientsElement();
    updateGradientThumbActive();
    updateColorSelectorActive();
    updateAllParametersValue(COLOR_LIST[0].color);
}

chrome.storage.local.get('theme', function (result) {
    const theme = result.theme !== undefined ? result.theme : 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
});

async function initializeGradient(themeID) {
    const gradientComponents = await getGradientComponents(themeID);
    let colorElements = gradientComponents.colorElements;

    ANGLE = normalizeAngle(gradientComponents.angle);
    angleInput.value = Math.round(ANGLE);
    knob.style.transform = `rotate(${ANGLE}deg)`;

    if (colorElements.length == 2 && colorElements[0].color == colorElements[1].color && colorElements[1].position == 100) {
        colorElements = [colorElements[0]];
    }

    COLOR_LIST = colorElements;
    initializeColorElements(colorElements);
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
                
                colorElement.push({ color: colorAndPosition[0], position: colorAndPosition[1].replace("%", "") })
            }

            resolve({ angle: angle, colorElements: colorElement });
        });
    });
}

// CONFIGURATOR - GRADIENT BAR //
const gradientBar = document.querySelector(".preview_container--bar");
let isDraggingGradientSlider = false;

gradientBar.addEventListener("mousedown", e => {
    const x = clamp((e.clientX - gradientBar.getBoundingClientRect().left), 0, gradientBar.offsetWidth);
    const percent = (x / gradientBar.offsetWidth) * 100;
    const color = "#FFFFFF"

    const index = getIndexOfPosition(percent);
    CURRENT_INDEX = index;

    const sliderThumb = document.createElement("div");
    sliderThumb.style.background = color;
    sliderThumb.classList.add("slider-thumb");
    sliderThumb.style.left = `${percent}%`;

    gradientBar.insertBefore(sliderThumb, gradientBar.children[index])
    
    const elementObject = { HTMLelement: sliderThumb, color: color, position: percent };

    COLOR_LIST.splice(index, 0, elementObject);
    initThumbEventListener(COLOR_LIST[index].HTMLelement);

    updateAllParametersValue(color);
    
    initializeColorInColorList(percent);
    updateGradientThumbActive();

    updateColorSelectorActive();
    checkLastColorInList();
})

function getIndexOfPosition(position) {
    for (let i = 0; i < COLOR_LIST.length; i++) {
        if (isLoadingCustomGradient) {
            if (position == COLOR_LIST[i].position) return i + 1;
        } else {
            if (position < COLOR_LIST[i].position) return i;

            if (i + 1 == COLOR_LIST.length) return i + 1;
        }

    }
}

function displayGradientsElement() {
    for (let i = 0; i < COLOR_LIST.length; i++) {
        const colorElement = COLOR_LIST[i];
        const sliderThumb = document.createElement("div");
        
        sliderThumb.style.background = colorElement.color;
        sliderThumb.classList.add("slider-thumb");
        sliderThumb.style.left = `${colorElement.position}%`;
        gradientBar.appendChild(sliderThumb);
        
        COLOR_LIST[i].HTMLelement = sliderThumb;
    
        initThumbEventListener(COLOR_LIST[i].HTMLelement);
        initializeColorInColorList(colorElement.position);
    }

    isLoadingCustomGradient = false;
}

function initThumbEventListener(htmlElement) {
    htmlElement.addEventListener("mousedown", event => {
        event.stopPropagation()
        isDraggingGradientSlider = true;

        changeColorSelected(foundIndexFromElement(htmlElement))
    });
}

function changeColorSelected(colorIndex) {
    CURRENT_INDEX = colorIndex;
    const indexColor = COLOR_LIST[CURRENT_INDEX].color;

    updateAllParametersValue(indexColor);
    updateGradientThumbActive();

    updateColorSelectorActive();
}

function updateAllParametersValue(hexValue) {
    hexInput.value = hexValue
    updateRGBValue(hexValue);
    updateSlidersFromHex(hexValue);
}

function foundIndexFromElement(htmlElement) {
    for (let i = 0; i < COLOR_LIST.length; i++) {
        if (COLOR_LIST[i].HTMLelement == htmlElement) return i;
    }
}

function updateGradientThumbPosition(element, x) {
    x = clamp(x, 0, gradientBar.offsetWidth);

    element.style.left = `${(x / gradientBar.offsetWidth) * 100}%`;
    const position = (x / gradientBar.offsetWidth) * 100;
    
    COLOR_LIST[CURRENT_INDEX].position = position;
    alternateThumbPosition();

    document.querySelector(`.color_element:nth-child(${CURRENT_INDEX + 1}) > .color_element--percent`).value = Math.round(position);

    updateGradientRender();
}

function alternateThumbPosition() {
    const color_container = document.querySelector(".color_container--bottom");
    const gradient_bar = document.querySelector(".preview_container--bar");

    // Selected thumb is after
    if (COLOR_LIST[CURRENT_INDEX].position < COLOR_LIST[CURRENT_INDEX - 1]?.position) {
        [COLOR_LIST[CURRENT_INDEX], COLOR_LIST[CURRENT_INDEX - 1]] = [COLOR_LIST[CURRENT_INDEX - 1], COLOR_LIST[CURRENT_INDEX]];

        // Color List
        let color1 = color_container.children[CURRENT_INDEX - 1];
        let color2 = color_container.children[CURRENT_INDEX];

        swapHtmlElements(color1, color2);

        // Gradient Bar Thumb
        let thumb1 = gradient_bar.children[CURRENT_INDEX - 1];
        let thumb2 = gradient_bar.children[CURRENT_INDEX];

        swapHtmlElements(thumb1, thumb2);

        CURRENT_INDEX--;
    }

    // Selected thumb is before
    if (COLOR_LIST[CURRENT_INDEX].position > COLOR_LIST[CURRENT_INDEX + 1]?.position) {
        [COLOR_LIST[CURRENT_INDEX], COLOR_LIST[CURRENT_INDEX + 1]] = [COLOR_LIST[CURRENT_INDEX + 1], COLOR_LIST[CURRENT_INDEX]];

        // Color List
        let color1 = color_container.children[CURRENT_INDEX];
        let color2 = color_container.children[CURRENT_INDEX + 1];

        swapHtmlElements(color1, color2);

        // Gradient Bar Thumb
        let thumb1 = gradient_bar.children[CURRENT_INDEX];
        let thumb2 = gradient_bar.children[CURRENT_INDEX + 1];

        swapHtmlElements(thumb1, thumb2);

        CURRENT_INDEX++;
    }
}

function swapHtmlElements(elem1, elem2) {
    const parent = elem1.parentNode;
    const nextSibling = elem2.nextSibling;

    parent.insertBefore(elem1, nextSibling);
    parent.insertBefore(elem2, elem1);
}

function updateGradientThumbColor(newColor) {
    const thumb = COLOR_LIST[CURRENT_INDEX].HTMLelement;

    if (thumb == "") return; // Verification

    thumb.style.background = newColor;
}

function updateGradientThumbActive() {
    for (let i = 0; i < COLOR_LIST.length; i++) {
        COLOR_LIST[i].HTMLelement.classList.remove("selected");
        if (i == CURRENT_INDEX) COLOR_LIST[i].HTMLelement.classList.add("selected");
    }
}

document.addEventListener("mousemove", (e) => {
    if (isDraggingGradientSlider) updateGradientThumbPosition(COLOR_LIST[CURRENT_INDEX].HTMLelement, (e.clientX - gradientBar.getBoundingClientRect().left));
});

// CONFIGURATOR - COLOR LIST //

function initializeColorInColorList(percent) {
    const colorContainer = document.querySelector(".color_container--bottom");
    const elementIndex = getIndexOfPosition(percent) - 1;

    const htmlTemplate = `
        <div style="background-color: ${COLOR_LIST[elementIndex].color}" class="color_element--preview"></div>
        <input type="text" maxlength="7" value="${COLOR_LIST[elementIndex].color}" class="color_element--hex">
        <input type="text" maxlength="3" value="${Math.round(percent)}" class="color_element--percent">

        <div class="color_element--delete">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>
        </div>
    `;

    const colorElement = document.createElement('div');
    colorElement.classList.add('color_element');
        
    colorElement.innerHTML = htmlTemplate;

    colorContainer.insertBefore(colorElement, elementIndex === COLOR_LIST.length - 1 ? null : colorContainer.children[elementIndex]);
    
    initializeColorListener(elementIndex);

    updateColorContainerMargin();
}

function updateColorSelectorActive() {
    const colorElements = document.querySelectorAll(".color_element");

    for (let i = 0; i < colorElements.length; i++) {
        colorElements[i].classList.remove("selected");
        if (i == CURRENT_INDEX) colorElements[i].classList.add("selected");
    }
}

function getColorElementIndex(colorElement) {
    var nodes = Array.prototype.slice.call(document.querySelector(".color_container--bottom").children)

    return nodes.indexOf(colorElement);
}

function initializeColorListener(elementIndex) {
    const colorContainer = document.querySelector(`.color_element:nth-child(${elementIndex + 1})`);
    const colorContainer_preview = colorContainer.querySelector(`.color_element--preview`);
    const colorContainer_color = colorContainer.querySelector(`.color_element--hex`);
    const colorContainer_percent = colorContainer.querySelector(`.color_element--percent`);
    const colorContainer_delete = colorContainer.querySelector(`.color_element--delete`);
    
    colorContainer_preview.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    });
    
    // COLOR INPUT //
    
    colorContainer_color.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    })

    colorContainer_color.addEventListener("input", () => {
        const hexRegex = /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g

        if (!hexRegex.test(colorContainer_color.value)) return;

        updateAllParametersValue(colorContainer_color.value);
        updateGradientThumbColor(colorContainer_color.value);

        colorContainer_preview.style.background = colorContainer_color.value;
    })

    // PERCENT INPUT //

    colorContainer_percent.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    })

    colorContainer_percent.addEventListener("input", () => {
        if ((!(colorContainer_percent.value >= 0) || 
             !(colorContainer_percent.value <= 100)) || 
             !Number.isInteger(Number(colorContainer_percent.value)) || 
             colorContainer_percent.value.length <= 0
        ) return;

        updateGradientThumbPosition(COLOR_LIST[CURRENT_INDEX].HTMLelement, colorContainer_percent.value * (gradientBar.clientWidth / 100));
    });

    // DELETE ELEMENT //

    colorContainer_delete.addEventListener("click", () => {
        if (document.querySelectorAll(".color_element").length == 1) return;

        elementIndex = getColorElementIndex(colorContainer);
        
        COLOR_LIST.splice(elementIndex, 1);
        
        document.querySelector(`.color_element:nth-child(${elementIndex + 1})`).remove();
        document.querySelector(`.preview_container--bar > .slider-thumb:nth-child(${elementIndex + 1})`).remove();
        
        if (CURRENT_INDEX == elementIndex) {
            CURRENT_INDEX = 0;
        } else if (CURRENT_INDEX > elementIndex) {
            CURRENT_INDEX--;
        }

        changeColorSelected(CURRENT_INDEX);

        checkLastColorInList();
    });
}

function checkLastColorInList() {
    const colorElements = document.querySelectorAll(".color_element");

    if (colorElements.length == 1) {
        document.querySelector(".color_element").classList.add("disable");
    } else if (colorElements.length > 1) {
        colorElements.forEach(element => {
            element.classList.remove("disable");
        })
    }
}

function updateColorPreviewInList(color) {
    const colorElements = document.querySelectorAll(".color_element");

    if (colorElements.length == 0) return;

    colorElements[CURRENT_INDEX].querySelector(".color_element--preview").style.background = color;
}

function updateHexInList(hexValue) {
    const colorElements = document.querySelectorAll(".color_element");

    if (colorElements.length == 0) return;

    colorElements[CURRENT_INDEX].querySelector(".color_element--hex").value = hexValue;
}

function updateColorContainerMargin() {
    const colorContainer = document.querySelector(".color_container")
    const elementContainer = document.querySelector(".color_container--bottom")

    if (elementContainer.childElementCount >= 4) {
        colorContainer.style.marginLeft = "10px";
    } else {
        colorContainer.style.marginLeft = "30px";
    }
}

// CONFIGURATOR - COLOR SELECTOR //

const colorSlider = document.getElementById("hue-slider");
const colorThumb = document.getElementById("hueThumb");
const gradientBox = document.getElementById("gradientBox");
const pickerThumb = document.getElementById("pickerThumb");
const hexInput = document.getElementById("hexInput");
const rgbInputs = document.querySelectorAll(".value_container--rgb_item");

let HUE = 0;
let SATURATION = 0;
let BRIGHTNESS = 1;
let isDraggingSlider = false;
let isDraggingPicker = false;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

const HSLToRGB = (h, s, l) => {
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
  return { 
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4)) 
  }
};

const HSVToHSL = (brightness, saturation) => {  
    const newLightness = brightness * (1 - saturation / 2);
    const newSaturation = (brightness === 0 || newLightness === 1) ? 0 : (brightness - newLightness) / Math.min(newLightness, 1 - newLightness);
    
    return {
        lightness: newLightness,
        saturation: newSaturation
    }
}

function HEXToRGB(hex) {
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) hex = hex.split('').map(char => char + char).join('');

    if (hex.length !== 6) return null;

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
}

function RGBToHSL(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    const brightness = max;
    const saturation = max === 0 ? 0 : delta / max;

    let hue = 0;
    if (delta !== 0) {
        if (max === r) {
            hue = (g - b) / delta + (g < b ? 6 : 0);
        } else if (max === g) {
            hue = (b - r) / delta + 2;
        } else {
            hue = (r - g) / delta + 4;
        }
        hue /= 6;
    }

    return { hue, saturation, brightness };
}

function updatePickerThumbColor(color) {
    pickerThumb.style.background = color
}

function updateSliderThumbColor(hue) {
    let color = `hsl(${hue}, 100%, 50%)`;

    colorThumb.style.background = color;
}

function updateColor() {
    const correctedValue = HSVToHSL(BRIGHTNESS, SATURATION);
    const color = `hsl(${HUE}, ${correctedValue.saturation * 100}%, ${correctedValue.lightness * 100}%)`;

    updatePickerThumbColor(color);
    updateSliderThumbColor(HUE);
    updateColorPreviewInList(color);

    const rgb = HSLToRGB(HUE, correctedValue.saturation, correctedValue.lightness);
    const hexValue = rgbToHex(rgb.r, rgb.g, rgb.b);

    hexInput.value = hexValue;
    updateHexInList(hexValue);
    updateRGBInputs(rgb);

    modifyColorInList(hexValue);
    updateGradientThumbColor(hexValue);
    updateGradientRender();
}

function updateRGBInputs(rgb) {
    rgbInputs[0].children[0].value = rgb.r;
    rgbInputs[1].children[0].value = rgb.g;
    rgbInputs[2].children[0].value = rgb.b;
}

function updateHue(x) {
    x = clamp(x, 0, colorSlider.offsetWidth);
    HUE = (x / colorSlider.offsetWidth) * 360;
    gradientBox.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${HUE}, 100%, 50%))`;
    colorThumb.style.left = `${(x / colorSlider.offsetWidth) * 100}%`;
    updateColor();

    updateGradientRender()
}

function updatePicker(x, y) {
    x = clamp(x, 0, gradientBox.offsetWidth);
    y = clamp(y, 0, gradientBox.offsetHeight);
    SATURATION = x / gradientBox.offsetWidth;
    BRIGHTNESS = 1 - (y / gradientBox.offsetHeight);
    pickerThumb.style.left = `${(x / gradientBox.offsetWidth) * 100}%`;
    pickerThumb.style.top = `${(y / gradientBox.offsetHeight) * 100}%`;
    updateColor();

    updateGradientRender()
}

function updateSlidersFromHex(hex) {
    const rgbValues = HEXToRGB(hex);
    if (!rgbValues) return;

    const { r, g, b } = rgbValues;
    let { hue, saturation, brightness } = RGBToHSL(r, g, b);

    HUE = hue * 360;
    SATURATION = saturation;
    BRIGHTNESS = brightness;

    let correctedValue = HSVToHSL(brightness, saturation)
    
    colorThumb.style.left = `${Math.round(hue * 100)}%`;

    hue *= 360;

    const color = `hsl(${hue}, ${Math.round(correctedValue.saturation * 100)}%, ${correctedValue.lightness * 100}%)`;

    updatePickerThumbColor(color);
    updateSliderThumbColor(hue);

    gradientBox.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`;

    const pickerX = saturation * gradientBox.offsetWidth;
    const pickerY = (1 - brightness) * gradientBox.offsetHeight;
    pickerThumb.style.left = `${(pickerX / gradientBox.offsetWidth) * 100}%`;
    pickerThumb.style.top = `${(pickerY / gradientBox.offsetHeight) * 100}%`;
    
    modifyColorInList(hex)
    updateGradientRender()
}

// ICI

colorSlider.addEventListener("mousedown", startDraggingSlider);
gradientBox.addEventListener("mousedown", startDraggingPicker);
document.addEventListener("mousemove", handleDragging);
document.addEventListener("mouseup", stopDragging);

function startDraggingSlider(e) {
    isDraggingSlider = true;
    updateHue(e.offsetX);
}

function startDraggingPicker(e) {
    isDraggingPicker = true;
    updatePicker(e.offsetX, e.offsetY);
}

function handleDragging(e) {
    if (isDraggingSlider) {
        updateHue(e.clientX - colorSlider.getBoundingClientRect().left);
    }
    if (isDraggingPicker) {
        updatePicker(e.clientX - gradientBox.getBoundingClientRect().left, e.clientY - gradientBox.getBoundingClientRect().top);
    }
}

function stopDragging() {
    isDraggingSlider = false;
    isDraggingPicker = false;
    isDraggingGradientSlider = false;
    updateGradientRender();
}

function updateRGBValue(hexValue) {
    const rgbValues = HEXToRGB(hexValue)
    if (rgbValues == null) return;

    rgbInputs[0].children[0].value = rgbValues.r
    rgbInputs[1].children[0].value = rgbValues.g
    rgbInputs[2].children[0].value = rgbValues.b
}

hexInput.addEventListener("input", () => {
    const hexRegex = /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g

    if (!hexRegex.test(hexInput.value)) return;

    updateRGBValue(hexInput.value);
    updateSlidersFromHex(hexInput.value);
    updateGradientThumbColor(hexInput.value);

    updateHexInList(hexInput.value);
    updateColorPreviewInList(hexInput.value);
})

rgbInputs.forEach(rgbInput => {
    rgbInput.addEventListener("input", () => {
        if (Number.isNaN(Number(rgbInputs[0].children[0].value)) ||
            Number.isNaN(Number(rgbInputs[1].children[0].value)) ||
            Number.isNaN(Number(rgbInputs[2].children[0].value))
        ) return;

        const hexValue = rgbToHex(Number(rgbInputs[0].children[0].value), Number(rgbInputs[1].children[0].value), Number(rgbInputs[2].children[0].value));

        hexInput.value = hexValue;

        updateSlidersFromHex(hexValue);
        updateGradientThumbColor(hexValue);

        updateHexInList(hexValue);
        updateColorPreviewInList(hexValue);
    })  
})

// CONFIGURATOR - KNOB //

const knob = document.querySelector(".rotation_container--knob_item");
const angleInput = document.querySelector(".rotation_container--input")
let isDraggingKnob = false;
let lastAngle = 0;

function getAngle(event) {
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    return (Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90 + 360) % 360;
}

knob.addEventListener("mousedown", (event) => {
    isDraggingKnob = true;
    lastAngle = ANGLE;
    ANGLE = getAngle(event);
    knob.style.transform = `rotate(${ANGLE}deg)`;
    event.preventDefault();

    angleInput.value = Math.round(ANGLE);

    updateGradientRender()
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

    if (ANGLE > 360) {
        angleInput.value = Math.round(ANGLE - 360);
    } else if (ANGLE > 720) {
        angleInput.value = Math.round(ANGLE - 720)
    } else if (ANGLE < 0) {
        angleInput.value = Math.round(ANGLE + 360);
    } else if (ANGLE < - 360) {
        angleInput.value = Math.round(ANGLE + 720);
    } else {
        angleInput.value = Math.round(ANGLE);
    }

    updateGradientRender()
});

angleInput.addEventListener("input", () => {
    const inputValue = Number(angleInput.value);
    
    if (Number.isNaN(inputValue)) return;

    ANGLE = inputValue;
    knob.style.transform = `rotate(${inputValue}deg)`;

    updateGradientRender()
})


document.addEventListener("mouseup", () => {
    isDraggingKnob = false;
});

// RENDER GRADIENT //

function modifyColorInList(newColor) {
    if (COLOR_LIST[CURRENT_INDEX] == null) return;

    COLOR_LIST[CURRENT_INDEX].color = newColor;
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

// SUBMIT BUTTON //

const submitBtn = document.querySelector(".submit-button");

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