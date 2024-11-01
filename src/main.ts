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

createAppTitle(APP_NAME);

const canvas = createCanvas(256, 256, "canvas");
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d");
createButton("export", scaledCanvasExport);

interface Command {
  points: Array<{ x: number; y: number }>;
  width?: number;
  emoji?: string;
  drag(point: { x: number; y: number }): void;
  display(ctx: CanvasRenderingContext2D): void;
}

function createCommand(): Command {
  if (activeTool.type === "line") {
    return {
      points: [],
      width: activeTool.width,

      drag(point: { x: number; y: number }): void {
        this.points.push(point);
      },

      display(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0) return;
        ctx.lineWidth = this.width!;
        ctx.beginPath();
        const { x, y } = this.points[0];
        ctx.moveTo(x, y);
        for (const { x, y } of this.points) {
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      },
    };
  } else if (activeTool.type === "emoji") {
    return {
      points: [],
      emoji: activeTool.emoji,

      drag(point: { x: number; y: number }): void {
        this.points.push(point);
      },
      display(ctx: CanvasRenderingContext2D) {
        if (this.points.length === 0 || !this.emoji) return;
        for (const { x, y } of this.points) {
          ctx.font = "24px monospace";
          ctx.fillText(this.emoji, x, y);
        }
      },
    };
  }
  return {
    points: [],
    drag: () => {},
    display: () => {},
  };
}

interface CursorCommand {
  x: number;
  y: number;
  width?: number;
  emoji?: string;
  draw(ctx: CanvasRenderingContext2D): void;
}

function createCursorcommand(x: number, y: number): CursorCommand {
  if (activeTool.type === "line") {
    return {
      x,
      y,
      width: activeTool.width,
      draw(ctx: CanvasRenderingContext2D) {
        ctx.font = `${this.width! * 8}px monospace`;
        ctx.fillText(".", x - 2 * this.width!, y + 0.5 * this.width!);
      },
    };
  } else if (activeTool.type === "emoji") {
    return {
      x,
      y,
      emoji: activeTool.emoji,
      draw(ctx: CanvasRenderingContext2D) {
        ctx.font = "24px monospace";
        ctx.fillText(this.emoji!, x, y);
      },
    };
  }
  return {
    x,
    y,
    draw: () => {},
  };
}

const commands: Command[] = [];
const redoCommands: Command[] = [];
const bus = new EventTarget();

let currentCommand: Command | null = null;
let cursorCommand: CursorCommand | null = null;

let activeTool:
  | { name: string; type: "line"; width: number }
  | { name: string; type: "emoji"; emoji: string } = {
  name: "thin",
  type: "line",
  width: 4,
};

const currentTool = document.createElement("div");
currentTool.innerHTML = "Active Tool: " + activeTool.name;
app.appendChild(currentTool);

bus.addEventListener("drawing-changed", redraw);
bus.addEventListener("tool-moved", redraw);

function eventTrigger(name: string) {
  bus.dispatchEvent(new Event(name));
}

function redraw() {
  ctx?.clearRect(0, 0, canvas.width, canvas.height);
  currentTool.innerHTML = "Active Tool: " + activeTool.name;

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
  if (tmp.buttons === 1 && currentCommand) {
    currentCommand.drag({ x: tmp.offsetX, y: tmp.offsetY });
    eventTrigger("drawing-changed");
  } else {
    cursorCommand = createCursorcommand(tmp.offsetX, tmp.offsetY);
    eventTrigger("tool-moved");
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
createButton("clear", clearHandler);
createButton("undo", undoHandler);
createButton("redo", redoHandler);

function thinToolHandler() {
  activeTool = { name: "thin", type: "line", width: 4 };
  eventTrigger("tool-moved");
}

function thickToolHandler() {
  activeTool = { name: "thick", type: "line", width: 10 };
  eventTrigger("tool-moved");
}

app.append(document.createElement("br"));
createButton("thin", thinToolHandler);
createButton("thick", thickToolHandler);

function createEmojiButton(emoji: string) {
  return createButton(emoji, () => {
    activeTool = { name: emoji, type: "emoji", emoji: emoji };
    eventTrigger("tool-moved");
  });
}

app.append(document.createElement("br"));
createEmojiButton("😎");
createEmojiButton("❤️");
createEmojiButton("💦");

app.append(document.createElement("br"));
createButton("Custom Stickers", customStickerHandler);

function customStickerHandler() {
  const text = prompt("Input a custom emoji below", "");
  if (text && text.trim() !== "") {
    createEmojiButton(text);
  } else {
    alert("Error: empty string.");
  }
}

function scaledCanvasExport() {
  const scaledCanvas = document.createElement("canvas");
  scaledCanvas.width = canvas.width * 4;
  scaledCanvas.height = canvas.height * 4;
  const scaledCtx = scaledCanvas.getContext("2d");

  if (scaledCtx) {
    scaledCtx.scale(4, 4);

    for (const command of commands) {
      command.display(scaledCtx);
    }

    const anchor = document.createElement("a");
    anchor.href = scaledCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();

  }
}

