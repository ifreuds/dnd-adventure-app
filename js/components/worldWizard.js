/**
 * World Creation Wizard - Main Orchestrator
 * Refactored to use modular step components
 */

import { defaultGuidelines } from './wizardSteps/guidelines.js';
import { formatLivingFile } from './wizardSteps/livingFile.js';
import { renderHybridChat } from './wizardSteps/sharedChat.js';
import * as Step0 from './wizardSteps/step0-theme.js';
import * as Step1 from './wizardSteps/step1-mechanics.js';
import * as Step2 from './wizardSteps/step2-npcs.js';
import * as Step3 from './wizardSteps/step3-character.js';

export function renderWorldWizard(container, existingWorldData = null) {
  const steps = [
    { id: 0, title: "Theme & Tone" },
    { id: 1, title: "Rules & Mechanics" },
    { id: 2, title: "NPCs & Factions" },
    { id: 3, title: "Character Creation" },
  ];

  let currentStep = 0;

  // Load guidelines from localStorage or use defaults
  const guidelines = {
    step0: localStorage.getItem('wizard_guideline_step0') || defaultGuidelines.step0,
    step1: localStorage.getItem('wizard_guideline_step1') || defaultGuidelines.step1,
    step2: localStorage.getItem('wizard_guideline_step2') || defaultGuidelines.step2,
    step3: localStorage.getItem('wizard_guideline_step3') || defaultGuidelines.step3
  };

  // Wizard data
  const wizardData = {
    // Step 0: Theme & Tone
    worldName: '',
    worldGenre: '',
    worldConflict: '',

    // Step 1: Rules & Mechanics
    mechanicsApproach: '', // 'defaults' or 'custom'

    // Step 2: NPCs & Factions
    npcList: [],
    npcCount: 0,

    // Step 3: Character Creation
    characterName: '',
    characterGender: '',
    characterRace: '',
    characterClass: '',
    characterGoal: '',
    pointBuyStats: null,

    // Chat histories per step
    chatHistory: {
      step0: JSON.parse(localStorage.getItem('wizard_chat_step0') || '[]'),
      step1: JSON.parse(localStorage.getItem('wizard_chat_step1') || '[]'),
      step2: JSON.parse(localStorage.getItem('wizard_chat_step2') || '[]'),
      step3: JSON.parse(localStorage.getItem('wizard_chat_step3') || '[]')
    },

    // Living Files per step
    livingFiles: {
      step0: localStorage.getItem('wizard_livingFile_step0') || '',
      step1: localStorage.getItem('wizard_livingFile_step1') || '',
      step2: localStorage.getItem('wizard_livingFile_step2') || '',
      step3: localStorage.getItem('wizard_livingFile_step3') || ''
    }
  };

  // If editing existing world, load that data
  if (existingWorldData) {
    Object.assign(wizardData, existingWorldData);
  }

  // DOM structure
  container.innerHTML = `
    <div class="wizard">
      <div class="wizard-sidebar">
        <h2 style="margin-top:0; color:#e0e0e0;">World Creation</h2>
        <ul class="wizard-steps" id="stepsList"></ul>
        <button id="guidelineBtn" style="margin-top: 20px; width: 100%; padding: 8px; background: #333; border: 1px solid #555;">
          ⚙️ Edit Guidelines
        </button>
      </div>
      <div class="wizard-main">
        <div class="panel" id="convoPanel">
          <h3 id="convoTitle" style="margin-top:0; color:#d97706;"></h3>
          <div id="convoBody" style="flex:1; overflow-y:auto;"></div>
          <div id="inputArea" style="margin-top:15px;"></div>
        </div>
        <div class="panel" id="filePanel">
          <h3 style="margin-top:0; color:#059669;">Living File</h3>
          <div id="fileBody" style="flex:1; overflow-y:auto; background:#1a1a1a; padding:15px; border-radius:4px; color:#e0e0e0;"></div>
        </div>
      </div>
    </div>
    <div class="button-bar">
      <button id="backBtn">← Back</button>
      <button id="nextBtn">Next →</button>
      <button id="finishBtn" style="display:none; background:#059669;">Finish & Start Adventure</button>
    </div>
  `;

  // DOM references
  const el = {
    stepsList: container.querySelector("#stepsList"),
    convoTitle: container.querySelector("#convoTitle"),
    convoBody: container.querySelector("#convoBody"),
    inputArea: container.querySelector("#inputArea"),
    fileBody: container.querySelector("#fileBody"),
    backBtn: container.querySelector("#backBtn"),
    nextBtn: container.querySelector("#nextBtn"),
    finishBtn: container.querySelector("#finishBtn"),
    guidelineBtn: container.querySelector("#guidelineBtn")
  };

  // Step configuration
  function getStepConfig(stepIndex) {
    switch (stepIndex) {
      case 0:
        return {
          convoTitle: "World Context (Theme, Tone & Objectives)",
          useHybridUI: true,
          initialPlaceholder: "Great! Now I'll help you build the full world context based on your inputs..."
        };
      case 1:
        return {
          convoTitle: "Rules & Mechanics",
          useHybridUI: true,
          initialPlaceholder: "Perfect! I'll help you define the game mechanics in detail..."
        };
      case 2:
        return {
          convoTitle: "NPCs & Factions",
          useHybridUI: true,
          initialPlaceholder: "Great! I'll help you create detailed NPCs with full romance support..."
        };
      case 3:
        return {
          convoTitle: "Character Creation",
          useHybridUI: true,
          initialPlaceholder: "Great! Now I'll help you build your character's backstory, appearance, and abilities based on your choices..."
        };
      default:
        return { convoTitle: "Conversation", convoBody: "", fields: [] };
    }
  }

  function getLivingFileContent() {
    const stepKey = `step${currentStep}`;
    return wizardData.livingFiles[stepKey] || `No content yet for this step. Start chatting with the assistant!`;
  }

  function renderSteps() {
    el.stepsList.innerHTML = steps.map((step, i) => `
      <li class="${i === currentStep ? 'active-step' : ''}" data-step="${i}">
        ${step.title}
      </li>
    `).join('');

    el.stepsList.querySelectorAll("li").forEach(li => {
      li.addEventListener("click", () => {
        const targetStep = parseInt(li.getAttribute("data-step"));
        if (targetStep !== currentStep) {
          currentStep = targetStep;
          render();
        }
      });
    });
  }

  function renderMain() {
    const config = getStepConfig(currentStep);
    el.convoTitle.textContent = config.convoTitle;

    if (config.useHybridUI) {
      renderHybridUI(config);
    }

    updateLivingFile();
    updateButtons();
  }

  function renderHybridUI(config) {
    const stepKey = `step${currentStep}`;

    // Check if step data is complete
    let isDataFilled = false;
    if (currentStep === 0) {
      isDataFilled = Step0.isStep0Complete(wizardData);
    } else if (currentStep === 1) {
      isDataFilled = Step1.isStep1Complete(wizardData);
    } else if (currentStep === 2) {
      isDataFilled = Step2.isStep2Complete(wizardData);
    } else if (currentStep === 3) {
      isDataFilled = Step3.isStep3Complete(wizardData);
    }

    if (!isDataFilled) {
      // Render form
      if (currentStep === 0) {
        Step0.renderStep0Form(wizardData, el, render);
      } else if (currentStep === 1) {
        Step1.renderStep1Form(wizardData, el, render);
      } else if (currentStep === 2) {
        Step2.renderStep2Form(wizardData, el, render);
      } else if (currentStep === 3) {
        Step3.renderStep3Form(wizardData, el, render);
      }
    } else {
      // Show chat UI
      renderHybridChat(currentStep, stepKey, config, wizardData, guidelines, el, () => {
        render();
      });
    }
  }

  function updateLivingFile() {
    const content = getLivingFileContent();

    // For hybrid steps, format with colors
    if (wizardData.livingFiles[`step${currentStep}`]) {
      el.fileBody.innerHTML = formatLivingFile(content);
    } else {
      el.fileBody.textContent = content;
    }
  }

  function updateButtons() {
    el.backBtn.disabled = currentStep === 0;

    if (currentStep === steps.length - 1) {
      el.nextBtn.style.display = "none";
      el.finishBtn.style.display = "inline-block";
    } else {
      el.nextBtn.style.display = "inline-block";
      el.finishBtn.style.display = "none";
    }
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
    }
  });

  el.finishBtn.addEventListener("click", () => {
    saveWorld();

    import("./gameUI.js").then(({ renderGameUI }) => {
      const worldData = {
        id: Date.now(),
        worldName: extractWorldName(),
        playerLevel: 1,
        turnCount: 0,
        sceneLog: [],
        createdAt: Date.now(),
        lastPlayed: Date.now(),

        // Living files
        worldContext: wizardData.livingFiles.step0,
        mechanics: wizardData.livingFiles.step1,
        npcs: wizardData.livingFiles.step2,
        character: wizardData.livingFiles.step3,

        // Character data
        characterName: wizardData.characterName,
        characterClass: wizardData.characterClass,
        characterRace: wizardData.characterRace,
        baseStats: wizardData.pointBuyStats
      };

      renderGameUI(container, worldData);
    });
  });

  function saveWorld() {
    const worldId = `world_${Date.now()}`;
    const worldData = {
      id: worldId,
      worldName: extractWorldName(),
      playerLevel: 1,
      turnCount: 0,
      createdAt: Date.now(),
      lastPlayed: Date.now(),

      worldContext: wizardData.livingFiles.step0,
      mechanics: wizardData.livingFiles.step1,
      npcs: wizardData.livingFiles.step2,
      character: wizardData.livingFiles.step3,

      characterName: wizardData.characterName,
      characterClass: wizardData.characterClass,
      characterRace: wizardData.characterRace,
      baseStats: wizardData.pointBuyStats,

      sceneLog: []
    };

    // Save world data
    localStorage.setItem(worldId, JSON.stringify(worldData));

    // Add to saved worlds list
    const savedWorlds = JSON.parse(localStorage.getItem('saved_worlds_list') || '[]');
    if (!savedWorlds.includes(worldId)) {
      savedWorlds.push(worldId);
      localStorage.setItem('saved_worlds_list', JSON.stringify(savedWorlds));
    }
  }

  function extractWorldName() {
    const themeContent = wizardData.livingFiles.step0;
    if (themeContent) {
      const nameMatch = themeContent.match(/(?:World Name|Name|Title):\s*([^\n]+)/i);
      if (nameMatch) return nameMatch[1].trim();

      const themeMatch = themeContent.match(/Theme:\s*([^\n]+)/i);
      if (themeMatch) return themeMatch[1].trim().substring(0, 30);
    }

    return wizardData.characterName ? `${wizardData.characterName}'s Adventure` : "Untitled World";
  }

  el.guidelineBtn.addEventListener("click", () => {
    showGuidelineEditor();
  });

  function showGuidelineEditor() {
    const modal = document.createElement("div");
    modal.className = "modal-overlay";

    modal.innerHTML = `
      <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
          <h2>Edit Guideline for ${steps[currentStep].title}</h2>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p style="color: #888; margin-bottom: 15px;">This guideline controls how the AI assistant helps you in this step.</p>
          <textarea id="guidelineText" style="width: 100%; min-height: 300px; padding: 10px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; font-family: monospace; font-size: 12px; resize: vertical;">
${guidelines[`step${currentStep}`]}
          </textarea>
        </div>
        <div class="modal-footer">
          <button id="resetGuidelineBtn" style="margin-right: auto;">Reset to Default</button>
          <button id="cancelGuidelineBtn">Cancel</button>
          <button id="saveGuidelineBtn" style="background: #059669;">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    function closeModal() {
      modal.remove();
    }

    modal.querySelector(".modal-close-btn").addEventListener("click", closeModal);
    modal.querySelector("#cancelGuidelineBtn").addEventListener("click", closeModal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    modal.querySelector("#resetGuidelineBtn").addEventListener("click", () => {
      const stepKey = `step${currentStep}`;
      modal.querySelector("#guidelineText").value = defaultGuidelines[stepKey];
    });

    modal.querySelector("#saveGuidelineBtn").addEventListener("click", () => {
      const stepKey = `step${currentStep}`;
      const newGuideline = modal.querySelector("#guidelineText").value;
      guidelines[stepKey] = newGuideline;
      localStorage.setItem(`wizard_guideline_${stepKey}`, newGuideline);
      alert("Guideline saved!");
      closeModal();
    });
  }

  // Initial paint
  render();
}
