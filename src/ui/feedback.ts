export function createFeedback(element: HTMLElement) {
    let timer: ReturnType<typeof setTimeout>;
    return (message: string) => {
        clearTimeout(timer);
        element.textContent = message;
        timer = setTimeout(() => {
            element.textContent = "";
        }, 3500);
    };
}
