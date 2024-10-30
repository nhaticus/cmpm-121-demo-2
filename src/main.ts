import "./style.css";

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

const app = document.querySelector<HTMLDivElement>("#app")!;

const APP_NAME = "The Drawing Board";
document.title = APP_NAME;

const _appTitle = createAppTitle(APP_NAME);

const canvas = createCanvas(256, 256, "canvas");
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d");

interface Command {
  points: Array<{ x: number; y: number }>;
  width: number;
  drag(point: { x: number; y: number }): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function createCommand(): Command {
  return {
    points: [],
    width: lineWidth,

    drag(point: { x: number; y: number }): void {
      this.points.push(point);
    },

    display(ctx: CanvasRenderingContext2D) {
      if (this.points.length === 0) return;
      ctx.lineWidth = this.width;
      ctx.beginPath();
      const { x, y } = this.points[0];
      ctx.moveTo(x, y);
      for (const { x, y } of this.points) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    },
  };
}

interface CursorCommand {
  x: number;
  y: number;
  draw(ctx: CanvasRenderingContext2D): void;
}

function createCursorcommand(x: number, y: number): CursorCommand {
  return {
    x,
    y,
    draw(ctx: CanvasRenderingContext2D) {
      ctx.font = `${lineWidth * 8}px monospace`;
      ctx.fillText(".", x - 2 * lineWidth, y + 0.5 * lineWidth);
    },
  };
}

const commands: Command[] = [];
const redoCommands: Command[] = [];
const bus = new EventTarget();

let currentCommand: Command | null = null;
let cursorCommand: CursorCommand | null = null;

let lineWidth = 1; //default thickness for strokes

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);

function eventTrigger(name: string) {
  bus.dispatchEvent(new Event(name));
}

function redraw() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);

  for (const command of commands) {
    command.display(ctx!);
  }

  if (cursorCommand) {
    cursorCommand.draw(ctx!);
  }
}
canvas.addEventListener("mouseout", (tmp) => {
  cursorCommand = createCursorcommand(tmp.offsetX, tmp.offsetY);
  eventTrigger("tool-moved");
});

canvas.addEventListener("mouseenter", (tmp) => {
  cursorCommand = createCursorcommand(tmp.offsetX, tmp.offsetY);
  eventTrigger("tool-moved");
});

canvas.addEventListener("mousedown", (tmp) => {
  currentCommand = createCommand();
  currentCommand.drag({ x: tmp.offsetX, y: tmp.offsetY });
  commands.push(currentCommand);
  redoCommands.length = 0;

  eventTrigger("drawing-changed");
});

canvas.addEventListener("mousemove", (tmp) => {
  cursorCommand = createCursorcommand(tmp.offsetX, tmp.offsetY);
  eventTrigger("tool-moved");

  if (tmp.buttons === 1 && currentCommand) {
    currentCommand.drag({ x: tmp.offsetX, y: tmp.offsetY });
    eventTrigger("drawing-changed");
  }
});

canvas.addEventListener("mouseup", () => {
  currentCommand = null;
  eventTrigger("drawing-changed");
});

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

app.append(document.createElement("br"));
const _clearButton = createButton("clear", clearHandler);
const _undoButton = createButton("undo", undoHandler);
const _redoButton = createButton("redo", redoHandler);

function clearHandler() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  commands.length = 0;
  eventTrigger("drawing-changed");
}

function undoHandler() {
  if (commands.length > 0) {
    redoCommands.push(commands.pop()!);
    eventTrigger("drawing-changed");
  }
}

function redoHandler() {
  if (redoCommands.length > 0) {
    const redoLine = redoCommands.pop();
    if (redoLine) {
      commands.push(redoLine);
    }
    eventTrigger("drawing-changed");
  }
}

app.append(document.createElement("br"));
const _thinBUtton = createButton("thin", thinToolHandler);
const _thickButton = createButton("thick", thickToolHandler);

function thinToolHandler() {
  lineWidth = 1;
  eventTrigger("tool-moved");
}

function thickToolHandler() {
  lineWidth = 4;
  eventTrigger("tool-moved");
}
