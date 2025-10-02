/**
 * Step 2: NPCs & Factions
 */

export function renderStep2Form(wizardData, el, onComplete) {
  if (!wizardData.npcList) {
    wizardData.npcList = [{ name: '', role: '', gender: '' }];
  }

  el.convoBody.innerHTML = `
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <p style="color: #888; margin-bottom: 15px;">Define the key NPCs for your world. The AI will expand each with detailed physical descriptions, backstory, relationship points, and romance options.</p>
    </div>
  `;

  function renderNPCList() {
    return wizardData.npcList.map((npc, idx) => `
      <div style="background: #2a2a2a; padding: 12px; border-radius: 4px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="color: #d97706;">NPC ${idx + 1}</strong>
          ${wizardData.npcList.length > 1 ? `<button class="removeNPC" data-idx="${idx}" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">Remove</button>` : ''}
        </div>
        <div style="display: grid; grid-template-columns: 2fr 2fr 1fr; gap: 10px;">
          <input type="text" class="npcName" data-idx="${idx}" value="${npc.name || ''}"
                 placeholder="Name"
                 style="padding: 6px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 3px;">
          <input type="text" class="npcRole" data-idx="${idx}" value="${npc.role || ''}"
                 placeholder="Role (e.g., Warrior, Merchant)"
                 style="padding: 6px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 3px;">
          <select class="npcGender" data-idx="${idx}"
                  style="padding: 6px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 3px;">
            <option value="">Gender...</option>
            <option value="Male" ${npc.gender === 'Male' ? 'selected' : ''}>Male</option>
            <option value="Female" ${npc.gender === 'Female' ? 'selected' : ''}>Female</option>
            <option value="Other" ${npc.gender === 'Other' ? 'selected' : ''}>Other</option>
          </select>
        </div>
      </div>
    `).join('');
  }

  el.inputArea.innerHTML = `
    <div id="npcListContainer" style="margin-bottom: 15px;">
      ${renderNPCList()}
    </div>

    <button id="addNPCBtn" style="width: 100%; padding: 8px; background: #059669; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-bottom: 15px;">
      + Add Another NPC
    </button>

    <div style="background: #2a2a2a; padding: 12px; border-radius: 4px; border-left: 3px solid #8b5cf6; margin-bottom: 15px;">
      <p style="color: #e0e0e0; margin: 0; font-size: 13px;">
        <strong>⚠️ Romance & Mature Content Notice:</strong> The AI will create DETAILED physical descriptions for romance support. Each NPC will have vivid appearance details including body type, curves, distinctive features, and romantic appeal.
      </p>
    </div>

    <button id="generateBtn" style="width: 100%; padding: 12px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">
      🤖 Generate Full NPC Profiles
    </button>
  `;

  function attachHandlers() {
    // Update handlers
    el.inputArea.querySelectorAll('.npcName').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        wizardData.npcList[idx].name = e.target.value;
      });
    });

    el.inputArea.querySelectorAll('.npcRole').forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        wizardData.npcList[idx].role = e.target.value;
      });
    });

    el.inputArea.querySelectorAll('.npcGender').forEach(select => {
      select.addEventListener('change', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        wizardData.npcList[idx].gender = e.target.value;
      });
    });

    // Remove handlers
    el.inputArea.querySelectorAll('.removeNPC').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'));
        wizardData.npcList.splice(idx, 1);
        el.inputArea.querySelector('#npcListContainer').innerHTML = renderNPCList();
        attachHandlers();
      });
    });
  }

  attachHandlers();

  // Add NPC button
  document.getElementById('addNPCBtn').addEventListener('click', () => {
    wizardData.npcList.push({ name: '', role: '', gender: '' });
    el.inputArea.querySelector('#npcListContainer').innerHTML = renderNPCList();
    attachHandlers();
  });

  // Generate button
  document.getElementById('generateBtn').addEventListener('click', () => {
    const validNPCs = wizardData.npcList.filter(npc => npc.name && npc.role && npc.gender);

    if (validNPCs.length === 0) {
      alert('Please fill out at least one NPC with Name, Role, and Gender.');
      return;
    }

    wizardData.npcList = validNPCs;
    wizardData.npcCount = validNPCs.length;

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
