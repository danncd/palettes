import "./styles/theme.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/palette.css";
import "./styles/controls.css";
import { startApp } from "./app/controller";

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApp, { once: true });
} else {
    startApp();
}
