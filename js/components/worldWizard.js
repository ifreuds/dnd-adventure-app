export function renderWorldWizard(container) {
  const steps = [
    { id: 0, title: "Theme & Tone" },
    { id: 1, title: "Rules & Mechanics" },
    { id: 2, title: "NPCs & Factions" },
    { id: 3, title: "Character Creation" },
  ];

  let currentStep = 0;

  // Default base guidelines for each step
  const defaultGuidelines = {
    step0: `You are a World Building Assistant helping create the Theme & Tone for a D&D-style adventure.

REQUIRED COVERAGE:
- Main story objective/goal (what is the overarching quest or purpose?)
- World setting (genre, era, location - e.g., dark fantasy, sci-fi, medieval)
- Tone (dark/light, serious/comedic, gritty/heroic, etc.)
- Key conflicts or themes (central struggles, tensions)
- Atmosphere and mood (how should the world feel?)

YOUR APPROACH:
1. Ask proactive questions to guide the user
2. Extract key information from their responses
3. Build up the Living File incrementally
4. Ensure all required areas are covered before completion
5. Be conversational and collaborative

LIVING FILE FORMAT:
Theme: [genre/setting]
Era/Location: [when and where]
Tone: [mood descriptors]
Main Objective: [story goal]
Key Conflicts: [central tensions]
Atmosphere: [how it feels]

When you have covered all required areas, ask: "This looks complete! Ready to move on? Click Next when ready."

Respond in JSON format:
{
  "message": "Your conversational response to the user",
  "livingFile": "Updated Living File content in the format above",
  "coverageComplete": true/false
}`,
    step1: `Placeholder for Rules & Mechanics guidelines`,
    step2: `Placeholder for NPCs & Factions guidelines`,
    step3: `Placeholder for Character Creation guidelines`
  };

  // Load guidelines from localStorage or use defaults
  const guidelines = {
    step0: localStorage.getItem('wizard_guideline_step0') || defaultGuidelines.step0,
    step1: localStorage.getItem('wizard_guideline_step1') || defaultGuidelines.step1,
    step2: localStorage.getItem('wizard_guideline_step2') || defaultGuidelines.step2,
    step3: localStorage.getItem('wizard_guideline_step3') || defaultGuidelines.step3
  };

  // State to track wizard data across steps
  const wizardData = {
    // Legacy fields (for Steps 2-4 that still use old UI)
    theme: "",
    toneTags: "",
    inspirations: "",
    specialRules: "",
    npcs: "",
    factions: "",
    conflicts: "",
    characterName: "",
    characterConcept: "",
    stats: "",

    // New chat-based data
    livingFiles: {
      step0: localStorage.getItem('wizard_livingFile_step0') || "",
      step1: localStorage.getItem('wizard_livingFile_step1') || "",
      step2: localStorage.getItem('wizard_livingFile_step2') || "",
      step3: localStorage.getItem('wizard_livingFile_step3') || ""
    },

    // Chat history for each step
    chatHistory: {
      step0: JSON.parse(localStorage.getItem('wizard_chat_step0') || '[]'),
      step1: [],
      step2: [],
      step3: []
    }
  };

  container.innerHTML = `
    <div class="wizard">
      <!-- Sidebar -->
      <div class="wizard-sidebar">
        <h3>Progress</h3>
        <ol id="wizardSteps" class="wizard-steps"></ol>
        <p class="muted">Click any step to jump.</p>
      </div>

      <!-- Main Content -->
      <div style="flex:1; display:flex; flex-direction:column;">
        <div class="wizard-main">
          <!-- Left: Conversation -->
          <div class="panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h2 id="convoTitle">Conversation</h2>
              <button id="guidelineBtn" style="padding: 4px 10px; background: #2a2a2a; color: #888; border: 1px solid #444; border-radius: 4px; font-size: 12px; cursor: pointer; display: none;">⚙️ Edit Guidelines</button>
            </div>
            <div id="convoBody" class="muted"></div>
            <div id="inputArea" style="margin-top: 20px;"></div>
          </div>
          <!-- Right: Living File -->
          <div class="panel">
            <h2>Living File</h2>
            <div id="fileBody" class="muted" style="white-space: pre-wrap; line-height: 1.8; font-family: monospace; font-size: 14px;"></div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="button-bar">
          <button id="backBtn">Back</button>
          <button id="nextBtn">Next</button>
        </div>
      </div>
    </div>
  `;

  const el = {
    steps: container.querySelector("#wizardSteps"),
    convoTitle: container.querySelector("#convoTitle"),
    convoBody: container.querySelector("#convoBody"),
    inputArea: container.querySelector("#inputArea"),
    fileBody: container.querySelector("#fileBody"),
    backBtn: container.querySelector("#backBtn"),
    nextBtn: container.querySelector("#nextBtn"),
    guidelineBtn: container.querySelector("#guidelineBtn")
  };

  function renderSteps() {
    el.steps.innerHTML = steps
      .map(
        (s, idx) =>
          `<li data-idx="${idx}" class="${idx === currentStep ? "active-step" : ""}">${idx + 1}. ${s.title}</li>`
      )
      .join("");
    // Click to jump
    el.steps.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        currentStep = Number(li.getAttribute("data-idx"));
        render();
      });
    });
  }

  function contentFor(stepIdx) {
    switch (stepIdx) {
      case 0:
        // Chat-based UI for Step 1
        return {
          convoTitle: "Theme & Tone",
          useChatUI: true,
          initialPlaceholder: "What kind of world do you want to create? Describe the theme, tone, or any inspirations you have in mind..."
        };
      case 1:
        return {
          convoTitle: "Rules & Mechanics",
          convoBody:
            "Simple d20 checks + lightweight combat. Note any house rules or special conditions you want.",
          fields: [
            { key: "specialRules", label: "Special Rules", placeholder: "e.g., Critical fails trigger story twists" }
          ]
        };
      case 2:
        return {
          convoTitle: "NPCs & Factions",
          convoBody:
            "List a few key NPCs (ally/rival/romance) and at least one faction with a goal.",
          fields: [
            { key: "npcs", label: "Key NPCs", placeholder: "e.g., Elara (ally, scholar)" },
            { key: "factions", label: "Factions", placeholder: "e.g., The Shadow Court" },
            { key: "conflicts", label: "Conflicts", placeholder: "e.g., War between realms" }
          ]
        };
      case 3:
        return {
          convoTitle: "Character Creation",
          convoBody:
            "Pick your character concept and 6 stats. We'll balance with AI later.",
          fields: [
            { key: "characterName", label: "Name", placeholder: "e.g., Kael" },
            { key: "characterConcept", label: "Class/Concept", placeholder: "e.g., Rogue investigator" },
            { key: "stats", label: "Stats (STR/DEX/CON/INT/WIS/CHA)", placeholder: "e.g., 10/16/12/14/13/15" }
          ]
        };
      default:
        return { convoTitle: "Conversation", convoBody: "", fields: [] };
    }
  }

  function getLivingFileContent() {
    switch (currentStep) {
      case 0:
        // Use AI-generated living file for Step 0
        return wizardData.livingFiles.step0 || "(Chat with the World Building Assistant to create your world's theme and tone...)";
      case 1:
        return `- Core Check: d20 vs DC\n- Combat: d20 to hit, simple damage dice\n- Special Rules: ${wizardData.specialRules || "(empty)"}`;
      case 2:
        return `- Key NPCs: ${wizardData.npcs || "(empty)"}\n- Factions: ${wizardData.factions || "(empty)"}\n- Conflicts: ${wizardData.conflicts || "(empty)"}`;
      case 3:
        return `- Name: ${wizardData.characterName || "(empty)"}\n- Class/Concept: ${wizardData.characterConcept || "(empty)"}\n- Stats (STR/DEX/CON/INT/WIS/CHA): ${wizardData.stats || "(empty)"}`;
      default:
        return "";
    }
  }

  function renderMain() {
    const c = contentFor(currentStep);
    el.convoTitle.textContent = c.convoTitle;

    // Show/hide guideline button for chat-based steps
    if (c.useChatUI) {
      el.guidelineBtn.style.display = 'block';
    } else {
      el.guidelineBtn.style.display = 'none';
    }

    if (c.useChatUI) {
      // Chat-based UI (for Step 0)
      renderChatUI(c);
    } else {
      // Field-based UI (for Steps 1-3)
      el.convoBody.textContent = c.convoBody;

      // Render input fields
      el.inputArea.innerHTML = c.fields.map(field => `
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">${field.label}</label>
          <input
            type="text"
            data-key="${field.key}"
            value="${wizardData[field.key]}"
            placeholder="${field.placeholder}"
            style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;"
          />
        </div>
      `).join("");

      // Attach input listeners
      el.inputArea.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
          const key = e.target.getAttribute("data-key");
          wizardData[key] = e.target.value;
          updateLivingFile();
        });
      });
    }

    // Update Living File
    updateLivingFile();

    // Buttons state
    el.backBtn.disabled = currentStep === 0;
    el.nextBtn.textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
  }

  function renderChatUI(config) {
    const stepKey = `step${currentStep}`;
    const chatHistory = wizardData.chatHistory[stepKey];

    // Clear convoBody
    el.convoBody.innerHTML = '';

    // Render chat messages
    const chatContainer = document.createElement('div');
    chatContainer.style.cssText = 'max-height: 400px; overflow-y: auto; margin-bottom: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px;';

    if (chatHistory.length === 0) {
      // Initial assistant message
      chatContainer.innerHTML = `
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 5px;">🤖 World Building Assistant</div>
          <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; color: #e0e0e0;">
            Welcome! Let's create the theme and tone for your adventure world. ${config.initialPlaceholder}
          </div>
        </div>
      `;
    } else {
      // Render existing chat history
      chatHistory.forEach(msg => {
        const isUser = msg.role === 'user';

        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '15px';

        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'color: #888; font-size: 12px; margin-bottom: 5px;';
        labelDiv.textContent = isUser ? '👤 You' : '🤖 World Building Assistant';

        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `background: ${isUser ? '#1e3a5f' : '#2a2a2a'}; padding: 10px; border-radius: 4px; color: #e0e0e0; white-space: pre-wrap; line-height: 1.6;`;
        contentDiv.textContent = msg.content; // Use textContent to preserve line breaks

        msgDiv.appendChild(labelDiv);
        msgDiv.appendChild(contentDiv);
        chatContainer.appendChild(msgDiv);
      });

      // Auto-scroll to bottom
      setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 0);
    }

    el.convoBody.appendChild(chatContainer);

    // Render input area
    el.inputArea.innerHTML = `
      <div style="display: flex; gap: 10px;">
        <textarea
          id="chatInput"
          placeholder="${config.initialPlaceholder}"
          style="flex: 1; padding: 10px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; resize: vertical; min-height: 80px; font-family: inherit;"
        ></textarea>
        <button id="sendBtn" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Send</button>
      </div>
      <div id="loadingIndicator" style="margin-top: 10px; color: #888; font-size: 14px; display: none;">
        <span>🤖 Assistant is thinking</span>
        <span class="dots" style="display: inline-block; width: 20px; text-align: left;">...</span>
      </div>
    `;

    const chatInput = el.inputArea.querySelector('#chatInput');
    const sendBtn = el.inputArea.querySelector('#sendBtn');
    const loadingIndicator = el.inputArea.querySelector('#loadingIndicator');

    // Send message handler
    async function handleSend() {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // Disable input and show loading BEFORE adding to chat
      const originalValue = chatInput.value;
      chatInput.value = '';
      chatInput.disabled = true;
      sendBtn.disabled = true;

      // Add user message to chat
      wizardData.chatHistory[stepKey].push({ role: 'user', content: userMessage });

      // Save to localStorage
      localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

      // Re-render to show user message AND loading indicator
      renderChatUI(config);

      // Force the loading indicator to show (it gets recreated in renderChatUI)
      const newLoadingIndicator = el.inputArea.querySelector('#loadingIndicator');
      if (newLoadingIndicator) {
        newLoadingIndicator.style.display = 'block';
      }

      try {
        // Call AI to get response
        const response = await callWorldBuildingAssistant(stepKey, userMessage);

        // Add assistant response to chat
        wizardData.chatHistory[stepKey].push({ role: 'assistant', content: response.message });

        // Update living file
        if (response.livingFile) {
          wizardData.livingFiles[stepKey] = response.livingFile;
          localStorage.setItem(`wizard_livingFile_${stepKey}`, response.livingFile);
        }

        // Save chat history
        localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

        // Re-render
        updateLivingFile();
        renderChatUI(config);

      } catch (error) {
        alert(`Error: ${error.message}`);
        // Remove the user message on error
        wizardData.chatHistory[stepKey].pop();
        localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));
        renderChatUI(config);
      }
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  async function callWorldBuildingAssistant(stepKey, userMessage) {
    // Get API key
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("No API key found. Please add your OpenAI API key in Settings.");
    }

    // Build context: existing Living Files from other steps
    const contextualInfo = [];
    if (wizardData.livingFiles.step1 && stepKey !== 'step1') contextualInfo.push(`Rules & Mechanics:\n${wizardData.livingFiles.step1}`);
    if (wizardData.livingFiles.step2 && stepKey !== 'step2') contextualInfo.push(`NPCs & Factions:\n${wizardData.livingFiles.step2}`);
    if (wizardData.livingFiles.step3 && stepKey !== 'step3') contextualInfo.push(`Character:\n${wizardData.livingFiles.step3}`);

    const contextSection = contextualInfo.length > 0
      ? `\n\nEXISTING WORLD CONTEXT (reference this for consistency):\n${contextualInfo.join('\n\n')}`
      : '';

    // Build chat history for context
    const chatHistory = wizardData.chatHistory[stepKey];
    const previousMessages = chatHistory.slice(-6); // Last 6 messages for context

    const messages = [
      { role: "system", content: guidelines[stepKey] + contextSection },
      ...previousMessages,
      { role: "user", content: userMessage }
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini-2025-08-07",
          messages: messages,
          max_completion_tokens: 3500
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const messageContent = data.choices[0].message.content;

      if (!messageContent || messageContent.trim() === "") {
        throw new Error("AI returned an empty response. Please try again.");
      }

      // Parse JSON response
      let result;
      try {
        result = JSON.parse(messageContent);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("AI returned invalid JSON format. Please try again.");
        }
      }

      return {
        message: result.message || "I'm here to help build your world!",
        livingFile: result.livingFile || wizardData.livingFiles[stepKey],
        coverageComplete: result.coverageComplete || false
      };

    } catch (error) {
      console.error("World Building AI Error:", error);
      throw error;
    }
  }

  function showGuidelineEditor() {
    const stepKey = `step${currentStep}`;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';

    modal.innerHTML = `
      <div style="background: #1e1e1e; padding: 30px; border-radius: 8px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: #e0e0e0;">Edit Guidelines - ${steps[currentStep].title}</h2>
        <p style="color: #888; font-size: 14px; margin-bottom: 20px;">
          These guidelines define how the AI assistant helps you build this section. Advanced users can customize this to change the AI's behavior.
        </p>
        <textarea
          id="guidelineTextarea"
          style="width: 100%; min-height: 300px; padding: 15px; background: #0d0d0d; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; font-family: monospace; font-size: 13px; resize: vertical;"
        >${guidelines[stepKey]}</textarea>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button id="resetBtn" style="padding: 10px 20px; background: #444; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">Reset to Default</button>
          <button id="cancelBtn" style="padding: 10px 20px; background: #555; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="saveGuidelineBtn" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const textarea = modal.querySelector('#guidelineTextarea');
    const saveBtn = modal.querySelector('#saveGuidelineBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const resetBtn = modal.querySelector('#resetBtn');

    function closeModal() {
      document.body.removeChild(modal);
    }

    saveBtn.addEventListener('click', () => {
      const newGuideline = textarea.value.trim();
      if (newGuideline) {
        guidelines[stepKey] = newGuideline;
        localStorage.setItem(`wizard_guideline_${stepKey}`, newGuideline);
        alert('Guidelines saved!');
        closeModal();
      }
    });

    cancelBtn.addEventListener('click', closeModal);

    resetBtn.addEventListener('click', () => {
      if (confirm('Reset to default guidelines? This will erase your custom guidelines.')) {
        textarea.value = defaultGuidelines[stepKey];
      }
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function updateLivingFile() {
    el.fileBody.textContent = getLivingFileContent();
  }

  function render() {
    renderSteps();
    renderMain();
  }

  // Button handlers
  el.backBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      render();
    }
  });

  el.nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      render();
    } else {
      // Finish: Navigate to Main Game UI with wizard data
      console.log("Finishing wizard with data:", wizardData);
      import("./gameUI.js")
        .then(({ renderGameUI }) => {
          console.log("Loaded gameUI.js successfully");
          renderGameUI(container, wizardData);
        })
        .catch(err => {
          console.error("Failed to load gameUI.js:", err);
          alert("Error loading game UI. Check console for details.");
        });
    }
  });

  el.guidelineBtn.addEventListener("click", () => {
    showGuidelineEditor();
  });

  // Initial paint
  render();
}
