let COLOR_LIST = [
    { color: "#FFFFFF", position: 0 }
];

let CURRENT_INDEX = 0;
let ANGLE = 0;

window.addEventListener("load", () => {
    var styleTag = document.getElementById('disable-transitions');
    const themeID = getThemeID();
    
    setTimeout(() => {
        if (styleTag) styleTag.parentNode.removeChild(styleTag);
    }, 50);
    
    if (themeID == -1) return;

    submitBtn.textContent = "Modify this Theme";
    initializeGradient(themeID);
})

function getThemeID() {
    return parseInt(window.location.href.split("=")[1]);
}

document.addEventListener('DOMContentLoaded', () => {
    changeLanguage();
});

chrome.storage.local.get('theme', function (result) {
    const theme = result.theme !== undefined ? result.theme : 'dark';
    document.body.classList.toggle('light-theme', theme === 'light');
});

async function initializeGradient(themeID) {
    const gradientComponents = await getGradientComponents(themeID);

    let colorElements = gradientComponents.colorElements;

    // KNOB Rotation

    ANGLE = gradientComponents.angle;

    if (ANGLE > 360) {
        ANGLE = Math.round(ANGLE - 360);
    } else if (ANGLE > 720) {
        ANGLE = Math.round(ANGLE - 720)
    } else if (ANGLE < 0) {
        ANGLE = Math.round(ANGLE + 360);
    } else if (ANGLE < - 360) {
        ANGLE = Math.round(ANGLE + 720);
    } else {
        ANGLE = Math.round(ANGLE);
    }

    angleInput.value = Math.round(ANGLE);
    knob.style.transform = `rotate(${ANGLE}deg)`;

    if (colorElements.length == 2 && colorElements[0].color == colorElements[1].color && colorElements[1].position == 100) {
        colorElements = [colorElements[0]]
    }
    
    COLOR_LIST = colorElements;

    hexInput.value = colorElements[0].color
    updateRGBValue(colorElements[0].color);
    updateSlidersFromHex(colorElements[0].color);
    updateGradientRender();
}

function getGradientComponents(themeID) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get('customGradientList', function (result) {
            if (chrome.runtime.lastError) return reject(chrome.runtime.lastError); // Gestion d'erreur
            
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

// CONFIGURATOR - COLOR SELECTOR //

const colorSlider = document.getElementById("hue-slider");
const colorThumb = document.getElementById("thumb");
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
    const correctedValue = HSVToHSL(BRIGHTNESS, SATURATION)

    const color = `hsl(${HUE}, ${correctedValue.saturation * 100}%, ${correctedValue.lightness * 100}%)`;
    updatePickerThumbColor(color);
    updateSliderThumbColor(HUE);

    const rgb = HSLToRGB(HUE, correctedValue.saturation, correctedValue.lightness);
    hexInput.value = rgbToHex(rgb.r, rgb.g, rgb.b);

    rgbInputs[0].children[0].value = rgb.r;
    rgbInputs[1].children[0].value = rgb.g;
    rgbInputs[2].children[0].value = rgb.b;

    modifyColorInList(rgbToHex(rgb.r, rgb.g, rgb.b));
    updateGradientRender()
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

    updatePickerThumbColor(color)
    updateSliderThumbColor(hue)

    gradientBox.style.background = `linear-gradient(to top, black, transparent), linear-gradient(to right, white, hsl(${hue}, 100%, 50%))`;

    const pickerX = saturation * gradientBox.offsetWidth;
    const pickerY = (1 - brightness) * gradientBox.offsetHeight;
    pickerThumb.style.left = `${(pickerX / gradientBox.offsetWidth) * 100}%`;
    pickerThumb.style.top = `${(pickerY / gradientBox.offsetHeight) * 100}%`;
    
    modifyColorInList(hex)
    updateGradientRender()
}

colorSlider.addEventListener("mousedown", (e) => {
    isDraggingSlider = true;
    updateHue(e.offsetX);
});

gradientBox.addEventListener("mousedown", (e) => {
    isDraggingPicker = true;
    updatePicker(e.offsetX, e.offsetY);
});

document.addEventListener("mousemove", (e) => {
    if (isDraggingSlider) {
        updateHue(e.clientX - colorSlider.getBoundingClientRect().left);
    }

    if (isDraggingPicker) {
        updatePicker(e.clientX - gradientBox.getBoundingClientRect().left, e.clientY - gradientBox.getBoundingClientRect().top);
    }
});

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
})

rgbInputs.forEach(function callback(rgbInput, index) {
    rgbInput.addEventListener("input", () => {
        if (Number.isNaN(Number(rgbInputs[0].children[0].value)) ||
            Number.isNaN(Number(rgbInputs[1].children[0].value)) ||
            Number.isNaN(Number(rgbInputs[2].children[0].value))
        ) return;

        const hexValue = rgbToHex(Number(rgbInputs[0].children[0].value), Number(rgbInputs[1].children[0].value), Number(rgbInputs[2].children[0].value));

        hexInput.value = hexValue;

        updateSlidersFromHex(hexValue);
    })  
})

document.addEventListener("mouseup", () => {
    isDraggingSlider = false;
    isDraggingPicker = false;

    updateGradientRender()
});

updateColor()



// CONFIGURATOR - KNOB //

const knob = document.querySelector(".rotation_container--knob_item");
const angleInput = document.querySelector(".rotation_container--input")
let isDragging = false;
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
    isDragging = true;
    lastAngle = ANGLE;
    ANGLE = getAngle(event);
    knob.style.transform = `rotate(${ANGLE}deg)`;
    event.preventDefault();

    angleInput.value = Math.round(ANGLE);

    updateGradientRender()
});

document.addEventListener("mousemove", (event) => {
    if (!isDragging) return;

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
    isDragging = false;
});

// RENDER GRADIENT //

function modifyColorInList(newColor) {
    if (COLOR_LIST[CURRENT_INDEX] == null) return;

    COLOR_LIST[CURRENT_INDEX] = { color: newColor, position: CURRENT_INDEX }

    console.log(newColor)
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