import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const APP_NAME = "The Drawing board";
document.title = APP_NAME;

const appTitle = document.createElement("h1");
appTitle.innerText = APP_NAME;
app.appendChild(appTitle);

const canvas = document.createElement('canvas');
canvas.height = 256;
canvas.width = 256;
canvas.classList.add("canvas");
app.append(canvas);