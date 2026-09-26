export function bindShortcuts(generate: () => void, close: () => void) {
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            close();
            return;
        }
        if (
            event.code !== "Space" ||
            event.repeat ||
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
                'input, textarea, select, button:not([data-action="edit"]):not([data-action="shade"]), a, summary, [contenteditable]:not([contenteditable="false"])',
            )
        )
            return;
        event.preventDefault();
        generate();
    });
}
