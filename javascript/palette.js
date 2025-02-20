//
//  Variables
//

const paletteContainer = document.getElementById("palette-wrapper");
const generateButton = document.getElementById("generate-button");

//
// Check if color is valid.
//

function isValidHexColor(color) {
    if (typeof color !== 'string') {
        return false;
    }

    const cleanColor = color.startsWith('#') ? color.slice(1) : color;

    const hexColorRegex = /^[0-9A-F]{6}$/i;
    return hexColorRegex.test(cleanColor);
}

//
// RGB to HSL & viceversa
//

function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
    let r, g, b;

    h /= 360;
    s = s || 0;
    l = l || 0;

    const temp1 = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const temp2 = 2 * l - temp1;

    function hueToRgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    }

    r = hueToRgb(temp2, temp1, h + 1 / 3);
    g = hueToRgb(temp2, temp1, h);
    b = hueToRgb(temp2, temp1, h - 1 / 3);

    return {
        r: Math.round(Math.min(Math.max(r * 255, 0), 255)),
        g: Math.round(Math.min(Math.max(g * 255, 0), 255)),
        b: Math.round(Math.min(Math.max(b * 255, 0), 255))
    };
}

//
// Function to initialize the default number of colors.
//

function addColorToPalette() {
    const colorBlock = document.createElement("div");
    colorBlock.className = "color";
    colorBlock.innerHTML = `
        <div class="color-options">
            <button class="brightness-option"><img src="images/brightness.png" alt="Brightness"></button>
            <div class="brightness-shades"></div>
            <button class="undo-option"><img src="images/go-back-arrow.png" alt="Undo"></button>
            <button class="lock-option"><img src="images/unlocked.png" alt="Unlocked"></button>
            <button class="copy-option"><img src="images/copy-icon.png" alt="Undo"></button>
        </div>
        <div class="color-name-area">
            <div class="color-copied-text">Color copied</div>
            <textarea class="color-code" aria-label="Color Code">COLOR</textarea>
            <div class="color-name">Name</div>
        </div>
    `;
    return colorBlock;
}

//
// Default number of colors.
//

for (let i = 0; i < 5; i++) {
    paletteContainer.appendChild(addColorToPalette());
}

//
// Buttons: Textarea, Brightness, Undo, Lock, Copy
//

function preventEnter(event) {
    const colorCodes = document.querySelectorAll(".color-code");
    const colorCodesArray = Array.from(colorCodes);
    const index = colorCodesArray.indexOf(event.currentTarget);

    colorCodes[index].addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    });
}

function textAreaEvent(event) {
    const colorCodes = document.querySelectorAll(".color-code");
    const colorCodesArray = Array.from(colorCodes);
    const paletteColors = document.querySelectorAll(".color");
    const index = colorCodesArray.indexOf(event.currentTarget);

    let inputValue = colorCodes[index].value;

    if (inputValue.startsWith('#')) {
        inputValue = inputValue.slice(1);
    }

    inputValue = inputValue.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);

    colorCodes[index].value = inputValue;

    if (isValidHexColor(inputValue)) {

        paletteColors[index].style.backgroundColor = '#' + inputValue;

        colorStacks[index].push(inputValue);

        updateNames(paletteColors[index], inputValue);
        updateIfDark(paletteColors[index], inputValue);
        updatePaletteInformation();
    }
}

function addFunctionalityToTextAreas() {
    const colorCodes = document.querySelectorAll(".color-code");
    colorCodes.forEach(button => button.removeEventListener('input', textAreaEvent));
    colorCodes.forEach(button => button.removeEventListener('input', preventEnter));
    colorCodes.forEach(button => button.addEventListener('input', textAreaEvent));
    colorCodes.forEach(button => button.addEventListener('input', preventEnter));
}

let storedColors = [[], [], [], [], [], [], [], [], []];
let colorStacks = [[], [], [], [], [], [], [], [], []];

async function loadColors() {
    try {
        const response = await fetch('config.json');
        const data = await response.json();

        const paletteColors = document.querySelectorAll(".color");
        data.colors.forEach((color, index) => {
            if (paletteColors[index]) {
                paletteColors[index].style.backgroundColor = color;
                updateIfDark(paletteColors[index], color);
                updateNames(paletteColors[index], color);
            }
            storedColors[index].push(color);
            colorStacks[index].push(color);
        });
        updatePaletteInformation();
    } catch (error) {
        console.error('Error:', error);
    }
}

loadColors();

let unlocked = [true, true, true, true, true, true, true, true];

