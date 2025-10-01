import { renderEntry } from "./components/entry.js";

export function initApp() {
  const appDiv = document.getElementById("app");
  appDiv.innerHTML = ""; 
  renderEntry(appDiv);
}

initApp();
