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
          <strong>📝 What the AI will create:</strong> Complete profiles with name, race, role, detailed physical descriptions (for romance), backstory, personality, starting relationship points, romance availability, companion stats, and faction alignment.
        </p>
      </div>

      <div style="background: #2a2a2a; padding: 12px; border-radius: 4px; border-left: 3px solid #d97706;">
        <p style="color: #e0e0e0; margin: 0; font-size: 13px;">
          <strong>⚠️ Romance & Mature Content:</strong> NPCs will have detailed physical descriptions including body type, attractive features, and romantic appeal to support the mature content system.
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
  const npcListSummary = wizardData.npcList.map((npc, idx) =>
    `${idx + 1}. ${npc.name} (${npc.gender} ${npc.role})`
  ).join('\n');

  return `Great! You've created ${wizardData.npcCount} key NPC${wizardData.npcCount > 1 ? 's' : ''}:

${npcListSummary}

Now I'll help you build complete profiles for each! For every NPC, I'll create:

<strong>📖 Story & Background</strong>
- Name, race, origin, beliefs/values, behavior
- Role in the world, faction alignment
- Starting relationship points (allies +20-50, neutral 0, rivals/enemies negative)

<strong>💪 Companion Stats (if applicable)</strong>
- Special abilities if they join the party
- Stat bonuses they provide (matching their story)

<strong>💜 Physical Appearance (DETAILED for Romance)</strong>
- Height, build, hair, eyes, face
- Body type, curves, distinctive features
- Romantic/attractive characteristics
- Clothing and style

<strong>❤️ Romance Availability</strong>
- Can they be romanced? (Yes/No)
- If yes: Romantic preferences, personality in relationships

Let's start! Tell me more about the first NPC (${wizardData.npcList[0].name}), or I can expand them all based on your world context. What would you like?`;
}

export function buildStep2Context(wizardData, userMessage) {
  const npcListContext = wizardData.npcList.map((npc, idx) =>
    `${idx + 1}. ${npc.name} - ${npc.gender} ${npc.role}`
  ).join('\n');

  const npcContext = `
NPC INPUT (${wizardData.npcCount} NPCs):
${npcListContext}

IMPORTANT REQUIREMENTS:
- Create DETAILED physical descriptions for romance support
- Include: height, build, body type, curves, distinctive features, romantic appeal
- Specify starting relationship points (allies +20-50, neutral 0, enemies negative)
- Mark if romanceable (yes/no)
- Add companion stats/bonuses if applicable

Reference the world context and mechanics from previous steps.`;

  return npcContext + '\n\n' + userMessage;
}

export function isStep2Complete(wizardData) {
  return wizardData.npcList && wizardData.npcList.length > 0 && wizardData.npcCount;
}
