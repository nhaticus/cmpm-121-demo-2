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
app.appendChild(canvas);

const context = canvas.getContext("2d");
const cursor = { isPressed: false, x: 0, y:0 };
canvas.addEventListener("mousedown", (tmp) => {
    cursor.isPressed = true;
    cursor.x = tmp.offsetX;
    cursor.y = tmp.offsetY;
})

canvas.addEventListener("mousemove", (tmp) => {
    if (cursor.isPressed) {
        context?.beginPath();
        context?.moveTo(cursor.x, cursor.y);
        context?.lineTo(tmp.offsetX, tmp.offsetY)
        context?.stroke();

        cursor.x = tmp.offsetX;
        cursor.y = tmp.offsetY;
    }
})

canvas.addEventListener("mouseup", () => {
    cursor.isPressed = false;
})