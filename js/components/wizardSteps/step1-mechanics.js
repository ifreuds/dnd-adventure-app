/**
 * Step 1: Rules & Mechanics
 */

export function renderStep1Form(wizardData, el, onComplete) {
  el.convoBody.innerHTML = `
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <p style="color: #888; margin-bottom: 15px;">Choose your approach for game mechanics. You can use balanced defaults or customize everything to your preference.</p>
    </div>
  `;

  el.inputArea.innerHTML = `
    <div style="display: grid; gap: 15px; margin-bottom: 20px;">
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Mechanics Approach *</label>
        <select id="mechanicsApproach" style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
          <option value="">Select...</option>
          <option value="defaults" ${wizardData.mechanicsApproach === 'defaults' ? 'selected' : ''}>Use Balanced Defaults (Quick Setup)</option>
          <option value="custom" ${wizardData.mechanicsApproach === 'custom' ? 'selected' : ''}>Customize Everything (Advanced)</option>
        </select>
      </div>
      <div id="customNote" style="display: none; background: #2a2a2a; padding: 12px; border-radius: 4px; border-left: 3px solid #d97706;">
        <p style="color: #e0e0e0; margin: 0; font-size: 14px;">
          <strong>Custom Mode:</strong> The AI will help you define combat systems, progression curves, inventory rules, currency, companions, and relationship mechanics through conversation.
        </p>
      </div>
      <div id="defaultsNote" style="display: none; background: #2a2a2a; padding: 12px; border-radius: 4px; border-left: 3px solid #059669;">
        <p style="color: #e0e0e0; margin: 0; font-size: 14px;">
          <strong>Defaults Include:</strong> D&D-style combat (d20), level 1-20 progression, key items inventory, single currency, companion system (max 2), relationship tracking (0-150+ points).
        </p>
      </div>
    </div>

    <button id="generateBtn" style="width: 100%; padding: 12px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">
      🤖 Define Game Mechanics
    </button>
  `;

  const approachSelect = document.getElementById('mechanicsApproach');
  const customNote = document.getElementById('customNote');
  const defaultsNote = document.getElementById('defaultsNote');

  approachSelect.addEventListener('change', () => {
    const value = approachSelect.value;
    customNote.style.display = value === 'custom' ? 'block' : 'none';
    defaultsNote.style.display = value === 'defaults' ? 'block' : 'none';
  });

  // Trigger on load if value exists
  if (wizardData.mechanicsApproach) {
    approachSelect.dispatchEvent(new Event('change'));
  }

  document.getElementById('generateBtn').addEventListener('click', () => {
    const mechanicsApproach = approachSelect.value;

    if (!mechanicsApproach) {
      alert('Please select a mechanics approach.');
      return;
    }

    wizardData.mechanicsApproach = mechanicsApproach;
    onComplete();
  });
}

export function getStep1InitialMessage(wizardData) {
  const approach = wizardData.mechanicsApproach;

  if (approach === 'defaults') {
    return `I've selected Balanced Defaults for game mechanics.

Please create a COMPLETE rules system covering all 10 required areas (Core Mechanics, Combat, Companions, Progression, Currency & Inventory, Abilities & Magic, Crafting, Social Mechanics, Relationship Points, Hazards & Traps).

Use balanced defaults for everything. Fill all areas with specific values - do NOT leave any "[To be defined]" placeholders.

Make intelligent choices that fit the world context from Step 0. Then ask me to review it and let you know if I want to change anything.`;
  } else {
    return `I've selected Custom Mechanics.

Please create a COMPLETE rules system covering all 10 required areas (Core Mechanics, Combat, Companions, Progression, Currency & Inventory, Abilities & Magic, Crafting, Social Mechanics, Relationship Points, Hazards & Traps).

Make creative choices that fit the world context from Step 0. Fill everything with specific values - do NOT leave any "[To be defined]" placeholders.

Then ask me to review it and let you know if I want to change anything.`;
  }
}

export function buildStep1Context(wizardData, userMessage) {
  // Context is already passed in aiAssistant.js system prompt
  // Just return the user message as-is to avoid redundancy
  return userMessage;
}

export function isStep1Complete(wizardData) {
  return wizardData.mechanicsApproach;
}
