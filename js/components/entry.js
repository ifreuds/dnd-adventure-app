import { renderWorldWizard } from "./worldWizard.js";

export function renderEntry(container) {
  container.innerHTML = `
    <div style="text-align:center; margin-top:20%;">
      <h1>DnD Adventure</h1>
      <button id="newWorldBtn">New World</button>
      <button id="loadWorldBtn">Load World</button>
    </div>
  `;

  document.getElementById("newWorldBtn").addEventListener("click", () => {
    renderWorldWizard(container);
  });

  document.getElementById("loadWorldBtn").addEventListener("click", () => {
    alert("Load World flow will go here.");
  });
}
