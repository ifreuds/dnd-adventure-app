export function renderWorldWizard(container) {
  container.innerHTML = `
    <div style="display:flex; height:100vh;">
      
      <!-- Sidebar -->
      <div style="width:250px; background:#1e1e1e; padding:10px; border-right:1px solid #333;">
        <h3>Progress</h3>
        <ol id="wizardSteps" style="list-style:none; padding-left:0;">
          <li>1. Theme & Tone</li>
          <li>2. Rules & Mechanics</li>
          <li>3. NPCs & Factions</li>
          <li>4. Character Creation</li>
        </ol>
      </div>
      
      <!-- Main Content -->
      <div style="flex:1; display:flex; flex-direction:row;">
        
        <!-- Left panel: Conversation -->
        <div style="flex:1; padding:20px; border-right:1px solid #333;">
          <h2>Conversation Panel</h2>
          <p>(Here you’ll chat with AI to refine the world step by step.)</p>
        </div>
        
        <!-- Right panel: Living File -->
        <div style="flex:1; padding:20px;">
          <h2>Living File</h2>
          <p>(This panel shows a structured summary of your world so far.)</p>
        </div>
      </div>
    </div>
  `;
}
