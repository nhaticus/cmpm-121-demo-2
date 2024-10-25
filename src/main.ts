import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app")!;

const APP_NAME = "The Drawing board";
document.title = APP_NAME;

const _appTitle = createAppTitle(APP_NAME);

const canvas = createCanvas(256, 256, "canvas");

const lines: Array<Array<{ x: number; y: number }>> = [];
const redoLines: Array<Array<{ x: number; y: number }>> = [];

const eventObserver = new Event("drawing-changed");

const ctx = canvas.getContext("2d");
const cursor = { isPressed: false, x: 0, y: 0 };

canvas.addEventListener("drawing-changed", () => {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  for (const line of lines) {
    if (line.length > 1) {
      ctx?.beginPath();
      ctx?.moveTo(line[0].x, line[0].y);
      for (const point of line) {
        ctx?.lineTo(point.x, point.y);
      }
      ctx?.stroke();
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
const _clearButton = createButton("clear", clearHandler);
const _undoButton = createButton("undo", undoHandler);
const _redoButton = createButton("redo", redoHandler);

function clearHandler() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  lines.length = 0;
}

function undoHandler() {
  if (lines.length > 0) {
    const lastLine = lines.pop();
    if (lastLine) {
      redoLines.push(lastLine);
    }
    canvas.dispatchEvent(eventObserver);
  }
}

function redoHandler() {
  if (redoLines.length > 0) {
    const redoLine = redoLines.pop();
    if (redoLine) {
      lines.push(redoLine);
    }
    canvas.dispatchEvent(eventObserver);
  }
}

function createAppTitle(title: string): HTMLElement {
  const tmpTitle = document.createElement("h1");
  tmpTitle.innerHTML = title;
  app.appendChild(tmpTitle);
  return tmpTitle;
}

function createCanvas(
  width: number,
  height: number,
  className: string
): HTMLCanvasElement {
  const tmpCanvas = document.createElement("canvas");
  tmpCanvas.width = width;
  tmpCanvas.height = height;
  tmpCanvas.classList.add(className);
  app.appendChild(tmpCanvas);
  return tmpCanvas;
}

function createButton(
  buttonText: string,
  eventHandler: () => void
): HTMLButtonElement {
  const tmpButton = document.createElement("button");
  tmpButton.innerHTML = buttonText;
  tmpButton.addEventListener("click", eventHandler);
  app.appendChild(tmpButton);
  return tmpButton;
}
