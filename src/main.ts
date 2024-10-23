import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const APP_NAME = "The Drawing board";
document.title = APP_NAME;

const APP_TITTLE = document.createElement("h1");
APP_TITTLE.innerText = APP_NAME;
app.appendChild(APP_TITTLE);

const canvas = document.createElement('canvas');
canvas.height = 256, canvas.width = 256;
canvas.classList.add("canvas");
app.append(canvas);