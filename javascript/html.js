function createPalette(color) {
    const div = document.createElement("div");
    div.classList.add("palette");
    div.innerHTML = `
            <div class="palette-color">
                <div class="palette-tools">
                    <div class="palette-tools-buttons">
                        <button class="brightness-button"><img src="../images/brightness.png" alt="brightness"></button>
                        <div class="brightness-bar">
                            <div class="shade" data-shade="0"></div>
                            <div class="shade" data-shade="1"></div>
                            <div class="shade" data-shade="2"></div>
                            <div class="shade" data-shade="3"></div>
                            <div class="shade" data-shade="4"></div>
                            <div class="shade" data-shade="5"></div>
                            <div class="shade" data-shade="6"></div>
                            <div class="shade" data-shade="7"><p class="current-brightness">●</p></div>
                            <div class="shade" data-shade="8"></div>
                            <div class="shade" data-shade="9"></div>
                            <div class="shade" data-shade="10"></div>
                            <div class="shade" data-shade="11"></div>
                            <div class="shade" data-shade="12"></div>
                            <div class="shade" data-shade="13"></div>
                            <div class="shade" data-shade="14"></div>
                            </div>
                        <button class="undo-button"><img src="../images/go-back-arrow.png" alt="undo"></button>
                        <button class="lock-button"><img src="../images/unlocked.png" alt="lock"></button>
                        <button class="copy-button"><img src="../images/copy-icon.png" alt="copy"></button>
                    </div>
                    <div class="copy-button-text">
                            <h3>
                                Color Copied
                                
                            </h3>
                    </div>
                    <div class="palette-color-information">
                        <div class="palette-textarea" contenteditable="true">N/A</div>
                        <div class="palette-color-name">null</div>
                    </div>
                </div>
            </div>
        `;
    if (color) {
        div.style.backgroundColor = color;
    }
    return div;
}

const paletteContainer = document.getElementById("palette-content");
for (let i = 0; i < 6; i++) {
    paletteContainer.appendChild(createPalette());
}