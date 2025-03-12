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
    };
};

const HSVToHSL = (brightness, saturation) => {  
    const newLightness = brightness * (1 - saturation / 2);
    const newSaturation = (brightness === 0 || newLightness === 1) ? 0 : (brightness - newLightness) / Math.min(newLightness, 1 - newLightness);
    
    return {
        lightness: newLightness,
        saturation: newSaturation
    };
}

function HEXToRGB(hex) {
    hex = hex.replace(/^#/, '');

    if (hex.length === 3) hex = split('').map(char => char + char).join('');

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
    pickerThumb.style.background = color;
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

    updateGradientRender();
}

function updatePicker(x, y) {
    x = clamp(x, 0, gradientBox.offsetWidth);
    y = clamp(y, 0, gradientBox.offsetHeight);
    SATURATION = x / gradientBox.offsetWidth;
    BRIGHTNESS = 1 - (y / gradientBox.offsetHeight);
    pickerThumb.style.left = `${(x / gradientBox.offsetWidth) * 100}%`;
    pickerThumb.style.top = `${(y / gradientBox.offsetHeight) * 100}%`;
    updateColor();

    updateGradientRender();
}

function updateSlidersFromHex(hex) {
    const rgbValues = HEXToRGB(hex);
    if (!rgbValues) return;

    const { r, g, b } = rgbValues;
    let { hue, saturation, brightness } = RGBToHSL(r, g, b);

    HUE = hue * 360;
    SATURATION = saturation;
    BRIGHTNESS = brightness;

    let correctedValue = HSVToHSL(brightness, saturation);
    
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
    
    modifyColorInList(hex);
    updateGradientRender();
}

function updateRGBValue(hexValue) {
    const rgbValues = HEXToRGB(hexValue);
    if (rgbValues == null) return;

    rgbInputs[0].children[0].value = rgbValues.r;
    rgbInputs[1].children[0].value = rgbValues.g;
    rgbInputs[2].children[0].value = rgbValues.b;
}

function handleDragging(e) {
    if (isDraggingSlider) {
        updateHue(e.clientX - colorSlider.getBoundingClientRect().left);
    }
    if (isDraggingPicker) {
        updatePicker(e.clientX - gradientBox.getBoundingClientRect().left, e.clientY - gradientBox.getBoundingClientRect().top);
    }
}

function startDraggingSlider(e) {
    isDraggingSlider = true;
    updateHue(e.offsetX);
}

function startDraggingPicker(e) {
    isDraggingPicker = true;
    updatePicker(e.offsetX, e.offsetY);
}

hexInput.addEventListener("input", () => {
    const hexRegex = /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g;

    if (!hexRegex.test(hexInput.value)) return;

    updateRGBValue(hexInput.value);
    updateSlidersFromHex(hexInput.value);
    updateGradientThumbColor(hexInput.value);

    updateHexInList(hexInput.value);
    updateColorPreviewInList(hexInput.value);
});

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
});