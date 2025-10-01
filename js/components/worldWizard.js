export function renderWorldWizard(container) {
  const steps = [
    { id: 0, title: "Theme & Tone" },
    { id: 1, title: "Rules & Mechanics" },
    { id: 2, title: "NPCs & Factions" },
    { id: 3, title: "Character Creation" },
  ];

  let currentStep = 0;

  // State to track wizard data across steps
  const wizardData = {
    theme: "",
    toneTags: "",
    inspirations: "",
    specialRules: "",
    npcs: "",
    factions: "",
    conflicts: "",
    characterName: "",
    characterConcept: "",
    stats: ""
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
            <h2 id="convoTitle">Conversation</h2>
            <div id="convoBody" class="muted"></div>
            <div id="inputArea" style="margin-top: 20px;"></div>
          </div>
          <!-- Right: Living File -->
          <div class="panel">
            <h2>Living File</h2>
            <div id="fileBody" class="muted" style="white-space: pre-line;"></div>
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
        return {
          convoTitle: "Theme & Tone",
          convoBody:
            "Describe your world vibe (dark fantasy, cozy adventure, high magic, etc.). We'll refine this with AI later.",
          fields: [
            { key: "theme", label: "World Theme", placeholder: "e.g., Dark fantasy with cosmic horror" },
            { key: "toneTags", label: "Tone Tags", placeholder: "e.g., gritty, mysterious, hopeful" },
            { key: "inspirations", label: "Inspirations", placeholder: "e.g., Bloodborne, Lovecraft" }
          ]
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
        return `- World Theme: ${wizardData.theme || "(empty)"}\n- Tone Tags: ${wizardData.toneTags || "(empty)"}\n- Inspirations: ${wizardData.inspirations || "(empty)"}`;
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

    // Update Living File
    updateLivingFile();

    // Buttons state
    el.backBtn.disabled = currentStep === 0;
    el.nextBtn.textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
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
      // Finish placeholder: later this will write initial Save File + Summary
      alert("Wizard complete (placeholder). Returning to Entry for now.");
      // (Optional) navigate back to entry without reloading:
      import("./entry.js").then(({ renderEntry }) => renderEntry(container));
    }
  });

  // Initial paint
  render();
}
