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
    renderWorldWizard(container);
  });

  document.getElementById("loadWorldBtn").addEventListener("click", () => {
    openLoadWorldModal();
  });

  function openLoadWorldModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    // Placeholder saved worlds (will fetch from Supabase later)
    const savedWorlds = [
      {
        id: 1,
        name: "Dark Forest Adventure",
        characterName: "Kael",
        lastPlayed: "2025-10-01T10:30:00",
        turnCount: 15
      },
      {
        id: 2,
        name: "Cosmic Horror Quest",
        characterName: "Elara",
        lastPlayed: "2025-09-28T14:20:00",
        turnCount: 42
      }
    ];

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
                        <h3 style="margin: 0 0 8px 0; font-size: 1.1em;">${world.name}</h3>
                        <p style="margin: 0; font-size: 0.85em; color: #a9a9a9;">
                          Character: ${world.characterName} | Turns: ${world.turnCount}
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

        // Placeholder: Load world data (will fetch from Supabase later)
        modal.remove();

        // Navigate to game UI with loaded world data
        const worldData = {
          characterName: world.characterName,
          characterConcept: "Loaded Character",
          worldName: world.name
        };

        renderGameUI(container, worldData);
      });
    });
  }
}
