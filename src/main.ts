import "./style.css";

const APP_NAME = "Finally decided to start huh";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;
