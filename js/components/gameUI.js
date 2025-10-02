import { generateNarration as generateGptNarration } from "../services/gpt.js";
import { generateNarration as generateGrokNarration } from "../services/grok.js";

export function renderGameUI(container, worldData = {}) {
  container.innerHTML = `
    <div class="game-layout">
      <!-- Top Bar -->
      <div class="top-bar">
        <div class="top-bar-left">
          <h2 style="margin: 0; font-size: 1.2em;">DnD Adventure</h2>
        </div>
        <div class="top-bar-right">
          <button id="saveBtn">Save</button>
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
            <div id="diceInfo" style="margin-bottom: 10px; padding: 8px; background: #1a1a1a; border-radius: 4px; border: 1px solid #333; display: none;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                <span id="diceIcon" style="font-size: 1.2em;">⚠️</span>
                <span id="diceCheckType" style="font-size: 0.9em; color: #FFA500; font-weight: bold;">Check Required</span>
              </div>
              <div id="diceContext" style="font-size: 0.8em; color: #a9a9a9; line-height: 1.4;">
                <!-- Context appears here -->
              </div>
              <div style="margin-top: 6px; font-size: 0.85em; color: #4CAF50;">
                <strong>DC:</strong> <span id="diceDC">--</span>
              </div>
            </div>
            <button id="rollDiceBtn" style="width: 100%; padding: 12px; font-size: 1.1em; transition: all 0.3s ease;" disabled>
              🎲 Roll d20
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
    diceInfo: container.querySelector("#diceInfo"),
    diceIcon: container.querySelector("#diceIcon"),
    diceCheckType: container.querySelector("#diceCheckType"),
    diceContext: container.querySelector("#diceContext"),
    diceDC: container.querySelector("#diceDC"),
    saveBtn: container.querySelector("#saveBtn"),
    settingsBtn: container.querySelector("#settingsBtn"),
    modeToggleBtn: container.querySelector("#modeToggleBtn"),
    imageGenBtn: container.querySelector("#imageGenBtn"),
    galleryBtn: container.querySelector("#galleryBtn"),
    menuBtn: container.querySelector("#menuBtn"),
    charName: container.querySelector("#charName"),
    charClass: container.querySelector("#charClass"),
    charHP: container.querySelector("#charHP"),
  };

  // Game state
  let isMatureMode = false; // Track mature/romance mode toggle
  let diceActive = false;
  let savedImages = []; // Store generated images for gallery
  let sceneLog = []; // Track recent turns for GPT context
  let pendingDiceRoll = null; // Store dice roll context

  // Initialize with starting narration
  const startingNarration = worldData.theme
    ? `Welcome to ${worldData.theme || "your adventure"}! Your journey begins...`
    : "You stand at the entrance of a dark forest. The trees loom overhead, their branches twisted like grasping hands. A faint mist swirls around your feet, and you hear distant whispers on the wind.";

  addNarration(startingNarration);

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

  async function handlePlayerAction(action) {
    // Add player action to chat
    const playerDiv = document.createElement("div");
    playerDiv.className = "player-message";
    playerDiv.textContent = `> ${action}`;
    el.chatMessages.appendChild(playerDiv);
    el.chatMessages.scrollTop = el.chatMessages.scrollHeight;

    // Clear input
    el.freeTextInput.value = "";

    // Disable choices while processing - show animated loading
    const dmName = isMatureMode ? "Grok" : "GPT";
    el.choiceButtons.innerHTML = `<div class="dm-thinking">🎲 ${dmName} DM is thinking<span class="spinner"></span></div>`;
    el.freeTextInput.disabled = true;
    el.submitActionBtn.disabled = true;

    try {
      // Build context for API
      const context = {
        worldTheme: worldData.theme || worldData.toneTags || "Fantasy adventure",
        character: {
          name: worldData.characterName || "Hero",
          class: worldData.characterConcept || "Adventurer",
          stats: {
            STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
          }
        },
        sceneLog: sceneLog.slice(-8), // Last 8 turns
        playerAction: action
      };

      // Route to appropriate API based on mode
      console.log(`🎲 Calling ${isMatureMode ? 'Grok-4-Fast (Mature Mode)' : 'GPT-5-mini (Normal Mode)'} API...`);
      const result = isMatureMode
        ? await generateGrokNarration(context)
        : await generateGptNarration(context);
      console.log(`✅ ${isMatureMode ? 'Grok' : 'GPT'} response received:`, result);

      // Add to scene log
      sceneLog.push({
        playerAction: action,
        outcome: result.narration,
        diceRoll: null
      });

      // Keep scene log to last 10 turns
      if (sceneLog.length > 10) {
        sceneLog.shift();
      }

      // Display narration
      addNarration(result.narration);

      // Handle dice roll if required
      if (result.diceRequired) {
        diceActive = true;
        pendingDiceRoll = {
          dc: result.dc,
          context: result.diceContext
        };

        // Extract check type (e.g., "Wisdom (Perception)" from the context)
        const checkMatch = result.diceContext?.match(/^([A-Z][a-z]+\s*\([A-Za-z]+\))/);
        const checkType = checkMatch ? checkMatch[1] : "Check Required";

        // Extract just the check description, remove spoilers about success/failure
        // Split on keywords like "Success:", "Failure:", "success:", "failure:"
        const contextWithoutSpoilers = result.diceContext
          ?.split(/\.\s*(?:Success|Failure|success|failure)[:;]/)[0]
          ?.trim() || "A roll is needed!";

        // Show dice info panel
        el.diceInfo.style.display = "block";
        el.diceCheckType.textContent = checkType;
        el.diceContext.textContent = contextWithoutSpoilers;
        el.diceDC.textContent = result.dc || 13;

        // Light up the dice button
        el.rollDiceBtn.disabled = false;
        el.rollDiceBtn.style.background = "#FFA500";
        el.rollDiceBtn.style.color = "#000";
        el.rollDiceBtn.style.fontWeight = "bold";
        el.rollDiceBtn.style.boxShadow = "0 0 15px rgba(255, 165, 0, 0.5)";
        el.rollDiceBtn.style.animation = "pulse 1.5s infinite";

        // Clear previous result
        el.diceResult.textContent = "";

        renderChoices([]); // No choices until dice is rolled
      } else {
        // Hide dice info and reset button
        el.diceInfo.style.display = "none";
        el.rollDiceBtn.style.background = "";
        el.rollDiceBtn.style.color = "";
        el.rollDiceBtn.style.fontWeight = "";
        el.rollDiceBtn.style.boxShadow = "";
        el.rollDiceBtn.style.animation = "";

        // Show new choices
        renderChoices(result.choices);
      }

      // Re-enable input
      el.freeTextInput.disabled = false;
      el.submitActionBtn.disabled = false;

    } catch (error) {
      console.error("Error generating narration:", error);

      // Show error message
      addNarration(`[Error: ${error.message}. ${error.message.includes("API key") ? "Please set your API key in Settings." : "Please try again."}]`);

      // Restore placeholder choices
      renderChoices(["Try again", "Check settings", "Continue"]);

      // Re-enable input
      el.freeTextInput.disabled = false;
      el.submitActionBtn.disabled = false;
    }
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

    // Reset button styling
    el.rollDiceBtn.disabled = true;
    el.rollDiceBtn.style.background = "";
    el.rollDiceBtn.style.color = "";
    el.rollDiceBtn.style.fontWeight = "";
    el.rollDiceBtn.style.boxShadow = "";
    el.rollDiceBtn.style.animation = "";

    // Hide dice info panel during roll
    el.diceInfo.style.display = "none";

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

        // Handle dice outcome with GPT
        setTimeout(async () => {
          const dc = pendingDiceRoll?.dc || 13;
          const success = finalRoll >= dc;

          // Show loading indicator for DM thinking
          const dmName = isMatureMode ? "Grok" : "GPT";
          el.choiceButtons.innerHTML = `<div class="dm-thinking">🎲 ${dmName} DM is thinking<span class="spinner"></span></div>`;

          // Update scene log with dice result
          if (sceneLog.length > 0) {
            sceneLog[sceneLog.length - 1].diceRoll = {
              roll: finalRoll,
              dc: dc,
              success: success
            };
          }

          // Generate outcome narration
          try {
            const context = {
              worldTheme: worldData.theme || worldData.toneTags || "Fantasy adventure",
              character: {
                name: worldData.characterName || "Hero",
                class: worldData.characterConcept || "Adventurer"
              },
              sceneLog: sceneLog.slice(-8),
              playerAction: `[Dice Roll: ${finalRoll} vs DC ${dc}] ${success ? "SUCCESS" : "FAILURE"} on ${pendingDiceRoll?.context || "check"}`
            };

            // Route to appropriate API based on mode
            console.log(`🎲 Calling ${isMatureMode ? 'Grok-4-Fast (Mature Mode)' : 'GPT-5-mini (Normal Mode)'} API for dice outcome...`);
            const result = isMatureMode
              ? await generateGrokNarration(context)
              : await generateGptNarration(context);
            console.log(`✅ ${isMatureMode ? 'Grok' : 'GPT'} dice outcome received:`, result);

            addNarration(result.narration);
            renderChoices(result.choices);

            // Add outcome to scene log
            sceneLog.push({
              playerAction: context.playerAction,
              outcome: result.narration,
              diceRoll: null
            });

          } catch (error) {
            // Fallback if API fails
            const outcomeText = success
              ? `You rolled a ${finalRoll}! Success! ${pendingDiceRoll?.context || "You overcome the challenge."}`
              : `You rolled a ${finalRoll}. Failure, but the story continues...`;

            addNarration(outcomeText);
            renderChoices(["Continue", "Try something else", "Rest"]);
          }

          pendingDiceRoll = null;
        }, 800);
      }
    }, 80);
  });

  el.saveBtn.addEventListener("click", () => {
    // Manual save (placeholder - will connect to Supabase later)
    alert("Game saved! (placeholder)\n\nIn the full version, this will save:\n- Scene Log (current turns)\n- Save File (world, character, inventory)\n- Progress Summary");
  });

  el.modeToggleBtn.addEventListener("click", () => {
    // Toggle mature mode
    isMatureMode = !isMatureMode;

    // Update button text and style
    if (isMatureMode) {
      el.modeToggleBtn.textContent = "Mode: Mature 🔞";
      el.modeToggleBtn.style.background = "#8B0000";
      el.modeToggleBtn.style.color = "#fff";

      // Check if Grok API key exists
      const grokApiKey = localStorage.getItem("grok_api_key");
      if (!grokApiKey) {
        alert("⚠️ Mature Mode requires a Grok API key.\n\nPlease add your xAI API key in Settings to use this feature.");
        // Revert toggle
        isMatureMode = false;
        el.modeToggleBtn.textContent = "Mode: Normal";
        el.modeToggleBtn.style.background = "";
        el.modeToggleBtn.style.color = "";
      }
    } else {
      el.modeToggleBtn.textContent = "Mode: Normal";
      el.modeToggleBtn.style.background = "";
      el.modeToggleBtn.style.color = "";
    }
  });

  el.settingsBtn.addEventListener("click", () => {
    openSettingsModal();
  });

  el.imageGenBtn.addEventListener("click", () => {
    openImageGenModal();
  });

  el.galleryBtn.addEventListener("click", () => {
    openGalleryModal();
  });

  el.menuBtn.addEventListener("click", () => {
    // Return to Entry screen (main menu)
    import("./entry.js").then(({ renderEntry }) => {
      renderEntry(container);
    });
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

  function openSettingsModal() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    // Get current API keys from localStorage
    const currentGptApiKey = localStorage.getItem("openai_api_key") || "";
    const currentGrokApiKey = localStorage.getItem("grok_api_key") || "";

    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Settings</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <h3 style="margin-top: 0;">OpenAI API Key (Normal Mode)</h3>
          <p class="muted" style="font-size: 0.9em; margin-bottom: 12px;">
            Enter your OpenAI API key to enable GPT-powered narration. Your key is stored locally in your browser.
          </p>
          <input
            type="password"
            id="gptApiKeyInput"
            value="${currentGptApiKey}"
            placeholder="sk-proj-..."
            style="width: 100%; padding: 10px; background: #1a1a1a; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; font-family: monospace; margin-bottom: 8px;"
          />
          <p class="muted" style="font-size: 0.85em;">
            Don't have an API key? <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #4CAF50;">Get one here</a>
          </p>

          <hr style="border-color: #333; margin: 20px 0;">

          <h3>xAI Grok API Key (Mature Mode)</h3>
          <p class="muted" style="font-size: 0.9em; margin-bottom: 12px;">
            Enter your xAI API key to enable Grok-powered mature/romance mode narration. Your key is stored locally in your browser.
          </p>
          <input
            type="password"
            id="grokApiKeyInput"
            value="${currentGrokApiKey}"
            placeholder="xai-..."
            style="width: 100%; padding: 10px; background: #1a1a1a; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; font-family: monospace; margin-bottom: 8px;"
          />
          <p class="muted" style="font-size: 0.85em;">
            Don't have an API key? <a href="https://x.ai/api" target="_blank" style="color: #4CAF50;">Get one here</a>
          </p>

          <div id="apiKeyStatus" style="margin-top: 12px; padding: 10px; border-radius: 4px; display: none;"></div>

          <hr style="border-color: #333; margin: 20px 0;">

          <h3>World Settings</h3>
          <button id="editWorldBtn" style="width: 100%;">Edit World (Return to Wizard)</button>
        </div>
        <div class="modal-footer">
          <button id="saveSettingsBtn">Save</button>
          <button id="cancelSettingsBtn">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = modal.querySelector(".modal-close-btn");
    const saveBtn = modal.querySelector("#saveSettingsBtn");
    const cancelBtn = modal.querySelector("#cancelSettingsBtn");
    const editWorldBtn = modal.querySelector("#editWorldBtn");
    const gptApiKeyInput = modal.querySelector("#gptApiKeyInput");
    const grokApiKeyInput = modal.querySelector("#grokApiKeyInput");
    const apiKeyStatus = modal.querySelector("#apiKeyStatus");

    // Close modal
    function closeModal() {
      modal.remove();
    }

    closeBtn.addEventListener("click", closeModal);
    cancelBtn.addEventListener("click", closeModal);

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Save settings
    saveBtn.addEventListener("click", () => {
      const gptApiKey = gptApiKeyInput.value.trim();
      const grokApiKey = grokApiKeyInput.value.trim();

      let hasError = false;

      // Validate GPT API key format if provided
      if (gptApiKey && !gptApiKey.startsWith("sk-")) {
        apiKeyStatus.style.display = "block";
        apiKeyStatus.style.background = "#8B0000";
        apiKeyStatus.style.color = "#fff";
        apiKeyStatus.textContent = "⚠️ Invalid OpenAI API key format. Keys should start with 'sk-'";
        hasError = true;
      }

      // Validate Grok API key format if provided (xAI keys typically start with 'xai-')
      if (grokApiKey && !grokApiKey.startsWith("xai-")) {
        apiKeyStatus.style.display = "block";
        apiKeyStatus.style.background = "#8B0000";
        apiKeyStatus.style.color = "#fff";
        apiKeyStatus.textContent = "⚠️ Invalid xAI API key format. Keys should start with 'xai-'";
        hasError = true;
      }

      if (hasError) return;

      // Save or remove GPT API key
      if (gptApiKey) {
        localStorage.setItem("openai_api_key", gptApiKey);
      } else {
        localStorage.removeItem("openai_api_key");
      }

      // Save or remove Grok API key
      if (grokApiKey) {
        localStorage.setItem("grok_api_key", grokApiKey);
      } else {
        localStorage.removeItem("grok_api_key");
      }

      // Show success message
      apiKeyStatus.style.display = "block";
      apiKeyStatus.style.background = "#1a4d1a";
      apiKeyStatus.style.color = "#4CAF50";
      apiKeyStatus.textContent = "✓ Settings saved successfully!";

      setTimeout(() => {
        closeModal();
      }, 1500);
    });

    // Edit world button
    editWorldBtn.addEventListener("click", () => {
      modal.remove();
      import("./worldWizard.js").then(({ renderWorldWizard }) => {
        renderWorldWizard(container, worldData);
      });
    });
  }
}
