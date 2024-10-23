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

const strokes: Array<Array<{ x: number, y: number }>> = [];
const eventObserver = new Event("drawing-changed");

canvas.addEventListener("drawing-changed", () => {
    context?.clearRect(0, 0, canvas.width, canvas.height);

    for ( const stroke of strokes) {
        if (stroke.length > 1) {
            context?.beginPath();
            context?.moveTo(stroke[0].x, stroke[0].y);
            for ( const point of stroke) {
                context?.lineTo(point.x, point.y);
            }
            context?.stroke();
        }
    }
})


const context = canvas.getContext("2d");
const cursor = { isPressed: false, x: 0, y:0 };


canvas.addEventListener("mousedown", (tmp) => {
    cursor.isPressed = true;
    cursor.x = tmp.offsetX;
    cursor.y = tmp.offsetY;

    strokes.push([{ x: cursor.x, y: cursor.y}]);
})

canvas.addEventListener("mousemove", (tmp) => {
    if (cursor.isPressed) {
        strokes[strokes.length - 1].push({ x: tmp.offsetX, y: tmp.offsetY});

        canvas.dispatchEvent(eventObserver);

        cursor.x = tmp.offsetX;
        cursor.y = tmp.offsetY;
    }
})

canvas.addEventListener("mouseup", () => {
    cursor.isPressed = false;
})

const clearButton = document.createElement("button");
clearButton.innerHTML= "clear";
app.appendChild(clearButton);
clearButton.addEventListener("click", () => {
    context?.clearRect(0, 0, canvas.width, canvas.height);
    strokes.length = 0;
})