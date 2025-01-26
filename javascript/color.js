const paletteColors = document.querySelectorAll(".palette-color");
const palettes = document.querySelectorAll(".palette");

const lockButtons = document.querySelectorAll(".lock-button");
const undoButtons = document.querySelectorAll('.undo-button');
const brightnessButtons = document.querySelectorAll('.brightness-button');
const brightnessBars = document.querySelectorAll('.brightness-bar');
const currentBrightnessIndicators = document.querySelectorAll('.current-brightness');
const copyButtons = document.querySelectorAll('.copy-button');
const copyButtonTexts = document.querySelectorAll('.copy-button-text');

const colorMode = document.querySelector(".palette-color-mode-button");

const textAreas = document.querySelectorAll(".palette-textarea");
const colorNames = document.querySelectorAll(".palette-color-name");

const generateButton = document.querySelector(".palette-generate-button");

let unlocked = [true, true, true, true, true, true, true];
let colorStacks = [];

let currentShownPalettes = currentDivs();

function currentDivs() {
    let num = 0;
    palettes.forEach((palette, index) => {
        if (!palette.classList.contains("hide")) {
            num++;
        }
    });
    return num;
}
const colors = ['#2C94F7', '#eedc9e', '#ecb0fa', '#dd80a1', '#d27e4e', '#dd80a1'];
paletteColors.forEach((paletteColor, index) => {
    paletteColor.style.backgroundColor = colors[index];
});

colorMode.addEventListener("click", function() {
    if (colorMode.textContent === 'Pastel') {
        colorMode.textContent = 'Default';
    } else if (colorMode.textContent === 'Default') {
        colorMode.textContent = 'Pastel';
    }
});

function singleRgbtoHex(color) {
    const rgbValues = color.match(/\d+/g);

    const r = parseInt(rgbValues[0]);
    const g = parseInt(rgbValues[1]);
    const b = parseInt(rgbValues[2]);

    return rgbToHex(r, g, b);
}

paletteColors.forEach((paletteColor, index) => {
    let initialColor = paletteColor.style.backgroundColor;

    const color = singleRgbtoHex(initialColor);
    colorStacks.push([color]);
    textAreas[index].textContent = color.replace("#", '');
    colorNames[index].textContent = getColorName(textAreas[index].textContent);
});

textAreas.forEach((button, index) => {
    button.addEventListener('input', function () {
        let inputValue = textAreas[index].textContent;

        if (inputValue.startsWith('#')) {
            inputValue = inputValue.slice(1);
        }
        inputValue = inputValue.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);

        textAreas[index].textContent = inputValue;

        localStorage.setItem('colorContent', inputValue);
        const savedContent = localStorage.getItem('colorContent');

        if (savedContent.length === 6 && isValidHexColor(savedContent)) {
            colorStacks[index].push('#' + savedContent);
            paletteColors[index].style.backgroundColor = '#' + savedContent;
            changeIfDark(savedContent, index);
            colorNames[index].textContent = getColorName(savedContent);
        } else {
            paletteColors[index].style.backgroundColor = '';
            changeIfDark(paletteColors[index].style.backgroundColor, index);
        }
    });
});

brightnessButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        brightnessBars[index].classList.add('show');

        const colorContainer = paletteColors[index];
        const elements = colorContainer.querySelectorAll('*');

        elements.forEach(element => {
            if (!element.classList.contains('copy-button-text') && !element.classList.contains("color-picker-container")) {
                element.style.visibility = 'visible';
                element.style.opacity = '1';
            }
        });

        const shades = brightnessBars[index].querySelectorAll('.shade');
        const shadows = makeShades(textAreas[index].textContent, shades.length);
        shades.forEach((shade, shadeIndex) => {
            shade.style.backgroundColor = shadows[shadeIndex];
        });
        if (isColorTooDark(textAreas[index].textContent)) {
            currentBrightnessIndicators[index].classList.add('white');
        } else {
            currentBrightnessIndicators[index].classList.remove('white');
        }


    });
});

function removeBrightnessBarsIfClickedOutside() {
    const isClickOutsideBrightnessBar = !event.target.closest('.brightness-bar') && !event.target.closest('.brightness-button');

    if (isClickOutsideBrightnessBar) {

        brightnessBars.forEach((bar, index) => {

            const colorContainer = paletteColors[index];
            const elements = colorContainer.querySelectorAll('*');

            elements.forEach(element => {
                element.style.visibility = ''
                element.style.opacity = '';
            });

            bar.classList.remove('show');
        });
    }
}