function brightnessShow(event) {
    const brightnessButtons = document.querySelectorAll(".brightness-option");
    const brightnessButtonsArray = Array.from(brightnessButtons);
    const colorOptions = document.querySelectorAll(".color-options");
    const brightnessShades = document.querySelectorAll(".brightness-shades");
    const index = brightnessButtonsArray.indexOf(event.currentTarget);

    if (index === -1) return;

    brightnessShades[index].classList.add("show");
    colorOptions[index].style.visibility = 'visible';
    colorOptions[index].style.opacity = 1;

    function makeColor(color, shade) {
        if (isValidHexColor(color)) {
            let rgb = hexToRgb(color);
            let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

            if (shade === 'light') {
                hsl.l = Math.min(1, hsl.l + 0.03);
            } else if (shade === 'dark') {
                hsl.l = Math.max(0, hsl.l - 0.03);
            }

            let newRgb = hslToRgb(hsl.h, hsl.s, hsl.l);
            return rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        }
    }

    function makeShades(color, number) {
        let newColor = color;
        let shades = [];
        for (let i = 0; i < number/2-1; i++) {
            let lighter = makeColor(newColor, 'light');
            shades.push(lighter);
            newColor = lighter;
        }
        shades.reverse();
        shades.push(`#${color}`);
        newColor = shades[shades.length - 1];
        for (let i = 0; i < number/2; i++) {
            let darker = makeColor(newColor, 'dark');
            shades.push(darker);
            newColor = darker;
        }

        return shades;
    }

    brightnessShades[index].innerHTML = '';

    for (let i = 0; i < 11; i++) {
        const shade = document.createElement("div");
        shade.className = "shades";
        brightnessShades[index].appendChild(shade);
    }

    const colorCodes = document.querySelectorAll(".color-code");
    const color = colorCodes[index].value;

    const shades = brightnessShades[index].querySelectorAll(".shades");
    const shadows = makeShades(color, shades.length);

    //
    // Shade Event Listener
    //

    function shadeColor(event) {
        const colorPalettes = document.querySelectorAll(".color");
        const shadesArray = Array.from(shades);
        const shadeIndex = shadesArray.indexOf(event.currentTarget);

        const color = '#' + shades[shadeIndex].textContent;
        colorPalettes[index].style.backgroundColor = color;

        colorStacks[index].push(color);

        updateNames(colorPalettes[index], color);
        updateIfDark(colorPalettes[index], color);
        updatePaletteInformation();
    }

    shades.forEach((shade, shadeIndex) => {
        shade.style.backgroundColor = shadows[shadeIndex];
        shade.textContent = shadows[shadeIndex].replace('#', '');
        shade.removeEventListener("click", shadeColor);
        shade.addEventListener("click", shadeColor);
        if (isColorTooDark(shadows[shadeIndex])) {
            shade.classList.add("white");
        } else {
            shade.classList.remove("white");
        }
    });
    const shadeIndex = Math.round(shades.length/2-1);
    if (isColorTooDark(color)) {
        shades[shadeIndex].style.color = 'rgb(255, 255, 255, 0.9)';
    } else {
        shades[shadeIndex].style.color = 'rgb(0, 0, 0, 0.9)';
    }
}

document.addEventListener("click", function(event) {
    const brightnessButtons = document.querySelectorAll(".brightness-option");
    const brightnessOptions = document.querySelectorAll(".brightness-shades");
    let clickedInside = false;
    [...brightnessButtons, ...brightnessButtons].forEach(option => {
        if (option.contains(event.target)) {
            clickedInside = true;
        }
    });

    if (!clickedInside) {
        const colorOptions = document.querySelectorAll(".color-options");
        const brightnessShades = document.querySelectorAll(".brightness-shades");
        brightnessOptions.forEach((option, index) => {
            if (brightnessShades[index].classList.contains("show")) {
                brightnessShades[index].classList.remove("show");
                colorOptions[index].style.visibility = '';
                colorOptions[index].style.opacity = '';
            }
        });
    }
});

function addFunctionalityToBrightnessButtons() {
    const brightnessButtons = document.querySelectorAll(".brightness-option");
    brightnessButtons.forEach(button => button.removeEventListener("click", brightnessShow));
    brightnessButtons.forEach(button => button.addEventListener("click", brightnessShow));
}
function undoColor(event) {
    const undoButtons = document.querySelectorAll(".undo-option");
    const undoButtonsArray = Array.from(undoButtons);
    const paletteColors = document.querySelectorAll(".color");
    const index = undoButtonsArray.indexOf(event.currentTarget);

    if (index === -1) return;

    if (colorStacks[index].length > 1) {
        colorStacks[index].pop();
        const previousColor = colorStacks[index].slice(-1)[0];

        paletteColors[index].style.backgroundColor = previousColor;
        updateIfDark(paletteColors[index], previousColor);
        updateNames(paletteColors[index], previousColor);
        updatePaletteInformation();
    }
}

