/**
 * Step 0: World Context (Theme, Tone & Objectives)
 */

export function renderStep0Form(wizardData, el, onComplete) {
  el.convoBody.innerHTML = `
    <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin-bottom: 15px;">
      <p style="color: #888; margin-bottom: 15px;">Fill out the basic world information, then the AI will help you expand it into a full world context.</p>
    </div>
  `;

  el.inputArea.innerHTML = `
    <div style="display: grid; gap: 15px; margin-bottom: 20px;">
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">World Name *</label>
        <input type="text" id="worldName" value="${wizardData.worldName || ''}"
               placeholder="e.g., The Shattered Realms, Neo-Tokyo 2099"
               style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Genre/Theme *</label>
        <input type="text" id="worldGenre" value="${wizardData.worldGenre || ''}"
               placeholder="e.g., Dark Fantasy, Cyberpunk, Steampunk, Post-Apocalyptic"
               style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
      </div>
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Main Conflict (Brief) *</label>
        <textarea id="worldConflict" placeholder="What's the central problem or threat? (1-2 sentences)"
                  style="width: 100%; min-height: 60px; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; resize: vertical;">${wizardData.worldConflict || ''}</textarea>
      </div>
    </div>

    <button id="generateBtn" style="width: 100%; padding: 12px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 16px;">
      🤖 Generate Full World Context
    </button>
  `;

  document.getElementById('generateBtn').addEventListener('click', () => {
    const worldName = document.getElementById('worldName').value.trim();
    const worldGenre = document.getElementById('worldGenre').value.trim();
    const worldConflict = document.getElementById('worldConflict').value.trim();

    if (!worldName || !worldGenre || !worldConflict) {
      alert('Please fill out all fields before generating.');
      return;
    }

    wizardData.worldName = worldName;
    wizardData.worldGenre = worldGenre;
    wizardData.worldConflict = worldConflict;

    onComplete();
  });
}

export function getStep0InitialMessage(wizardData) {
  return `Perfect! I see you've started with:

<strong>World Name:</strong> ${wizardData.worldName}
<strong>Genre:</strong> ${wizardData.worldGenre}
<strong>Main Conflict:</strong> ${wizardData.worldConflict}

Now let's build the complete world context! I'll help you define:
- Full premise and conflict origin
- Main objectives (win/lose conditions)
- Key locations (3-5 important places)
- Tone and DM narrative style
- Opposing forces and factions

Let's start - tell me more about the conflict. How did it begin? What's at stake?`;
}

export function buildStep0Context(wizardData, userMessage) {
  const worldContext = `
WORLD INPUT:
World Name: ${wizardData.worldName}
Genre/Theme: ${wizardData.worldGenre}
Main Conflict: ${wizardData.worldConflict}`;

  return worldContext + '\n\n' + userMessage;
}

export function isStep0Complete(wizardData) {
  return wizardData.worldName && wizardData.worldGenre && wizardData.worldConflict;
}
