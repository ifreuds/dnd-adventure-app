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
      <div>
        <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">Narrative Style (DM Tone) *</label>
        <select id="narrativeStyle" style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">
          <option value="">Select...</option>
          <option value="Descriptive & Atmospheric" ${wizardData.narrativeStyle === 'Descriptive & Atmospheric' ? 'selected' : ''}>Descriptive & Atmospheric (detailed environments, vivid imagery)</option>
          <option value="Action-Focused" ${wizardData.narrativeStyle === 'Action-Focused' ? 'selected' : ''}>Action-Focused (fast-paced, emphasis on what happens)</option>
          <option value="Dramatic & Theatrical" ${wizardData.narrativeStyle === 'Dramatic & Theatrical' ? 'selected' : ''}>Dramatic & Theatrical (emotional, intense moments)</option>
          <option value="Casual & Conversational" ${wizardData.narrativeStyle === 'Casual & Conversational' ? 'selected' : ''}>Casual & Conversational (relaxed, friendly tone)</option>
          <option value="Grim & Brutal" ${wizardData.narrativeStyle === 'Grim & Brutal' ? 'selected' : ''}>Grim & Brutal (dark, unforgiving, visceral)</option>
          <option value="Mysterious & Enigmatic" ${wizardData.narrativeStyle === 'Mysterious & Enigmatic' ? 'selected' : ''}>Mysterious & Enigmatic (cryptic, haunting atmosphere)</option>
        </select>
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
    const narrativeStyle = document.getElementById('narrativeStyle').value;

    if (!worldName || !worldGenre || !worldConflict || !narrativeStyle) {
      alert('Please fill out all fields before generating.');
      return;
    }

    wizardData.worldName = worldName;
    wizardData.worldGenre = worldGenre;
    wizardData.worldConflict = worldConflict;
    wizardData.narrativeStyle = narrativeStyle;

    onComplete();
  });
}

export function getStep0InitialMessage(wizardData) {
  return `Perfect! I've created a draft Living File based on your inputs:

<strong>World Name:</strong> ${wizardData.worldName}
<strong>Genre:</strong> ${wizardData.worldGenre}
<strong>Main Conflict:</strong> ${wizardData.worldConflict}
<strong>Narrative Style:</strong> ${wizardData.narrativeStyle}

Check the <strong>Living File</strong> panel on the right — I've drafted the initial world context based on what you provided.

Now let's refine it together! I'll help you add:
- More details about the conflict origin
- Main objectives (win/lose conditions)
- Key locations (3-5 important places)
- Opposing forces and factions

<strong>Review the Living File, then:</strong>
- If you want to expand on something, just tell me (e.g., "Add more about the two entities")
- If you want to add something new, tell me what (e.g., "Let's define 3 key locations")
- If it looks good, say "Continue" and I'll ask about the next area

What would you like to add or refine first?`;
}

export function buildStep0Context(wizardData, userMessage) {
  const worldContext = `
WORLD INPUT:
World Name: ${wizardData.worldName}
Genre/Theme: ${wizardData.worldGenre}
Main Conflict: ${wizardData.worldConflict}
Narrative Style: ${wizardData.narrativeStyle}`;

  return worldContext + '\n\n' + userMessage;
}

export function isStep0Complete(wizardData) {
  return wizardData.worldName && wizardData.worldGenre && wizardData.worldConflict && wizardData.narrativeStyle;
}