function addFunctionalityToUndoButtons() {
    const undoButtons = document.querySelectorAll(".undo-option");
    undoButtons.forEach(button => button.removeEventListener("click", undoColor));
    undoButtons.forEach(button => button.addEventListener("click", undoColor));
}

function lockColor(event) {
    const lockButtons = document.querySelectorAll(".lock-option");
    const lockButtonsArray = Array.from(lockButtons);
    const index = lockButtonsArray.indexOf(event.currentTarget);

    if (index === -1) return;

    unlocked[index] = !unlocked[index];

    const image = lockButtons[index].querySelector("img");

    if (unlocked[index]) {
        image.src = "images/unlocked.png";
        image.alt = "Unlocked";
    } else {
        image.src = "images/locked.png";
        image.alt = "Locked";
    }
}

function addFunctionalityToLockButtons() {
    const lockButtons = document.querySelectorAll(".lock-option");
    lockButtons.forEach(button => button.removeEventListener("click", lockColor));
    lockButtons.forEach(button => button.addEventListener("click", lockColor));
}

function copyColor(event) {
    const copyButtons = document.querySelectorAll(".copy-option");
    const copyButtonTexts = document.querySelectorAll(".color-copied-text");
    const textAreas = document.querySelectorAll(".color-code");
    const copyButtonsArray = Array.from(copyButtons);
    const index = copyButtonsArray.indexOf(event.currentTarget);

    if (index === -1) return;

    const color = textAreas[index].textContent.toUpperCase();

    navigator.clipboard.writeText(color)
        .then(() => {
            copyButtonTexts[index].classList.add('show');
            setTimeout(() => {
                copyButtonTexts[index].classList.remove('show');
            }, 1500);
        })
        .catch(err => {
            console.error("Error copying text: ", err);
        });
}
function addFunctionalityToCopyButtons() {
    const copyButtons = document.querySelectorAll(".copy-option");
    copyButtons.forEach(button => button.removeEventListener("click", copyColor));
    copyButtons.forEach(button => button.addEventListener("click", copyColor));
}

function addFunctionalityToAllButtons() {
    addFunctionalityToTextAreas();
    addFunctionalityToBrightnessButtons();
    addFunctionalityToUndoButtons();
    addFunctionalityToLockButtons();
    addFunctionalityToCopyButtons();
}

addFunctionalityToAllButtons();

//
// RGB to Hex Converter
//

function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function toHex(n = 0) {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

//
// Hex to RGB Converter
//

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

//
// Function to get one random color
//

function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // Random red value (0-255)
    const g = Math.floor(Math.random() * 256); // Random green value (0-255)
    const b = Math.floor(Math.random() * 256); // Random blue value (0-255)

    return  rgbToHex(r, g, b);
}

//
// Function to randomize & update all colors
//

function isColorTooDark(hex) {
    function luminance(r, g, b) {
        const rgb = [r, g, b].map(function (x) {
            x /= 255;
            return (x <= 0.03928) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }
    const {r, g, b} = hexToRgb(hex);
    const colorLuminance = luminance(r, g, b);
    const threshold = 0.2;

    return colorLuminance < threshold;
}

function updateIfDark(colorBlock, color) {

    const images = colorBlock.querySelectorAll("img");
    const colorCode = colorBlock.querySelector(".color-code");
    const colorName = colorBlock.querySelector(".color-name");

    if (isColorTooDark(color)) {
        images.forEach(img => {
            img.classList.add("white");
        });
        colorName.classList.add("white");
        colorCode.classList.add("white");
    } else {
        images.forEach(img => {
            img.classList.remove("white");
        });
        colorName.classList.remove("white");
        colorCode.classList.remove("white");
    }
}

function getColorName(hexCode) {
    const n_match = ntc.name(hexCode);
    return n_match[1];
}

function updateNames(colorBlock, color) {
    const colorCode = colorBlock.querySelector(".color-code");
    const colorName = colorBlock.querySelector(".color-name");

    colorCode.value = color.replace('#', '');
    colorName.textContent = getColorName(color);
}

function randomizeColors() {
    const paletteColors = document.querySelectorAll(".color");
    paletteColors.forEach((colorBlock, index) => {
        if (unlocked[index]) {
            const color = getRandomColor();
            colorBlock.style.backgroundColor = color;

            colorStacks[index].push(color);

            updateNames(colorBlock, color);
            updateIfDark(colorBlock, color);
            updatePaletteInformation();
        }
    });
}

//
// Randomize colors when:
//  - Generate button is clicked.
//  - Space is pressed.
//

generateButton.addEventListener("click", function() {
    randomizeColors();
});

document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        const brightnessOptions = document.querySelectorAll(".brightness-option");
        const colorOptions = document.querySelectorAll(".color-options");
        const brightnessShades = document.querySelectorAll(".brightness-shades");
        brightnessOptions.forEach((option, index) => {
            if (brightnessShades[index].classList.contains("show")) {
                brightnessShades[index].classList.remove("show");
                colorOptions[index].style.visibility = '';
                colorOptions[index].style.opacity = '';
            }
        });
        event.preventDefault();
        randomizeColors();
    }
});

