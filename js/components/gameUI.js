export function renderGameUI(container, worldData = {}) {
  container.innerHTML = `
    <div class="game-layout">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-left">
          <h2 style="margin: 0; font-size: 1.2em;">DnD Adventure</h2>
        </div>
        <div class="top-bar-right">
          <button id="settingsBtn">Settings</button>
          <button id="modeToggleBtn">Mode: Normal</button>
          <button id="imageGenBtn">Generate Image</button>
          <button id="galleryBtn">Gallery</button>
          <button id="menuBtn">Menu</button>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="game-main">
        <!-- Center: Chat/Narration -->
        <div class="chat-area">
          <div id="chatMessages" class="chat-messages">
            <!-- Narration will appear here -->
          </div>

          <div class="choice-area">
            <h3>What do you do?</h3>
            <div id="choiceButtons" class="choice-buttons">
              <!-- AI-generated choice buttons will appear here -->
            </div>
            <div class="free-input">
              <input
                type="text"
                id="freeTextInput"
                placeholder="Or type your own action..."
                style="width: 100%; padding: 10px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;"
              />
              <button id="submitActionBtn" style="margin-top: 8px; width: 100%;">Submit</button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar: Character Info & Dice -->
        <div class="right-sidebar">
          <!-- Character Info -->
          <div class="character-panel">
            <h3>Character</h3>
            <div id="characterInfo">
              <p><strong>Name:</strong> <span id="charName">Hero</span></p>
              <p><strong>Class:</strong> <span id="charClass">Adventurer</span></p>
              <p><strong>HP:</strong> <span id="charHP">20/20</span></p>
              <hr style="border-color: #333; margin: 10px 0;">
              <p style="font-size: 0.9em; color: #a9a9a9;"><strong>Stats</strong></p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.85em;">
                <div>STR: <span id="statSTR">10</span></div>
                <div>DEX: <span id="statDEX">10</span></div>
                <div>CON: <span id="statCON">10</span></div>
                <div>INT: <span id="statINT">10</span></div>
                <div>WIS: <span id="statWIS">10</span></div>
                <div>CHA: <span id="statCHA">10</span></div>
              </div>
            </div>
          </div>

          <!-- Dice Panel -->
          <div class="dice-panel">
            <h3>Dice Roll</h3>
            <p class="muted" style="font-size: 0.85em;">The AI will signal when a roll is needed.</p>
            <button id="rollDiceBtn" style="width: 100%; padding: 12px; font-size: 1.1em;" disabled>
              Roll d20
            </button>
            <div id="diceResult" style="margin-top: 10px; text-align: center; font-size: 1.5em; color: #4CAF50;">
              <!-- Dice result will appear here -->
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Element references
  const el = {
    chatMessages: container.querySelector("#chatMessages"),
    choiceButtons: container.querySelector("#choiceButtons"),
    freeTextInput: container.querySelector("#freeTextInput"),
    submitActionBtn: container.querySelector("#submitActionBtn"),
    rollDiceBtn: container.querySelector("#rollDiceBtn"),
    diceResult: container.querySelector("#diceResult"),
    settingsBtn: container.querySelector("#settingsBtn"),
    modeToggleBtn: container.querySelector("#modeToggleBtn"),
    imageGenBtn: container.querySelector("#imageGenBtn"),
    galleryBtn: container.querySelector("#galleryBtn"),
    menuBtn: container.querySelector("#menuBtn"),
    charName: container.querySelector("#charName"),
    charClass: container.querySelector("#charClass"),
    charHP: container.querySelector("#charHP"),
  };

  // Placeholder data
  let currentMode = "Normal";
  let diceActive = false;

  // Initialize with placeholder narration
  addNarration("You stand at the entrance of a dark forest. The trees loom overhead, their branches twisted like grasping hands. A faint mist swirls around your feet, and you hear distant whispers on the wind.");

  // Placeholder choices
  const placeholderChoices = [
    "Enter the forest cautiously",
    "Search the area for clues",
    "Call out to see if anyone responds"
  ];
  renderChoices(placeholderChoices);

  // Functions
  function addNarration(text) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "narration-message";
    messageDiv.textContent = text;
    el.chatMessages.appendChild(messageDiv);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
  }

  function renderChoices(choices) {
    el.choiceButtons.innerHTML = choices.map((choice, idx) =>
      `<button class="choice-btn" data-choice="${idx}">${choice}</button>`
    ).join("");

    // Attach listeners
    el.choiceButtons.querySelectorAll(".choice-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const choiceText = btn.textContent;
        handlePlayerAction(choiceText);
      });
    });
  }

  function handlePlayerAction(action) {
    // Add player action to chat
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-message";
    playerDiv.textContent = `> ${action}`;
    el.chatMessages.appendChild(playerDiv);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

    // Clear input
    el.freeTextInput.value = "";

    // Placeholder response (will be replaced with GPT API call)
    setTimeout(() => {
      addNarration("You take a step forward. The forest seems to respond to your presence, and the mist grows thicker. What happens next depends on fate...");

      // Simulate enabling dice roll
      diceActive = true;
      el.rollDiceBtn.disabled = false;
      el.diceResult.textContent = "Roll needed!";
      el.diceResult.style.color = "#FFA500";
    }, 500);
  }

  // Event Listeners
  el.submitActionBtn.addEventListener("click", () => {
    const action = el.freeTextInput.value.trim();
    if (action) {
      handlePlayerAction(action);
    }
  });

  el.freeTextInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const action = el.freeTextInput.value.trim();
      if (action) {
        handlePlayerAction(action);
      }
    }
  });

  el.rollDiceBtn.addEventListener("click", () => {
    if (!diceActive) return;

    const roll = Math.floor(Math.random() * 20) + 1;
    el.diceResult.textContent = `<² ${roll}`;
    el.diceResult.style.color = roll >= 15 ? "#4CAF50" : roll >= 10 ? "#FFA500" : "#F44336";

    el.rollDiceBtn.disabled = true;
    diceActive = false;

    // Placeholder outcome
    setTimeout(() => {
      addNarration(`You rolled a ${roll}! ${roll >= 13 ? "Success! The path ahead clears." : "The mist thickens, but you press on."}`);
      renderChoices(["Continue forward", "Turn back", "Rest here"]);
    }, 1000);
  });

  el.modeToggleBtn.addEventListener("click", () => {
    currentMode = currentMode === "Normal" ? "Romance" : "Normal";
    el.modeToggleBtn.textContent = `Mode: ${currentMode}`;
    el.modeToggleBtn.style.backgroundColor = currentMode === "Romance" ? "#8B0000" : "#1e1e1e";
  });

  el.settingsBtn.addEventListener("click", () => {
    alert("Settings: Return to Wizard (placeholder)");
    // Later: import("./worldWizard.js").then(({ renderWorldWizard }) => renderWorldWizard(container));
  });

  el.imageGenBtn.addEventListener("click", () => {
    alert("Image Generation (placeholder)");
  });

  el.galleryBtn.addEventListener("click", () => {
    alert("Gallery (placeholder)");
  });

  el.menuBtn.addEventListener("click", () => {
    alert("Return to Menu (placeholder)");
    // Later: import("./entry.js").then(({ renderEntry }) => renderEntry(container));
  });

  // Populate character info if worldData provided
  if (worldData.characterName) {
    el.charName.textContent = worldData.characterName;
  }
  if (worldData.characterConcept) {
    el.charClass.textContent = worldData.characterConcept;
  }
}
