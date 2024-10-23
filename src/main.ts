import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const APP_NAME = "The Drawing board";
document.title = APP_NAME;

const appTitle = document.createElement("h1");
appTitle.innerText = APP_NAME;
app.appendChild(appTitle);

const canvas = document.createElement("canvas");
canvas.height = 256;
canvas.width = 256;
canvas.classList.add("canvas");
app.appendChild(canvas);

const lines: Array<Array<{ x: number; y: number }>> = [];
const redoLines: Array<Array<{ x: number; y: number }>> = [];

const eventObserver = new Event("drawing-changed");

const context = canvas.getContext("2d");
const cursor = { isPressed: false, x: 0, y: 0 };

canvas.addEventListener("drawing-changed", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);

  for (const line of lines) {
    if (line.length > 1) {
      context?.beginPath();
      context?.moveTo(line[0].x, line[0].y);
      for (const point of line) {
        context?.lineTo(point.x, point.y);
      }
      context?.stroke();
    }
  }
});

canvas.addEventListener("mousedown", (tmp) => {
  cursor.isPressed = true;
  cursor.x = tmp.offsetX;
  cursor.y = tmp.offsetY;

  lines.push([{ x: cursor.x, y: cursor.y }]);

  redoLines.length = 0;
});

canvas.addEventListener("mousemove", (tmp) => {
  if (cursor.isPressed) {
    lines[lines.length - 1].push({ x: tmp.offsetX, y: tmp.offsetY });

    canvas.dispatchEvent(eventObserver);

    cursor.x = tmp.offsetX;
    cursor.y = tmp.offsetY;
  }
});

canvas.addEventListener("mouseup", () => {
  cursor.isPressed = false;
});

app.append(document.createElement("br"));

const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.appendChild(clearButton);

clearButton.addEventListener("click", () => {
  context?.clearRect(0, 0, canvas.width, canvas.height);
  lines.length = 0;
});

const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.appendChild(undoButton);

undoButton.addEventListener("click", () => {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    if (lastLine) {
        redoLines.push(lastLine);
    }
    canvas.dispatchEvent(eventObserver);
  }
});

const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.appendChild(redoButton);

redoButton.addEventListener("click", () => {
    if (redoLines.length > 0) {
        const redoLine = redoLines.pop();
        if (redoLine) {
            lines.push(redoLine);
        }
        canvas.dispatchEvent(eventObserver);
    }
});
