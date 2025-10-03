/**
 * Step 2: NPCs & Factions
 */

export function renderStep2Form(wizardData, el, onComplete) {
  el.convoBody.innerHTML = `
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <p style="color: #888; margin-bottom: 15px;">The AI will generate complete NPC profiles based on your world's story and theme. Just choose how many key NPCs you want to start with.</p>
    </div>
  `;

  el.inputArea.innerHTML = `
    <div style="display: grid; gap: 15px; margin-bottom: 20px;">
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Number of Key NPCs *</label>
        <select id="npcCount" style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
          <option value="">Select...</option>
          <option value="3" ${wizardData.npcCount === 3 ? 'selected' : ''}>3 NPCs (Minimal)</option>
          <option value="4" ${wizardData.npcCount === 4 ? 'selected' : ''}>4 NPCs (Balanced)</option>
          <option value="5" ${wizardData.npcCount === 5 ? 'selected' : ''}>5 NPCs (Recommended)</option>
          <option value="6" ${wizardData.npcCount === 6 ? 'selected' : ''}>6 NPCs (Rich Cast)</option>
        </select>
      </div>

      <div style="background: #2a2a2a; padding: 12px; border-radius: 4px; border-left: 3px solid #8b5cf6;">
        <p style="color: #e0e0e0; margin: 0; font-size: 13px;">
          <strong>📝 What the AI will create:</strong> Complete NPC profiles with name, race, role, detailed physical descriptions, backstory, personality, starting relationship points, romance availability, companion stats (if recruitable), and faction alignment.
        </p>
      </div>
    </div>

    <button id="generateBtn" style="width: 100%; padding: 12px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">
      🤖 Generate NPCs & Factions
    </button>
  `;

  document.getElementById('generateBtn').addEventListener('click', () => {
    const npcCount = parseInt(document.getElementById('npcCount').value);

    if (!npcCount) {
      alert('Please select the number of NPCs.');
      return;
    }

    wizardData.npcCount = npcCount;
    onComplete();
  });
}

export function getStep2InitialMessage(wizardData) {
  return `I've selected ${wizardData.npcCount} key NPCs to create.

Please create COMPLETE profiles for ${wizardData.npcCount} NPCs based on the world context from Step 0 and the mechanics from Step 1.

For each NPC, create:
- Name, race, role, and origin
- Detailed backstory and personality
- Complete physical description (height, build, distinctive features, clothing style)
- Starting relationship points (allies/friends start positive, neutral at 0, rivals/enemies start negative)
- Romance availability (yes/no)
- Companion stats if recruitable (stat bonuses and special abilities)
- Faction alignment

Make them diverse, interesting, and appropriate for the world's theme and tone. Then ask me to review and let you know if I want to change anything.`;
}

export function buildStep2Context(wizardData, userMessage) {
  // Context is already passed in aiAssistant.js system prompt
  // Just return the user message as-is to avoid redundancy
  return userMessage;
}

export function isStep2Complete(wizardData) {
  return wizardData.npcCount && wizardData.npcCount >= 3;
}