document.addEventListener('click', function() {
    removeBrightnessBarsIfClickedOutside();
});

brightnessBars.forEach((brightnessBar, index) => {
    const shades = brightnessBar.querySelectorAll('.shade');

    shades.forEach((shade) => {
        shade.addEventListener('click', function() {
            const rgbShade = window.getComputedStyle(shade).backgroundColor;
            const rgbValues = rgbShade.match(/\d+/g);
            const r = parseInt(rgbValues[0], 10);
            const g = parseInt(rgbValues[1], 10);
            const b = parseInt(rgbValues[2], 10);


            const hexShade = rgbToHex(r, g, b).substring(1).toUpperCase();
            colorStacks[index].push('#' + hexShade);
            paletteColors[index].style.backgroundColor = '#' + hexShade;
            textAreas[index].textContent = hexShade;
            colorNames[index].textContent = getColorName(textAreas[index].textContent);
            updateUrlWithColors()

            changeIfDark(hexShade, index);

            const colorContainer = paletteColors[index];
            const elements = colorContainer.querySelectorAll('*');

            elements.forEach(element => {
                element.style.visibility = ''
                element.style.opacity = '';
            });

            brightnessBars.forEach(bar => {
                bar.classList.remove('show');
            });
        });
    });
});

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

function isValidHexColor(color) {
    if (typeof color !== 'string') {
        return false;
    }

    const cleanColor = color.startsWith('#') ? color.slice(1) : color;

    const hexColorRegex = /^[0-9A-F]{6}$/i;
    return hexColorRegex.test(cleanColor);
}

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

window.addEventListener('DOMContentLoaded', () => {
    const currentPath = localStorage.getItem("currentPath");

    if (currentPath) {
        setColorsFromUrl(currentPath);
        updateUrlWithColors();
        localStorage.removeItem('currentPath');
        console.log(currentPath);
    }
});

function setColorsFromUrl(path) {
    if (typeof path !== 'string') {
        console.error('Invalid path:', path);
        return;
    }
    const hash = path.startsWith('/') ? path.substring(1) : path;
    if (hash) {
        const colorArray = hash.split('-');
        colorArray.forEach((colorDiv, index) => {
            updatePaletteColors(colorArray.length);
            paletteColors.style.backgroundColor = '#' + colorArray[index];
            textAreas[index].textContent = colorArray[index];
            colorNames[index].textContent = getColorName(textAreas[index].textContent);
            changeIfDark(colorArray[index], index);
        });
    }
}


function getColorName(hexCode) {
    const n_match = ntc.name(hexCode);
    return n_match[1];
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return { r, g, b };
}

function rgbToHex(r, g, b) {
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function toHex(n) {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
}

function luminance(r, g, b) {
    const rgb = [r, g, b].map(function (x) {
        x /= 255;
        return (x <= 0.03928) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function isColorTooDark(hex) {
    const { r, g, b } = hexToRgb(hex);
    const colorLuminance = luminance(r, g, b);
    const threshold = 0.2;

    return colorLuminance < threshold;
}

function changeIfDark(hex, index) {
    const palette = paletteColors[index];
    const images = palette.querySelectorAll(".palette-tools img");
    const textarea = palette.querySelector(".palette-textarea");
    const colorname = palette.querySelector(".palette-color-name");
    if (isColorTooDark(hex)) {
        images.forEach(img => {
            img.classList.add("white");
        });
        textarea.classList.add("white");
        colorname.classList.add("white");
    } else {
        images.forEach(img => {
            img.classList.remove("white");
        });
        textarea.classList.remove("white");
        colorname.classList.remove("white");
    }
}

lockButtons.forEach((button, index) => {
    button.addEventListener("click", function () {
        unlocked[index] = !unlocked[index];

        const img = button.querySelector("img");

        if (unlocked[index]) {
            img.src = "images/unlocked.png";
            img.alt = "Unlock Icon";
        } else {
            img.src = "images/locked.png";
            img.alt = "Lock Icon";
        }
    });
});

undoButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        if (colorStacks[index].length > 1) {
            colorStacks[index].pop();
            const previousColor = colorStacks[index].slice(-1)[0];

            paletteColors[index].style.backgroundColor = previousColor;
            textAreas[index].textContent = previousColor.slice(1);
            colorNames[index].textContent = getColorName(textAreas[index].textContent);

            changeIfDark(previousColor, index);
            updateUrlWithColors()
        }
    });
});


