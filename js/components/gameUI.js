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
              <hr style="border-color: #333; margin: 10px 0;">
              <p style="font-size: 0.9em; color: #a9a9a9;"><strong>Skills & Abilities</strong></p>
              <div id="skillsList" style="font-size: 0.85em;">
                <div style="margin-bottom: 6px;">
                  <span style="color: #4CAF50;">⚡</span> Quick Strike (3/3)
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="color: #2196F3;">🛡️</span> Defensive Stance (1/1)
                </div>
                <div style="margin-bottom: 6px;">
                  <span style="color: #FFA500;">🔥</span> Power Attack (2/2)
                </div>
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
            <div id="diceResult" style="margin-top: 10px; text-align: center; font-size: 1.5em; color: #4CAF50; transition: transform 0.2s ease;">
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
  let savedImages = []; // Store generated images for gallery

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

    el.rollDiceBtn.disabled = true;

    // Animate dice roll with number cycling
    const finalRoll = Math.floor(Math.random() * 20) + 1;
    let cycles = 0;
    const maxCycles = 15;

    const interval = setInterval(() => {
      const randomNum = Math.floor(Math.random() * 20) + 1;
      el.diceResult.textContent = `🎲 ${randomNum}`;
      el.diceResult.style.color = "#FFA500";
      el.diceResult.style.transform = "scale(1.2)";

      cycles++;
      if (cycles >= maxCycles) {
        clearInterval(interval);

        // Show final result with animation
        el.diceResult.textContent = `🎲 ${finalRoll}`;
        el.diceResult.style.color = finalRoll >= 15 ? "#4CAF50" : finalRoll >= 10 ? "#FFA500" : "#F44336";
        el.diceResult.style.transform = "scale(1.5)";

        setTimeout(() => {
          el.diceResult.style.transform = "scale(1)";
        }, 200);

        diceActive = false;

        // Placeholder outcome
        setTimeout(() => {
          addNarration(`You rolled a ${finalRoll}! ${finalRoll >= 13 ? "Success! The path ahead clears." : "The mist thickens, but you press on."}`);
          renderChoices(["Continue forward", "Turn back", "Rest here"]);
        }, 800);
      }
    }, 80);
  });

  el.modeToggleBtn.addEventListener("click", () => {
    alert("Romance mode is not yet implemented. This feature will be added in a future update.");
  });

  el.settingsBtn.addEventListener("click", () => {
    alert("Settings: Return to Wizard (placeholder)");
    // Later: import("./worldWizard.js").then(({ renderWorldWizard }) => renderWorldWizard(container));
  });

  el.imageGenBtn.addEventListener("click", () => {
    openImageGenModal();
  });

  el.galleryBtn.addEventListener("click", () => {
    openGalleryModal();
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

  // Modal Functions
  function openImageGenModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Generate Image</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="muted" style="margin-bottom: 12px;">Describe the scene you want to visualize:</p>
          <textarea
            id="imagePrompt"
            class="image-prompt-input"
            placeholder="Example: A dark forest at twilight with twisted trees and glowing eyes in the shadows..."
          ></textarea>
          <div id="imageContainer"></div>
        </div>
        <div class="modal-footer">
          <button id="generateBtn">Generate Image</button>
          <button id="saveImageBtn" style="display: none;">Save to Gallery</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close-btn");
    const generateBtn = modal.querySelector("#generateBtn");
    const saveImageBtn = modal.querySelector("#saveImageBtn");
    const imagePrompt = modal.querySelector("#imagePrompt");
    const imageContainer = modal.querySelector("#imageContainer");

    let currentImageUrl = null;

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Generate image (placeholder)
    generateBtn.addEventListener("click", () => {
      const prompt = imagePrompt.value.trim();
      if (!prompt) {
        alert("Please enter a description for the image.");
        return;
      }

      // Show loading state
      imageContainer.innerHTML = '<div class="image-loading">Generating image... (placeholder)</div>';
      generateBtn.disabled = true;

      // Simulate API call (placeholder - will connect to imageService.js later)
      setTimeout(() => {
        // Use placeholder image service (placeholder.com)
        currentImageUrl = `https://via.placeholder.com/512x512/1a1a1a/4CAF50?text=Generated+Image`;

        imageContainer.innerHTML = `
          <div class="generated-image-container">
            <img src="${currentImageUrl}" alt="Generated image" class="generated-image" />
            <p class="muted" style="margin-top: 10px; font-size: 0.85em;">Prompt: ${prompt}</p>
          </div>
        `;

        generateBtn.disabled = false;
        saveImageBtn.style.display = "inline-block";
      }, 2000);
    });

    // Save to gallery
    saveImageBtn.addEventListener("click", () => {
      if (currentImageUrl) {
        savedImages.push({
          url: currentImageUrl,
          prompt: imagePrompt.value.trim(),
          timestamp: new Date().toISOString()
        });
        alert("Image saved to gallery!");
        saveImageBtn.disabled = true;
        saveImageBtn.textContent = "Saved ✓";
      }
    });
  }

  function openGalleryModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Image Gallery</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div id="galleryGrid"></div>
        </div>
        <div class="modal-footer">
          <button id="closeGalleryBtn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close-btn");
    const closeGalleryBtn = modal.querySelector("#closeGalleryBtn");
    const galleryGrid = modal.querySelector("#galleryGrid");

    // Render gallery
    if (savedImages.length === 0) {
      galleryGrid.innerHTML = '<div class="gallery-empty">No images saved yet. Generate and save some images to see them here!</div>';
    } else {
      galleryGrid.className = "gallery-grid";
      galleryGrid.innerHTML = savedImages.map((img, idx) => `
        <div class="gallery-item" data-idx="${idx}">
          <img src="${img.url}" alt="${img.prompt}" />
        </div>
      `).join("");

      // Click to view full image
      galleryGrid.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", () => {
          const idx = parseInt(item.getAttribute("data-idx"));
          const image = savedImages[idx];
          alert(`Image: ${image.prompt}\nSaved: ${new Date(image.timestamp).toLocaleString()}`);
          // Later: could open a full-size preview modal
        });
      });
    }

    // Close modal
    closeBtn.addEventListener("click", () => {
      modal.remove();
    });

    closeGalleryBtn.addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }
}
