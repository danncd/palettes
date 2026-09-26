export function bindShortcuts(generate: () => void, close: () => void) {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            close();
            return;
        }
        if (
            event.code !== "Space" ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        )
            return;
        const target = event.target;
        if (
            target instanceof Element &&
            target.closest(
                'input, textarea, select, a, [contenteditable]:not([contenteditable="false"])',
            )
        )
            return;
        event.preventDefault();
        if (event.repeat) return;
        generate();
    });
}
