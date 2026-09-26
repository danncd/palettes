import {
    createElement,
    SwatchBook,
    Shuffle,
    Minus,
    Plus,
    Undo2,
    Download,
    LockKeyhole,
    LockKeyholeOpen,
    X,
    Copy,
    RotateCcw,
} from "lucide";

const icons = {
    "swatch-book": SwatchBook,
    shuffle: Shuffle,
    minus: Minus,
    plus: Plus,
    "undo-2": Undo2,
    download: Download,
    "lock-keyhole": LockKeyhole,
    "lock-keyhole-open": LockKeyholeOpen,
    x: X,
    copy: Copy,
    "rotate-ccw": RotateCcw,
};
export type IconName = keyof typeof icons;

export function icon(name: IconName) {
    const [tag, attributes, children] = icons[name];
    return createElement([
        tag,
        { ...attributes, width: "16", height: "16", "stroke-width": "1.8", "aria-hidden": "true" },
        children,
    ]);
}

export function updateIcon(button: HTMLElement, name: IconName) {
    if (button.dataset.icon === name) return;
    button.replaceChildren(icon(name));
    button.dataset.icon = name;
}
