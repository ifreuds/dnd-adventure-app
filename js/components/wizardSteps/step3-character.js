/**
 * Step 3: Character Creation
 */

export function renderStep3Form(wizardData, el, onComplete) {
  // Show input form for basic character data
  el.convoBody.innerHTML = `
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <p style="color: #888; margin-bottom: 15px;">Fill out your character's basic information and assign stats using the point-buy system (27 points total).</p>
    </div>
  `;

  el.inputArea.innerHTML = `
    <div style="max-height: 600px; overflow-y: auto; padding-right: 10px;">
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Name *</label>
        <input type="text" id="charName" value="${wizardData.characterName || ''}"
               placeholder="e.g., Kael Shadowbane"
               style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Gender *</label>
        <select id="charGender" style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
          <option value="">Select...</option>
          <option value="Male" ${wizardData.characterGender === 'Male' ? 'selected' : ''}>Male</option>
          <option value="Female" ${wizardData.characterGender === 'Female' ? 'selected' : ''}>Female</option>
          <option value="Other" ${wizardData.characterGender === 'Other' ? 'selected' : ''}>Other</option>
        </select>
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Race *</label>
        <input type="text" id="charRace" value="${wizardData.characterRace || ''}"
               placeholder="e.g., Human, Elf, Mutant, Cyborg"
               style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Class/Concept *</label>
        <input type="text" id="charClass" value="${wizardData.characterClass || ''}"
               placeholder="e.g., Rogue, Warrior, Mage"
               style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Personal Goal *</label>
      <textarea id="charGoal" placeholder="What does your character want to achieve?"
                style="width: 100%; min-height: 60px; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; resize: vertical;">${wizardData.characterGoal || ''}</textarea>
    </div>

    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <h3 style="margin: 0 0 15px 0; color: #d97706;">Point-Buy Stats (27 points)</h3>
      <p style="color: #888; font-size: 13px; margin-bottom: 15px;">Assign your base stats (range 8-15). Costs: 8=0pts, 9=1pt, 10=2pts, 11=3pts, 12=4pts, 13=5pts, 14=7pts, 15=9pts</p>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;" id="statGrid">
        ${['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].map(stat => {
          const val = wizardData.pointBuyStats?.[stat] || 8;
          return `
            <div style="background: #2a2a2a; padding: 10px; border-radius: 4px;">
              <div style="font-weight: bold; color: #d97706; margin-bottom: 5px;">${stat}</div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <button class="stat-btn" data-stat="${stat}" data-dir="-1" style="width: 30px; height: 30px; background: #444; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 18px;">−</button>
                <div style="flex: 1; text-align: center; font-size: 20px; font-weight: bold; color: #e0e0e0;" id="stat-${stat}">${val}</div>
                <button class="stat-btn" data-stat="${stat}" data-dir="1" style="width: 30px; height: 30px; background: #444; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer; font-size: 18px;">+</button>
              </div>
              <div style="text-align: center; font-size: 12px; color: #888; margin-top: 5px;" id="cost-${stat}">Cost: 0</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="margin-top: 15px; padding: 10px; background: #333; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #e0e0e0;">Points Remaining:</span>
        <span id="pointsRemaining" style="font-size: 20px; font-weight: bold; color: #d97706;">27</span>
      </div>
    </div>

    <button id="generateBtn" style="width: 100%; padding: 12px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px; margin-top: 20px;">
      🤖 Generate Character Story & Details
    </button>
    </div>
  `;

  // Initialize point-buy stats if not exists
  if (!wizardData.pointBuyStats) {
    wizardData.pointBuyStats = { STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 };
  }

  // Point-buy cost calculation
  const getStatCost = (val) => {
    const costs = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
    return costs[val] || 0;
  };

  const calculateTotalCost = () => {
    return Object.values(wizardData.pointBuyStats).reduce((sum, val) => sum + getStatCost(val), 0);
  };

  const updatePointDisplay = () => {
    const total = calculateTotalCost();
    const remaining = 27 - total;
    document.getElementById('pointsRemaining').textContent = remaining;
    document.getElementById('pointsRemaining').style.color = remaining < 0 ? '#ff4444' : '#d97706';

    // Update cost displays
    ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach(stat => {
      const cost = getStatCost(wizardData.pointBuyStats[stat]);
      document.getElementById(`cost-${stat}`).textContent = `Cost: ${cost}`;
    });
  };

  // Stat button handlers
  el.inputArea.querySelectorAll('.stat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const stat = btn.getAttribute('data-stat');
      const dir = parseInt(btn.getAttribute('data-dir'));
      const current = wizardData.pointBuyStats[stat];
      const newVal = current + dir;

      if (newVal >= 8 && newVal <= 15) {
        const newCost = calculateTotalCost() - getStatCost(current) + getStatCost(newVal);
        if (newCost <= 27) {
          wizardData.pointBuyStats[stat] = newVal;
          document.getElementById(`stat-${stat}`).textContent = newVal;
          updatePointDisplay();
        }
      }
    });
  });

  // Generate button
  document.getElementById('generateBtn').addEventListener('click', () => {
    const name = document.getElementById('charName').value.trim();
    const gender = document.getElementById('charGender').value;
    const race = document.getElementById('charRace').value.trim();
    const charClass = document.getElementById('charClass').value.trim();
    const goal = document.getElementById('charGoal').value.trim();

    if (!name || !gender || !race || !charClass || !goal) {
      alert('Please fill out all fields before generating character details.');
      return;
    }

    const totalCost = calculateTotalCost();
    if (totalCost !== 27) {
      alert(`You must use exactly 27 points. Currently using ${totalCost} points.`);
      return;
    }

    // Save to wizard data
    wizardData.characterName = name;
    wizardData.characterGender = gender;
    wizardData.characterRace = race;
    wizardData.characterClass = charClass;
    wizardData.characterGoal = goal;

    onComplete();
  });

  updatePointDisplay();
}

export function getStep3InitialMessage(wizardData) {
  const stats = wizardData.pointBuyStats;
  const statSummary = `STR ${stats.STR}, DEX ${stats.DEX}, CON ${stats.CON}, INT ${stats.INT}, WIS ${stats.WIS}, CHA ${stats.CHA}`;

  return `Create a complete character profile for:

${wizardData.characterName} (${wizardData.characterGender} ${wizardData.characterRace} ${wizardData.characterClass})
Goal: ${wizardData.characterGoal}
Base Stats: ${statSummary}

Please create:
- Backstory (2-3 paragraphs based on world context from Step 0)
- Racial stat bonuses (narrative-based, infer from race and world)
- Physical appearance (2-3 sentences, brief)
- Personality traits (5 traits)
- Starting abilities (2-3 class abilities based on world rules)
- Starting equipment (based on class and world setting)
- NPC relationships (3 sentences each, explaining starting relationship points from Step 2)
- Player starting story (2-3 paragraphs prologue - where/how does the story begin?)

Auto-generate everything based on world context, then ask me to review.`;
}

export function buildStep3Context(wizardData, userMessage) {
  const stats = wizardData.pointBuyStats;
  const statString = `STR ${stats.STR}, DEX ${stats.DEX}, CON ${stats.CON}, INT ${stats.INT}, WIS ${stats.WIS}, CHA ${stats.CHA}`;

  const characterContext = `
PLAYER CHARACTER INPUT:
Name: ${wizardData.characterName}
Gender: ${wizardData.characterGender}
Race: ${wizardData.characterRace}
Class: ${wizardData.characterClass}
Personal Goal: ${wizardData.characterGoal}
Base Stats (Point-Buy): ${statString}

Reference the world context from previous steps as needed.`;

  return characterContext + '\n\n' + userMessage;
}

export function isStep3Complete(wizardData) {
  return wizardData.characterName && wizardData.characterGender &&
         wizardData.characterRace && wizardData.characterClass &&
         wizardData.pointBuyStats;
}