//
// Add - Remove Color Button
//

const removeColorButton = document.getElementById("minus-button");
const addColorButton = document.getElementById("plus-button");
const colorCount = document.getElementById("color-count");

function updateColorCount() {
    const numOfColors = paletteContainer.querySelectorAll(".color").length;
    colorCount.textContent = `${numOfColors}`;
}

function removeLastChild(container) {
    let numOfColors = container.querySelectorAll(".color").length;
    if (numOfColors > 1) {
        container.removeChild(container.lastChild);
        updateColorCount();
        numOfColors--;
        unlocked[numOfColors] = true;
        colorStacks[numOfColors] = [];
        colorStacks[numOfColors].push(storedColors[numOfColors][0]);
        updatePaletteInformation();
    }
}

removeColorButton.addEventListener("click", function() {
    removeLastChild(paletteContainer);
});

function appendChild(container) {
    const numOfColors = container.querySelectorAll(".color").length;
    if (numOfColors < 8) {
        container.append(addColorToPalette());
        addFunctionalityToAllButtons();
        updateColorCount();

        container.lastChild.style.backgroundColor = colorStacks[numOfColors][0];
        updateIfDark(container.lastChild, colorStacks[numOfColors][0]);
        updateNames(container.lastChild, colorStacks[numOfColors][0]);
        updatePaletteInformation();
    }
}

addColorButton.addEventListener("click", function() {
    appendChild(paletteContainer);
});

//
// Download button
//

document.getElementById("download-button").addEventListener("click", function() {
    const div = document.getElementById("palette");

    html2canvas(div).then(function(canvas) {
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        const colorCodes = document.querySelectorAll(".color-code");
        link.href = imageUrl;

        let linkName = [];
        for(let i = 0; i < colorCodes.length; i++) {
            if (!colorCodes[i].classList.contains('hide')) {
                linkName.push(colorCodes[i].value);
            }
        }
        linkName = linkName.join('-').toUpperCase();
        link.download = linkName;
        link.click();
    });
});

//
// Reset Button
//

document.getElementById("logo-button").addEventListener("click", function() {
    window.location.reload();
});

document.getElementById("reset-button").addEventListener("click", function() {
    paletteContainer.innerHTML = '';
    colorStacks = [];
    colorStacks = [...storedColors];
    unlocked.fill(true);
    for (let i = 0; i < 5; i++) {
        const newColor = document.createElement("div");
        paletteContainer.append(addColorToPalette());
        addFunctionalityToAllButtons();
        updateColorCount();

        paletteContainer.lastChild.style.backgroundColor = colorStacks[i][0];
        updateIfDark(paletteContainer.lastChild, colorStacks[i][0]);
        updateNames(paletteContainer.lastChild, colorStacks[i][0]);
        updatePaletteInformation();
    }
});

//
// Palette Information
//

function addPaletteInfoContainer(colorCode, name, rgb) {
    const colorBlock = document.createElement("div");
    colorBlock.className = "palette-information";
    colorBlock.innerHTML = `
                <div class="palette-color">
                    <div class="palette-color-circle"></div>
                </div>
                <div class="palette-inside-information">
                    <h2 class="palette-information-name">${name}</h2>
                    <ul>
                    <li><p>${colorCode}</p></li>
                    <li><p>${rgb}</p></li>
                </ul>
            </div>
    `;
    const colorCircle = colorBlock.querySelector(".palette-color-circle");
    colorCircle.style.backgroundColor = colorCode;

    return colorBlock;
}

const paletteGrid = document.getElementById("palette-grid");
function updatePaletteInformation() {
    const paletteColors = document.querySelectorAll(".color");
    const colorCodes = document.querySelectorAll(".color-code");
    paletteGrid.innerHTML = '';
    paletteColors.forEach((paletteColor, index) => {
        const color = '#' + colorCodes[index].value.toUpperCase();
        const rgbColor = hexToRgb(color);
        paletteGrid.appendChild(addPaletteInfoContainer(color, getColorName(color), `rgb(${rgbColor.r}, ${rgbColor.b}, ${rgbColor.g})`));
    });
}