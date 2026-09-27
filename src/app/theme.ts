import { updateIcon } from "./icons";

export function bindThemeToggle(button: HTMLButtonElement) {
    const root = document.documentElement;
    const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
    let preference: string | null = null;
    try {
        preference = window.localStorage.getItem("palettes-theme");
    } catch {
        // The toggle still works when storage is unavailable.
    }
    if (preference === "light" || preference === "dark") {
        root.dataset.theme = preference;
    }

    function isDark() {
        return root.dataset.theme ? root.dataset.theme === "dark" : (systemTheme?.matches ?? false);
    }

    function render() {
        const label = isDark() ? "Switch to light mode" : "Switch to dark mode";
        button.setAttribute("aria-label", label);
        button.title = label;
        updateIcon(button, isDark() ? "sun" : "moon");
    }

    button.addEventListener("click", () => {
        root.dataset.theme = isDark() ? "light" : "dark";
        try {
            window.localStorage.setItem("palettes-theme", root.dataset.theme);
        } catch {
            // Keep the choice for this page even if it cannot be saved.
        }
        render();
    });
    systemTheme?.addEventListener("change", render);
    render();
}
