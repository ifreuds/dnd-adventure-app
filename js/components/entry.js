import { renderWorldWizard } from "./worldWizard.js";
import { renderGameUI } from "./gameUI.js";

export function renderEntry(container) {
  container.innerHTML = `
    <div style="text-align:center; margin-top:20%;">
      <h1>DnD Adventure</h1>
      <button id="newWorldBtn">New World</button>
      <button id="loadWorldBtn">Load World</button>
    </div>
  `;

  document.getElementById("newWorldBtn").addEventListener("click", () => {
    // Clear all wizard data for fresh start
    clearWizardData();
    renderWorldWizard(container);
  });

  function clearWizardData() {
    // Clear chat histories
    localStorage.removeItem('wizard_chat_step0');
    localStorage.removeItem('wizard_chat_step1');
    localStorage.removeItem('wizard_chat_step2');
    localStorage.removeItem('wizard_chat_step3');

    // Clear living files
    localStorage.removeItem('wizard_livingFile_step0');
    localStorage.removeItem('wizard_livingFile_step1');
    localStorage.removeItem('wizard_livingFile_step2');
    localStorage.removeItem('wizard_livingFile_step3');

    // Note: We keep guidelines (wizard_guideline_stepX) since those are user customizations
  }

  document.getElementById("loadWorldBtn").addEventListener("click", () => {
    openLoadWorldModal();
  });

  function openLoadWorldModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    // Load saved worlds from localStorage
    const savedWorldsIds = JSON.parse(localStorage.getItem('saved_worlds_list') || '[]');
    const savedWorlds = savedWorldsIds.map(id => {
      const worldData = JSON.parse(localStorage.getItem(id) || '{}');
      return worldData;
    }).filter(w => w.id); // Filter out any invalid entries

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Load World</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div id="worldsList">
            ${savedWorlds.length === 0
              ? '<div class="gallery-empty">No saved worlds found. Start a new adventure!</div>'
              : `<div class="worlds-list">
                  ${savedWorlds.map(world => `
                    <div class="world-item" data-id="${world.id}">
                      <div style="flex: 1;">
                        <h3 style="margin: 0 0 8px 0; font-size: 1.1em;">${world.worldName}</h3>
                        <p style="margin: 0; font-size: 0.85em; color: #a9a9a9;">
                          Level: ${world.playerLevel} | Turns: ${world.turnCount}
                        </p>
                        <p style="margin: 4px 0 0 0; font-size: 0.8em; color: #777;">
                          Last played: ${new Date(world.lastPlayed).toLocaleString()}
                        </p>
                      </div>
                      <button class="load-world-btn" data-id="${world.id}">Load</button>
                    </div>
                  `).join('')}
                </div>`
            }
          </div>
        </div>
        <div class="modal-footer">
          <button id="closeLoadBtn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close-btn");
    const closeLoadBtn = modal.querySelector("#closeLoadBtn");

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    closeLoadBtn.addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Load world buttons
    modal.querySelectorAll(".load-world-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const worldId = btn.getAttribute("data-id");
        const world = savedWorlds.find(w => w.id == worldId);

        if (!world) {
          alert("Error loading world data.");
          return;
        }

        modal.remove();

        // Navigate to game UI with loaded world data
        renderGameUI(container, world);
      });
    });
  }
}
