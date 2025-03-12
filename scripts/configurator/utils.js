function createSliderThumb(color, percent) {
    const sliderThumb = document.createElement("div");
    sliderThumb.style.background = color;
    sliderThumb.classList.add("slider-thumb");
    sliderThumb.style.left = `${percent}%`;
    return sliderThumb;
}

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
        event.stopPropagation();
        isDraggingGradientSlider = true;

        changeColorSelected(foundIndexFromElement(htmlElement));
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
    hexInput.value = hexValue;
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
    var nodes = Array.prototype.slice.call(document.querySelector(".color_container--bottom").children);

    return nodes.indexOf(colorElement);
}

function initializeColorListener(elementIndex) {
    const colorContainer = document.querySelector(`.color_element:nth-child(${elementIndex + 1})`);
    const colorContainerPreview = colorContainer.querySelector(`.color_element--preview`);
    const colorContainerColor = colorContainer.querySelector(`.color_element--hex`);
    const colorContainerPercent = colorContainer.querySelector(`.color_element--percent`);
    const colorContainerDelete = colorContainer.querySelector(`.color_element--delete`);
    
    colorContainerPreview.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    });
    
    // COLOR INPUT //
    
    colorContainerColor.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    });

    colorContainerColor.addEventListener("input", () => {
        const hexRegex = /#(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/g;

        if (!hexRegex.test(colorContainerColor.value)) return;

        updateAllParametersValue(colorContainerColor.value);
        updateGradientThumbColor(colorContainerColor.value);

        colorContainerPreview.style.background = colorContainerColor.value;
    });

    // PERCENT INPUT //

    colorContainerPercent.addEventListener("click", () => {
        changeColorSelected(getColorElementIndex(colorContainer));
    });

    colorContainerPercent.addEventListener("input", () => {
        if ((!(colorContainerPercent.value >= 0) || 
             !(colorContainerPercent.value <= 100)) || 
             !Number.isInteger(Number(colorContainerPercent.value)) || 
             colorContainerPercent.value.length <= 0
        ) return;

        updateGradientThumbPosition(COLOR_LIST[CURRENT_INDEX].HTMLelement, colorContainerPercent.value * (gradientBar.clientWidth / 100));
    });

    // DELETE ELEMENT //

    colorContainerDelete.addEventListener("click", () => {
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
        });
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
    const colorContainer = document.querySelector(".color_container");
    const elementContainer = document.querySelector(".color_container--bottom");

    if (elementContainer.childElementCount >= 4) {
        colorContainer.style.marginLeft = "10px";
    } else {
        colorContainer.style.marginLeft = "30px";
    }
}

function modifyColorInList(newColor) {
    if (COLOR_LIST[CURRENT_INDEX] == null) return;

    COLOR_LIST[CURRENT_INDEX].color = newColor;
}

function getAngle(event) {
    const rect = knob.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = event.clientX - centerX;
    const deltaY = event.clientY - centerY;
    return (Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90 + 360) % 360;
}