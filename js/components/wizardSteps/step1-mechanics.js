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
    return `Great! You've chosen <strong>Balanced Defaults</strong>.

I'll help you understand and customize the default mechanics:

<strong>📊 Combat System</strong>
- d20 + stat modifier vs DC (10=Easy, 13=Normal, 16=Hard)
- Turn-based (individual for 1-3 turns, then summarized every 3 rounds)
- Boss fights: 6-12 turns with narrative compression

<strong>📈 Progression</strong>
- Levels 1-20 (balanced XP curve, ~15k total to max)
- +1 stat per level, max modifier +10 (stat cap 30)
- Sources: Base (8-15), Racial (-2 to +4), Levels (+19), Equipment (+8), Companions (+5)

<strong>💰 Economy & Inventory</strong>
- Single currency (you name it)
- Key items only (quest items, special equipment, relics)

<strong>👥 Companions</strong>
- Max 2 companions, share player level
- Each provides stat bonuses matching their story

<strong>❤️ Relationship System</strong>
- 0-150+ points per NPC
- 50=Friend, 100=Romance, 150=Mature content
- Gains: Dialogue +2-5, Choices +3-10, Quests +10-30

Would you like to customize any of these, or should I write them all to the Living File as-is?`;
  } else {
    return `Perfect! You've chosen <strong>Custom Mechanics</strong>.

Let's build your game systems from the ground up! I'll help you define:

<strong>📊 Combat System</strong> - How do battles work? (dice, turn structure, enemy AI)
<strong>📈 Progression</strong> - How do players level up? (XP curve, stat gains, level cap)
<strong>💰 Economy & Inventory</strong> - What can players collect and buy?
<strong>👥 Companions</strong> - How do party members work?
<strong>❤️ Relationship System</strong> - How do NPC relationships develop?

Where would you like to start? Or tell me your vision and I'll organize it!`;
  }
}

export function buildStep1Context(wizardData, userMessage) {
  const mechanicsContext = `
MECHANICS APPROACH: ${wizardData.mechanicsApproach === 'defaults' ? 'Balanced Defaults' : 'Custom Mechanics'}

${wizardData.mechanicsApproach === 'defaults' ?
    `Using default mechanics (d20 combat, levels 1-20, relationship 0-150+, max 2 companions).
The user may want to customize specific aspects or accept defaults as-is.` :
    `Building custom mechanics from scratch. Help the user define combat, progression, inventory, companions, and relationships.`
  }

Reference the world context from Step 0 if available.`;

  return mechanicsContext + '\n\n' + userMessage;
}

export function isStep1Complete(wizardData) {
  return wizardData.mechanicsApproach;
}