function convertPastel(color) {
    const rgb = hexToRgb(color);
    return rgbToHex(
        Math.min(240, rgb.r + 80),
        Math.min(240, rgb.g + 80),
        Math.min(240, rgb.b + 80)
    );
}
function getRandomColor() {
    const r = Math.floor(Math.random() * 256); // Random red value (0-255)
    const g = Math.floor(Math.random() * 256); // Random green value (0-255)
    const b = Math.floor(Math.random() * 256); // Random blue value (0-255)

    const color = rgbToHex(r, g, b);
    if (colorMode.textContent === 'Pastel') {
        return convertPastel(color);
    } else if (colorMode.textContent === 'Default'){
        return color;
    }
}

function randomizeColors() {
    paletteColors.forEach((paletteColor, index) => {
        if (unlocked[index]) {
            const textarea = paletteColor.querySelector(".palette-textarea");
            const colorname = paletteColor.querySelector(".palette-color-name");

            const color = getRandomColor();
            paletteColor.style.backgroundColor = color;
            changeIfDark(color, index);
            textarea.textContent = color.replace('#', '');
            colorname.textContent = getColorName(color);
            colorStacks[index].push(color);

            updateUrlWithColors();
        }
    });
}



document.addEventListener('keydown', function (event) {
    if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        randomizeColors();
    }
});

generateButton.addEventListener("click", function() {
    randomizeColors();
});

copyButtons.forEach((button, index) => {
    button.addEventListener("click", function() {
        const color = textAreas[index].textContent.toUpperCase();

        navigator.clipboard.writeText(color)
            .then(() => {
                copyButtonTexts[index].classList.add('show');
                setTimeout(() => {
                    copyButtonTexts[index].classList.remove('show');
                }, 2000);
            })
            .catch(err => {
                console.error("Error copying text: ", err);
            });
    });
});

function updatePaletteColors(value) {
    for(let i = 0; i < value; i++) {
        if (palettes[i].classList.contains('hide')) {
            palettes[i].classList.remove("hide");
            colorStacks[i] = [colors[i]];
            paletteColors[i].style.backgroundColor = colors[i];
            textAreas[i].textContent = colors[i].replace("#", "");
            colorNames[i].textContent = getColorName(colors[i]);
            changeIfDark(colors[i], i);

            unlocked[i] = true;

            const img = lockButtons[i].querySelector("img");

            if (unlocked[i]) {
                img.src = "images/unlocked.png";
                img.alt = "Unlock Icon";
            }

        }
        paletteColors[i].style.borderTopRightRadius = '';
        paletteColors[i].style.borderBottomRightRadius = '';
    }

    for (let j = value; j < palettes.length; j++) {
        palettes[j].classList.add("hide");
    }
    paletteColors[value-1].style.borderTopRightRadius = '18px';
    paletteColors[value-1].style.borderBottomRightRadius = '18px';
    updateUrlWithColors()
}
const slider = document.querySelector(".slider");
const sliderValueDisplay = document.querySelector(".slider-number-of-colors");

slider.addEventListener("input", () => {
    removeBrightnessBarsIfClickedOutside();
    const value = slider.value;
    if (value === 1) {
        sliderValueDisplay.textContent = value + ' Color';
    } else {
        sliderValueDisplay.textContent = value + ' Colors';
    }
    updatePaletteColors(value)
});


document.querySelector(".palette-download-button").addEventListener("click", function() {
    const div = document.querySelector(".body-content-container");
    console.log("done")

    html2canvas(div).then(function(canvas) {
        const imageUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = imageUrl;

        let linkName = [];
        for(let i = 0; i < palettes.length; i++) {
            if (!palettes[i].classList.contains('hide')) {
                linkName.push(textAreas[i].textContent);
            }
        }
        linkName = linkName.join('-').toUpperCase();
        link.download = linkName;
        link.click();
    });
});

document.querySelector(".reset-button").addEventListener("click", function() {
    window.location.reload();
});

function getColors() {
    let colorsList = [];

    for(let i = 0; i < palettes.length; i++) {
        if (!palettes[i].classList.contains('hide')) {
            colorsList.push(textAreas[i].textContent);
        }
    }
    colorsList = colorsList.join("-").toUpperCase();
    return colorsList;
}
function updateUrlWithColors() {
    const colorString = getColors();
    const newUrl = `${window.location.origin}/${colorString}`;
    history.pushState(null, '', newUrl);
}