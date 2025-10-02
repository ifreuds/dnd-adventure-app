export function renderWorldWizard(container, existingWorldData = null) {
  const steps = [
    { id: 0, title: "Theme & Tone" },
    { id: 1, title: "Rules & Mechanics" },
    { id: 2, title: "NPCs & Factions" },
    { id: 3, title: "Character Creation" },
  ];

  let currentStep = 0;

  // Default base guidelines for each step
  const defaultGuidelines = {
    step0: `You are a World Building Assistant helping create the World Context for a D&D-style adventure.

REQUIRED COVERAGE (ask proactive questions to extract all):
1. PREMISE & ORIGIN
   - What is the central conflict or issue in this world?
   - How did this conflict begin? (brief origin story)

2. MAIN OBJECTIVE
   - What is the player's ultimate goal? (quest/purpose)
   - Win condition: What defines success?
   - Lose condition: What defines failure? (optional: death, world ends, time limit, etc.)

3. WORLD SETTING
   - Genre/theme (dark fantasy, sci-fi, steampunk, etc.)
   - Era/time period (medieval, Victorian, futuristic, etc.)

4. KEY LOCATIONS
   - 3-5 major locations that matter to the story
   - What each location represents (safe haven, danger zone, quest hub, etc.)
   - Note: Player can explore beyond these, but these are the anchors

5. TONE & NARRATIVE STYLE
   - Mood (dark/light, serious/comedic, gritty/heroic, etc.)
   - DM narrative style preference (descriptive/action-focused, verbose/concise, dramatic/casual)
   - Scene-setting approach (detailed environments vs quick pacing)

6. KEY CONFLICTS/FACTIONS
   - Central tensions or opposing forces
   - Who/what stands in the way of the objective?

YOUR APPROACH:
- Ask questions conversationally, one topic at a time
- Extract information incrementally as user shares ideas
- Be flexible and creative - encourage player vision
- Ensure all 6 areas above are covered before marking complete
- Format data cleanly for AI context (compact but complete)

LIVING FILE FORMAT (AI-optimized):
Premise: [1-2 sentence setup - what's happening and why]
Main Objective: [player's goal]
Win Condition: [what defines success]
Lose Condition: [what defines failure, or "none"]

Genre: [theme/setting]
Era: [time period]

Key Locations:
- [Location 1]: [role in story]
- [Location 2]: [role in story]
- [Location 3]: [role in story]

Tone: [mood descriptors]
DM Style: [narrative approach - how verbose/dramatic should narration be]
Scene Setting: [environmental detail level]

Central Conflict: [main tension]
Opposing Forces: [who/what opposes the player]

When all 6 areas are covered, say: "This world context looks complete! Ready to move on? Click Next when ready."

Respond in JSON format:
{
  "message": "Your conversational response to the user",
  "livingFile": "Updated Living File in the format above",
  "coverageComplete": true/false
}`,
    step1: `You are a World Building Assistant helping define Game Rules & Mechanics for a D&D-style adventure.

REQUIRED COVERAGE (ask proactive questions to extract preferences):

1. CORE MECHANICS
   - Skill checks: d20 + stat mod vs DC (Easy 10, Normal 13, Hard 16) - STANDARD
   - When to roll: Critical forks, encounters, challenges (not every action)
   - Text-based interactions: Dialogue choices, quest decisions determine outcomes
   - Fail forward: Failures advance story, don't block progress

2. COMBAT SYSTEM (Narrative-focused, token-efficient)
   COMBAT FLOW:
   - Turn 1-3: Individual narration per turn (action → roll → outcome → enemy response)
   - Turn 4+: Auto-summarize every 3 turns to compress scene log
     Example: "Last 3 rounds: [what happened], Enemy HP: [status], Party: [condition]"
   - Boss fights: Can run 6-12 turns (compressed to 2-4 summary entries)
   - Normal combat: 2-4 turns (no compression needed)

   ENEMY HANDLING:
   - Multiple weak enemies: Group rolls (3 goblins = 1 roll for "goblin group")
   - Boss + minions: Boss gets individual roll, minions share group roll
   - Ask: Prefer group rolls or individual rolls for most encounters?

   DEATH HANDLING:
   - Ask: Permadeath, revival mechanics, or checkpoint retry?

   COMBAT STYLE:
   - Narrative-focused, story impact over granular HP tracking
   - Keep exciting but efficient

3. COMPANION SYSTEM (Max 2 companions + player = party of 3)
   - Companions share player's power level (no separate character sheets)
   - Each companion provides: Stat bonus OR special ability
   - Examples: "+2 to DEX rolls" or "Can pick locks" or "Tank damage in combat"
   - Party rolls: Single d20 for party (player base + companion bonuses apply)
   - Combat: Companions assist narratively when relevant, enhance player actions
   - Ask: Should companions have unique combat styles or passive bonuses?

4. PROGRESSION SYSTEM (Level 1-20, game continues after max level)
   XP CURVE (Balanced - not too easy, not too grindy):
   - Level 2: 100 XP
   - Level 3: 250 XP
   - Level 4: 450 XP
   - Level 5: 700 XP
   - Continue scaling (total ~15,000 XP to reach Level 20)

   XP SOURCES:
   - Minor encounter: 10-25 XP
   - Major combat: 50-100 XP
   - Quest completion: 100-300 XP
   - Story milestone: 200-500 XP

   LEVEL UP GAINS:
   - Ask: What improves on level up? (+stat points, +HP, new abilities?)

   POST-LEVEL 20:
   - Game continues, stats maxed out, story-driven progression

5. INVENTORY, CURRENCY & EQUIPMENT
   CURRENCY:
   - Ask: What's your currency called? (Gold, Credits, Coins, Marks, etc.)
   - Tracking: Numerical (displayed in character panel)
   - Sources: Quest rewards, combat loot, selling items, NPC gifts
   - Uses: Vendors, crafting materials, bribes, purchases, social interactions
   - Ask: Starting amount for new characters?

   TRACKED ITEMS:
   - Quest items (keys, artifacts, plot items)
   - Special equipment (magic weapons, enhanced armor)
   - Relics & trinkets (stat boosts, special abilities)

   NOT TRACKED:
   - Consumables (potions mentioned in story, not counted individually)
   - Mundane gear (assumed player has basics)

   EQUIPMENT RULES:
   - Slot logic: 2 hands default (can equip 2 hand-items unless race/story modifies)
   - Story-appropriate: Can't wear 2 hats, but creative combos allowed
   - Item effects: Stat boosts, special abilities (per rest or permanent)
   - Ask: Should items have rarity tiers (Common/Rare/Legendary)?

6. SPECIAL ABILITIES & MAGIC
   - Narrator creates abilities fitting character concept and class
   - Usage limits: Per rest, per day, or permanent passive?
   - Ask: Preferred magic/ability style? (Open creative vs structured spell slots)

7. CRAFTING & GATHERING
   - DC-based system:
     * Easy materials (common herbs) = Low DC (10)
     * Rare materials (dragon scales) = High DC (16+)
   - Power balance: Good items require quests/resources, basic items are easy
   - Material sources: Quest rewards, exploration, vendors
   - Ask: How important is crafting? (Low/Medium/High priority)

8. SOCIAL MECHANICS
   - Dialogue choices + free text input for player creativity
   - Skills: Persuasion, deception, intimidation, brute force
   - Ask: Should social encounters use dice rolls (DC-based) or pure choice-based outcomes?

9. RELATIONSHIP SYSTEM (0-100+ points per NPC)
   - Tracking: Per NPC, stored in save file
   - Gain points from:
     * Paying attention to NPC dialogue
     * Making choices that align with NPC values
     * Completing quests together
     * Gift-giving, special interactions
   - Milestones:
     * 50 points: Friend/trusted ally
     * 100 points: Romance/deep bond unlocked
     * 100+: Deeper story arcs available
   - Ask: How fast should relationships progress? (Slow/Moderate/Fast)
   - Note: Relationship status viewable on demand (not always visible)

10. HAZARDS & TRAPS
    - Story-driven: DM hints at dangers in narration
    - Player awareness: Perception checks or clues in text
    - Failure consequences: Damage, harder encounters, story complications
    - Open creative freedom for narrative traps/hazards

YOUR APPROACH:
- Ask about player preferences for each system
- Offer defaults (can accept or customize)
- Keep combat rules simple to avoid token bloat
- Ensure XP curve and progression are clearly defined
- Format for AI readability (game DM references this during play)

LIVING FILE FORMAT (AI-Optimized):
=== CORE MECHANICS ===
Skill Checks: d20 + stat vs DC (10/13/16)
Roll Trigger: Critical moments, challenges, combat
Text Interactions: Dialogue/quest choices determine outcomes
Fail Forward: Yes - failures advance story

=== COMBAT (Narrative-Focused) ===
Flow: Turn 1-3 individual, Turn 4+ summarize every 3 rounds
Boss Fights: 6-12 turns (compressed summaries)
Normal Combat: 2-4 turns
Enemy Rolls: [Group rolls / Individual for bosses / Player preference]
Death Handling: [Permadeath / Revival / Checkpoint]
Focus: Story impact, efficient token usage

=== COMPANIONS (Max 2) ===
Power Level: Shares player level
Bonuses: [List what each companion type provides]
Party Rolls: Single d20 + player stats + companion bonuses
Combat Role: [Narrative assist / Passive bonuses / Combat styles]

=== PROGRESSION (Level 1-20) ===
XP Curve: Lv2=100, Lv3=250, Lv4=450, Lv5=700... (~15k total)
XP Rewards: Minor 10-25, Major 50-100, Quest 100-300, Milestone 200-500
Level Up Gains: [Stats/HP/Abilities - specify]
Post-20: Game continues, stats maxed

=== CURRENCY & INVENTORY ===
Currency Name: [Gold/Credits/Coins/etc.]
Starting Amount: [Number]
Sources: Quest rewards, combat loot, selling, gifts
Uses: Vendors, crafting, bribes, purchases

Tracked Items: Quest items, special equipment, relics
Not Tracked: Consumables (narrative only)
Equipment Slots: 2 hands default (story can modify)
Item Logic: Story-appropriate, no duplicate slots (e.g., 1 hat)
Item Effects: [Stat boosts, abilities, usage limits]
Rarity Tiers: [Yes/No - if yes, list tiers]

=== ABILITIES & MAGIC ===
Source: Narrator creates fitting abilities
Usage Limits: [Per rest / Per day / Passive]
Magic Style: [Open creative / Structured]

=== CRAFTING & GATHERING ===
DC System: Easy materials=DC10, Rare=DC16+
Balance: Good items need resources/quests
Sources: Quest/Exploration/Vendors
Priority: [Low / Medium / High]

=== SOCIAL MECHANICS ===
Method: Dialogue choices + free text
Resolution: [DC-based rolls / Pure choice outcomes]
Skills: Persuasion, deception, intimidation, brute force

=== RELATIONSHIP POINTS (Per NPC) ===
Range: 0-100+
Gain From: Attention, aligned choices, quests, gifts
Milestones: 50=Friend, 100=Romance/Deep Bond
Progression Speed: [Slow / Moderate / Fast]
Display: On-demand fetch (not always visible)

=== HAZARDS & TRAPS ===
Detection: DM hints, perception checks
Failure: Damage, harder encounters, complications
Style: Open creative freedom

When all areas are covered, say: "Rules look complete! Ready to move on? Click Next when ready."

Respond in JSON format:
{
  "message": "Your conversational response",
  "livingFile": "Updated rules in format above",
  "coverageComplete": true/false
}`,
    step2: `You are a World Building Assistant helping create NPCs & Factions for a D&D-style adventure.

IMPORTANT CONTEXT:
- This game features romance and adult encounters
- Physical descriptions must be VIVID and DETAILED
- NPCs can have romantic/intimate storylines
- Appearance descriptions are crucial for immersion and consistency

REQUIRED COVERAGE (ask proactive questions):

1. KEY NPCs (Pre-define 3-5 foundational characters)
   - More NPCs will emerge during gameplay
   - Any NPC can become "key" if player focuses on them
   - Ask: How many key NPCs to start with? (Recommend 3-5)

   FOR EACH KEY NPC, EXTRACT:

   A. BASIC INFO
      - Name
      - Role: Quest giver, companion, vendor, rival, romance option, antagonist
      - Race: Human, elf, dwarf, custom, etc.
      - Origin: Where from, brief background

   B. STORY & PERSONALITY (1-2 paragraphs)
      - Their history and motivations
      - Core values and beliefs
      - Behavior patterns and mannerisms
      - Connection to main story/objective

   C. PHYSICAL APPEARANCE (DETAILED & VIVID - CRITICAL FOR ROMANCE!)
      This is a mature text adventure with romance and intimate scenes.
      Physical descriptions MUST be thorough and evocative.

      - Height: Specific (e.g., 5'8", 6'2") or relative
      - Build & Physique: Be specific about body type
        * Muscular, slender, curvy, athletic, lean, stocky, voluptuous, toned, etc.
        * For romance-capable NPCs: Describe figure, curves, physical presence
        * Key romantic features: Body shape, proportions, attractiveness
      - Distinct Features:
        * Hair: Color, length, style, texture
        * Eyes: Color, shape, expression, intensity
        * Face: Beauty, jawline, lips, expressions
        * Body details: Curves, muscle definition, skin tone, distinctive marks
        * Scars, tattoos, birthmarks (what story do they tell?)
        * Clothing style: How they dress, what it reveals/conceals
      - Romantic Physique (for romance-capable NPCs):
        * Describe curves, plumpness, or other key attractive features
        * Bust, waist, hips (if relevant to character)
        * Physical presence and allure
        * What makes them physically appealing or unique?
      - Full Description: 3-4 vivid sentences
        * Paint a complete picture of their physical presence
        * Focus on details that matter for romance and intimacy
        * Be descriptive, sensual where appropriate, but tasteful
        * Capture their physical magnetism or attractiveness

   D. RELATIONSHIP SYSTEM
      - Starting Relationship Points:
        * Allies/Friends: +20 to +50
        * Neutral: 0 (strangers, acquaintances)
        * Rivals: -10 to -30
        * Enemies: -40 to -80 (negative = aggressive, hard to befriend)

      - Romance Available: Yes/No

      - Relationship Progression (How points increase):
        * Pay attention to NPC dialogue: +2 to +5 per meaningful interaction
        * Aligned dialogue choices: +3 to +10 (choices matching NPC values)
        * Complete quests together: +10 to +30
        * Gift-giving: +5 to +20 (depends on gift quality/relevance)
        * Saving their life / major story moments: +20 to +50
        * Negative actions (betrayal, opposing values): -10 to -50

      - Romance Progression Milestones:
        * 0-30: Strangers/Acquaintances (no romance)
        * 30-50: Friendly, light flirtation possible
        * 50-75: Friend/Trusted ally, deeper flirtation unlocked
        * 75-100: Close bond, romantic interest acknowledged
        * 100: ROMANCE THRESHOLD - can initiate romantic relationship
        * 100-150: Dating/courting phase, intimate moments (kissing, touching)
        * 150: MATURE THRESHOLD - deep romance, consummation available (NO FADE TO BLACK)
        * 150+: Committed relationship, ongoing intimate encounters

      - Gate-keeping: Cannot jump to mature content without earning points
        * Trying romance before 100 points = rejection or awkwardness
        * Trying mature content before 150 points = NPC stops you
        * Progression must feel earned through story and choices

      - Personality Traits: 3-5 key traits (loyal, stubborn, flirtatious, cold, compassionate, etc.)

   E. COMPANION STATS (if recruitable - max 2 companions in party)
      - Recruitable: Yes/No
      - Stat Bonuses: Match their story and power level
        * Quest giver (non-combatant): Limited (+1 CHA only)
        * Skilled rogue: Moderate (+3 DEX, +1 WIS)
        * Legendary warrior: High (+4 STR, +3 CON, +2 DEX)
        * Scholar: (+2 INT, +2 WIS)
      - Special Ability: What they bring to the party
        * Examples: "Lockpicking expert", "Combat tank", "Healing magic", "Stealth master"
      - Bonus Justification: Why these stats? (e.g., "Trained assassin = high DEX")

2. FACTIONS
   - Major organizations, groups, or powers in the world
   - 2-4 factions recommended
   - Ask: Should factions have influence/power scores?

   FOR EACH FACTION, EXTRACT:
   - Name
   - Type: Guild, kingdom, cult, resistance, corporation, etc.
   - Goal: What they want to achieve
   - Resources: Military, wealth, magic, influence, etc.
   - Allegiance: Allied with player, neutral, or opposing?
   - Key Members: Which NPCs belong to this faction?
   - Conflict: How do they oppose/support main objective?

3. RELATIONSHIPS & ROMANCE MECHANICS
   This game features meaningful relationship progression and mature content.

   - Relationship Point System: 0-150+ (can go negative for enemies)
   - Romance Milestones:
     * 100 points: Romance threshold - can initiate relationship
     * 150 points: Mature threshold - intimate encounters unlocked (NO FADE TO BLACK)
   - Point Progression: Similar to combat - clear rules for gaining/losing points
   - Gate-keeping: Must earn progression - cannot jump to intimacy without building relationship
   - Neutral start: Some NPCs start at 0 points (strangers)

   Ask about:
   - Should romance be central to the story or optional side content?
   - Any specific romance preferences or restrictions?
   - Should there be multiple romance options or exclusive relationships?

YOUR APPROACH:
- Start by asking how many NPCs they want to pre-define
- For each NPC, ask detailed questions about appearance, personality, role
- Emphasize physical descriptions - be thorough and vivid
- Ensure stat bonuses match character backstory
- Create diverse, interesting characters
- Balance ally/enemy starting relationships

LIVING FILE FORMAT (AI-Optimized):

=== KEY NPCs ===

--- [NPC Name 1] ---
Role: [Role type]
Race: [Race]
Origin: [Background]

Story: [1-2 paragraphs about history, motivations, values, behavior]

Physical Appearance:
Height: [Specific/relative]
Build: [Body type - be specific about physique]
Hair: [Color, length, style, texture]
Eyes: [Color, shape, expression]
Face: [Beauty, distinctive features]
Body: [Figure, curves, muscle definition, skin tone]
Romantic Physique: [Key attractive features - curves, proportions, allure]
Clothing: [Style, what it reveals/conceals]
Full Description: [3-4 vivid sentences capturing complete physical presence and attractiveness]

Relationship:
Starting Points: [Number with +/- or 0 for neutral]
Romance: [Yes/No]
Traits: [Trait 1, Trait 2, Trait 3, Trait 4, Trait 5]

Romance Progression (if Romance: Yes):
Point Gains: Dialogue +2-5, Aligned choices +3-10, Quests +10-30, Gifts +5-20, Major moments +20-50
Milestones: 0-30 Strangers, 50-75 Friend, 100 Romance Start, 150 Mature Content Unlocked
Gate-keeping: Must earn points - cannot skip to intimacy

Companion (if recruitable):
Recruitable: [Yes/No]
Stat Bonuses: [+X STAT, +Y STAT...]
Special Ability: [Description]
Justification: [Why these bonuses match their story]

--- [NPC Name 2] ---
[Repeat format...]

=== FACTIONS ===

--- [Faction Name 1] ---
Type: [Organization type]
Goal: [What they want]
Resources: [What they control]
Allegiance: [Allied/Neutral/Opposing]
Key Members: [NPCs in this faction]
Conflict: [How they relate to main objective]

--- [Faction Name 2] ---
[Repeat format...]

=== ROMANCE SYSTEM ===
Importance: [Central to story / Optional side content]
Restrictions: [Any limits or preferences]
Mature Content: Yes - adult encounters available at 100+ relationship points

When all NPCs and factions are defined, say: "NPCs and Factions look complete! Ready to move on? Click Next when ready."

Respond in JSON format:
{
  "message": "Your conversational response",
  "livingFile": "Updated NPCs/Factions in format above",
  "coverageComplete": true/false
}`,
    step3: `Placeholder for Character Creation guidelines`
  };

  // Load guidelines from localStorage or use defaults
  const guidelines = {
    step0: localStorage.getItem('wizard_guideline_step0') || defaultGuidelines.step0,
    step1: localStorage.getItem('wizard_guideline_step1') || defaultGuidelines.step1,
    step2: localStorage.getItem('wizard_guideline_step2') || defaultGuidelines.step2,
    step3: localStorage.getItem('wizard_guideline_step3') || defaultGuidelines.step3
  };

  // State to track wizard data across steps
  const wizardData = {
    // Legacy fields (for Steps 2-4 that still use old UI)
    theme: "",
    toneTags: "",
    inspirations: "",
    specialRules: "",
    npcs: "",
    factions: "",
    conflicts: "",
    characterName: "",
    characterConcept: "",
    stats: "",

    // New chat-based data
    livingFiles: {
      step0: localStorage.getItem('wizard_livingFile_step0') || "",
      step1: localStorage.getItem('wizard_livingFile_step1') || "",
      step2: localStorage.getItem('wizard_livingFile_step2') || "",
      step3: localStorage.getItem('wizard_livingFile_step3') || ""
    },

    // Chat history for each step
    chatHistory: {
      step0: JSON.parse(localStorage.getItem('wizard_chat_step0') || '[]'),
      step1: [],
      step2: [],
      step3: []
    },

    // Store existing world ID if editing
    worldId: null
  };

  // If editing existing world, restore data
  if (existingWorldData) {
    wizardData.worldId = existingWorldData.id;
    wizardData.livingFiles.step0 = existingWorldData.themeAndTone || "";
    wizardData.livingFiles.step1 = existingWorldData.rulesAndMechanics || "";
    wizardData.livingFiles.step2 = existingWorldData.npcsAndFactions || "";
    wizardData.livingFiles.step3 = existingWorldData.character || "";
    wizardData.characterName = existingWorldData.characterName || "";
    wizardData.characterConcept = existingWorldData.characterConcept || "";
    wizardData.stats = existingWorldData.stats || "";

    // Update localStorage with restored data
    localStorage.setItem('wizard_livingFile_step0', wizardData.livingFiles.step0);
    localStorage.setItem('wizard_livingFile_step1', wizardData.livingFiles.step1);
    localStorage.setItem('wizard_livingFile_step2', wizardData.livingFiles.step2);
    localStorage.setItem('wizard_livingFile_step3', wizardData.livingFiles.step3);
  }

  container.innerHTML = `
    <div class="wizard">
      <!-- Sidebar -->
      <div class="wizard-sidebar">
        <h3>Progress</h3>
        <ol id="wizardSteps" class="wizard-steps"></ol>
        <p class="muted">Click any step to jump.</p>
      </div>

      <!-- Main Content -->
      <div style="flex:1; display:flex; flex-direction:column;">
        <div class="wizard-main">
          <!-- Left: Conversation -->
          <div class="panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h2 id="convoTitle">Conversation</h2>
              <button id="guidelineBtn" style="padding: 4px 10px; background: #2a2a2a; color: #888; border: 1px solid #444; border-radius: 4px; font-size: 12px; cursor: pointer; display: none;">⚙️ Edit Guidelines</button>
            </div>
            <div id="convoBody" class="muted"></div>
            <div id="inputArea" style="margin-top: 20px;"></div>
          </div>
          <!-- Right: Living File -->
          <div class="panel">
            <h2>Living File</h2>
            <div id="fileBody" class="muted" style="white-space: pre-wrap; line-height: 1.8; font-family: monospace; font-size: 14px;"></div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="button-bar">
          <button id="backBtn">Back</button>
          <button id="nextBtn">Next</button>
        </div>
      </div>
    </div>
  `;

  const el = {
    steps: container.querySelector("#wizardSteps"),
    convoTitle: container.querySelector("#convoTitle"),
    convoBody: container.querySelector("#convoBody"),
    inputArea: container.querySelector("#inputArea"),
    fileBody: container.querySelector("#fileBody"),
    backBtn: container.querySelector("#backBtn"),
    nextBtn: container.querySelector("#nextBtn"),
    guidelineBtn: container.querySelector("#guidelineBtn")
  };

  function renderSteps() {
    el.steps.innerHTML = steps
      .map(
        (s, idx) =>
          `<li data-idx="${idx}" class="${idx === currentStep ? "active-step" : ""}">${idx + 1}. ${s.title}</li>`
      )
      .join("");
    // Click to jump
    el.steps.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        currentStep = Number(li.getAttribute("data-idx"));
        render();
      });
    });
  }

  function contentFor(stepIdx) {
    switch (stepIdx) {
      case 0:
        // Chat-based UI for Step 1
        return {
          convoTitle: "World Context (Theme, Tone & Objectives)",
          useChatUI: true,
          initialPlaceholder: "Let's build your adventure world! Tell me about your world idea - the setting, the main conflict, what the story is about, or any inspirations you have..."
        };
      case 1:
        return {
          convoTitle: "Rules & Mechanics",
          useChatUI: true,
          initialPlaceholder: "Let's define how your game works! Tell me your preferences for combat, progression, inventory, or accept defaults..."
        };
      case 2:
        return {
          convoTitle: "NPCs & Factions",
          convoBody:
            "List a few key NPCs (ally/rival/romance) and at least one faction with a goal.",
          fields: [
            { key: "npcs", label: "Key NPCs", placeholder: "e.g., Elara (ally, scholar)" },
            { key: "factions", label: "Factions", placeholder: "e.g., The Shadow Court" },
            { key: "conflicts", label: "Conflicts", placeholder: "e.g., War between realms" }
          ]
        };
      case 3:
        return {
          convoTitle: "Character Creation",
          convoBody:
            "Pick your character concept and 6 stats. We'll balance with AI later.",
          fields: [
            { key: "characterName", label: "Name", placeholder: "e.g., Kael" },
            { key: "characterConcept", label: "Class/Concept", placeholder: "e.g., Rogue investigator" },
            { key: "stats", label: "Stats (STR/DEX/CON/INT/WIS/CHA)", placeholder: "e.g., 10/16/12/14/13/15" }
          ]
        };
      default:
        return { convoTitle: "Conversation", convoBody: "", fields: [] };
    }
  }

  function getLivingFileContent() {
    switch (currentStep) {
      case 0:
        // Use AI-generated living file for Step 0
        return wizardData.livingFiles.step0 || "(Chat with the World Building Assistant to create your world's theme and tone...)";
      case 1:
        // Use AI-generated living file for Step 1
        return wizardData.livingFiles.step1 || "(Chat with the World Building Assistant to define your game rules and mechanics...)";
      case 2:
        return `- Key NPCs: ${wizardData.npcs || "(empty)"}\n- Factions: ${wizardData.factions || "(empty)"}\n- Conflicts: ${wizardData.conflicts || "(empty)"}`;
      case 3:
        return `- Name: ${wizardData.characterName || "(empty)"}\n- Class/Concept: ${wizardData.characterConcept || "(empty)"}\n- Stats (STR/DEX/CON/INT/WIS/CHA): ${wizardData.stats || "(empty)"}`;
      default:
        return "";
    }
  }

  function renderMain() {
    const c = contentFor(currentStep);
    el.convoTitle.textContent = c.convoTitle;

    // Show/hide guideline button for chat-based steps
    if (c.useChatUI) {
      el.guidelineBtn.style.display = 'block';
    } else {
      el.guidelineBtn.style.display = 'none';
    }

    if (c.useChatUI) {
      // Chat-based UI (for Step 0)
      renderChatUI(c);
    } else {
      // Field-based UI (for Steps 1-3)
      el.convoBody.textContent = c.convoBody;

      // Render input fields
      el.inputArea.innerHTML = c.fields.map(field => `
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; color: #e0e0e0;">${field.label}</label>
          <input
            type="text"
            data-key="${field.key}"
            value="${wizardData[field.key]}"
            placeholder="${field.placeholder}"
            style="width: 100%; padding: 8px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;"
          />
        </div>
      `).join("");

      // Attach input listeners
      el.inputArea.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
          const key = e.target.getAttribute("data-key");
          wizardData[key] = e.target.value;
          updateLivingFile();
        });
      });
    }

    // Update Living File
    updateLivingFile();

    // Buttons state
    el.backBtn.disabled = currentStep === 0;
    el.nextBtn.textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
  }

  function renderChatUI(config) {
    const stepKey = `step${currentStep}`;
    const chatHistory = wizardData.chatHistory[stepKey];

    // Clear convoBody
    el.convoBody.innerHTML = '';

    // Render chat messages
    const chatContainer = document.createElement('div');
    chatContainer.style.cssText = 'max-height: 400px; overflow-y: auto; margin-bottom: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px;';

    if (chatHistory.length === 0) {
      // Initial assistant message - different for each step
      let welcomeMessage = "";

      if (currentStep === 0) {
        welcomeMessage = `Welcome! I'll help you build the world context for your adventure.

We'll cover: premise & conflict origin, objectives (win/lose conditions), setting & key locations, tone & narrative style, and opposing forces.

Let's start - what kind of adventure world do you have in mind? Share your ideas about the setting, the main story, or any inspirations!`;
      } else if (currentStep === 1) {
        welcomeMessage = `Welcome! I'll help you define the rules and mechanics for your game.

We'll cover: combat system, companion mechanics, progression (XP & leveling), inventory, abilities, crafting, social interactions, relationships, and hazards.

I can offer balanced defaults or customize everything to your preference. What's your vision for how the game should play?`;
      }

      chatContainer.innerHTML = `
        <div style="margin-bottom: 15px;">
          <div style="color: #888; font-size: 12px; margin-bottom: 5px;">🤖 World Building Assistant</div>
          <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; color: #e0e0e0; line-height: 1.6;">
            ${welcomeMessage}
          </div>
        </div>
      `;
    } else {
      // Render existing chat history
      chatHistory.forEach(msg => {
        const isUser = msg.role === 'user';

        // Create message element
        const msgDiv = document.createElement('div');
        msgDiv.style.marginBottom = '15px';

        const labelDiv = document.createElement('div');
        labelDiv.style.cssText = 'color: #888; font-size: 12px; margin-bottom: 5px;';
        labelDiv.textContent = isUser ? '👤 You' : '🤖 World Building Assistant';

        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `background: ${isUser ? '#1e3a5f' : '#2a2a2a'}; padding: 10px; border-radius: 4px; color: #e0e0e0; white-space: pre-wrap; line-height: 1.6;`;
        contentDiv.textContent = msg.content; // Use textContent to preserve line breaks

        msgDiv.appendChild(labelDiv);
        msgDiv.appendChild(contentDiv);
        chatContainer.appendChild(msgDiv);
      });

      // Auto-scroll to bottom
      setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 0);
    }

    el.convoBody.appendChild(chatContainer);

    // Render input area
    el.inputArea.innerHTML = `
      <div style="display: flex; gap: 10px;">
        <textarea
          id="chatInput"
          placeholder="${config.initialPlaceholder}"
          style="flex: 1; padding: 10px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; resize: vertical; min-height: 80px; font-family: inherit;"
        ></textarea>
        <button id="sendBtn" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Send</button>
      </div>
      <div id="loadingIndicator" style="margin-top: 10px; color: #888; font-size: 14px; display: none;">
        <span>🤖 Assistant is thinking</span>
        <span class="dots" style="display: inline-block; width: 20px; text-align: left;">...</span>
      </div>
    `;

    const chatInput = el.inputArea.querySelector('#chatInput');
    const sendBtn = el.inputArea.querySelector('#sendBtn');
    const loadingIndicator = el.inputArea.querySelector('#loadingIndicator');

    // Send message handler
    async function handleSend() {
      const userMessage = chatInput.value.trim();
      if (!userMessage) return;

      // Disable input and show loading BEFORE adding to chat
      const originalValue = chatInput.value;
      chatInput.value = '';
      chatInput.disabled = true;
      sendBtn.disabled = true;

      // Add user message to chat
      wizardData.chatHistory[stepKey].push({ role: 'user', content: userMessage });

      // Save to localStorage
      localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

      // Re-render to show user message AND loading indicator
      renderChatUI(config);

      // Force the loading indicator to show (it gets recreated in renderChatUI)
      const newLoadingIndicator = el.inputArea.querySelector('#loadingIndicator');
      if (newLoadingIndicator) {
        newLoadingIndicator.style.display = 'block';
      }

      try {
        // Call AI to get response
        const response = await callWorldBuildingAssistant(stepKey, userMessage);

        // Add assistant response to chat
        wizardData.chatHistory[stepKey].push({ role: 'assistant', content: response.message });

        // Update living file
        if (response.livingFile) {
          wizardData.livingFiles[stepKey] = response.livingFile;
          localStorage.setItem(`wizard_livingFile_${stepKey}`, response.livingFile);
        }

        // Save chat history
        localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

        // Re-render
        updateLivingFile();
        renderChatUI(config);

      } catch (error) {
        alert(`Error: ${error.message}`);
        // Remove the user message on error
        wizardData.chatHistory[stepKey].pop();
        localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));
        renderChatUI(config);
      }
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }

  async function callWorldBuildingAssistant(stepKey, userMessage) {
    // Get API key
    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      throw new Error("No API key found. Please add your OpenAI API key in Settings.");
    }

    // Build context: existing Living Files from other steps
    const contextualInfo = [];
    if (wizardData.livingFiles.step1 && stepKey !== 'step1') contextualInfo.push(`Rules & Mechanics:\n${wizardData.livingFiles.step1}`);
    if (wizardData.livingFiles.step2 && stepKey !== 'step2') contextualInfo.push(`NPCs & Factions:\n${wizardData.livingFiles.step2}`);
    if (wizardData.livingFiles.step3 && stepKey !== 'step3') contextualInfo.push(`Character:\n${wizardData.livingFiles.step3}`);

    const contextSection = contextualInfo.length > 0
      ? `\n\nEXISTING WORLD CONTEXT (reference this for consistency):\n${contextualInfo.join('\n\n')}`
      : '';

    // Build chat history for context
    const chatHistory = wizardData.chatHistory[stepKey];
    const previousMessages = chatHistory.slice(-6); // Last 6 messages for context

    const messages = [
      { role: "system", content: guidelines[stepKey] + contextSection },
      ...previousMessages,
      { role: "user", content: userMessage }
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-5-mini-2025-08-07",
          messages: messages,
          max_completion_tokens: 3500
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const messageContent = data.choices[0].message.content;

      if (!messageContent || messageContent.trim() === "") {
        throw new Error("AI returned an empty response. Please try again.");
      }

      // Parse JSON response
      let result;
      try {
        result = JSON.parse(messageContent);
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error("AI returned invalid JSON format. Please try again.");
        }
      }

      return {
        message: result.message || "I'm here to help build your world!",
        livingFile: result.livingFile || wizardData.livingFiles[stepKey],
        coverageComplete: result.coverageComplete || false
      };

    } catch (error) {
      console.error("World Building AI Error:", error);
      throw error;
    }
  }

  function showGuidelineEditor() {
    const stepKey = `step${currentStep}`;

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 1000;';

    modal.innerHTML = `
      <div style="background: #1e1e1e; padding: 30px; border-radius: 8px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto;">
        <h2 style="margin-top: 0; color: #e0e0e0;">Edit Guidelines - ${steps[currentStep].title}</h2>
        <p style="color: #888; font-size: 14px; margin-bottom: 20px;">
          These guidelines define how the AI assistant helps you build this section. Advanced users can customize this to change the AI's behavior.
        </p>
        <textarea
          id="guidelineTextarea"
          style="width: 100%; min-height: 300px; padding: 15px; background: #0d0d0d; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; font-family: monospace; font-size: 13px; resize: vertical;"
        >${guidelines[stepKey]}</textarea>
        <div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
          <button id="resetBtn" style="padding: 10px 20px; background: #444; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">Reset to Default</button>
          <button id="cancelBtn" style="padding: 10px 20px; background: #555; color: #e0e0e0; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
          <button id="saveGuidelineBtn" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Save</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const textarea = modal.querySelector('#guidelineTextarea');
    const saveBtn = modal.querySelector('#saveGuidelineBtn');
    const cancelBtn = modal.querySelector('#cancelBtn');
    const resetBtn = modal.querySelector('#resetBtn');

    function closeModal() {
      document.body.removeChild(modal);
    }

    saveBtn.addEventListener('click', () => {
      const newGuideline = textarea.value.trim();
      if (newGuideline) {
        guidelines[stepKey] = newGuideline;
        localStorage.setItem(`wizard_guideline_${stepKey}`, newGuideline);
        alert('Guidelines saved!');
        closeModal();
      }
    });

    cancelBtn.addEventListener('click', closeModal);

    resetBtn.addEventListener('click', () => {
      if (confirm('Reset to default guidelines? This will erase your custom guidelines.')) {
        textarea.value = defaultGuidelines[stepKey];
      }
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  function updateLivingFile() {
    const content = getLivingFileContent();

    // For chat-based steps, render with formatting
    if ((currentStep === 0 || currentStep === 1) && wizardData.livingFiles[`step${currentStep}`]) {
      el.fileBody.innerHTML = formatLivingFile(content);
    } else {
      el.fileBody.textContent = content;
    }
  }

  function formatLivingFile(text) {
    // Parse and format Living File with colors and bold
    const lines = text.split('\n');
    let formattedHTML = '';

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        formattedHTML += '<br>';
        return;
      }

      // Check if line has a label (e.g., "Theme:", "Tone:", etc.)
      const labelMatch = trimmed.match(/^([^:]+):\s*(.*)$/);

      if (labelMatch) {
        const label = labelMatch[1];
        const value = labelMatch[2];
        formattedHTML += `<div style="margin-bottom: 8px;">
          <span style="color: #d97706; font-weight: bold;">${label}:</span>
          <span style="color: #e0e0e0;">${value || '<span style="color: #666;">(empty)</span>'}</span>
        </div>`;
      } else {
        // Regular line without label
        formattedHTML += `<div style="margin-bottom: 4px; color: #e0e0e0;">${trimmed}</div>`;
      }
    });

    return formattedHTML || '<span style="color: #666;">Chat with the World Building Assistant to create your world\'s theme and tone...</span>';
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
    } else {
      // Finish: Save world and navigate to Main Game UI
      saveWorld();
    }
  });

  function saveWorld() {
    // Use existing world ID if editing, otherwise create new
    const isEditing = !!wizardData.worldId;
    const worldId = wizardData.worldId || `world_${Date.now()}`;

    // Load existing world data if editing
    let existingData = {};
    if (isEditing) {
      existingData = JSON.parse(localStorage.getItem(worldId) || '{}');
    }

    // Compile complete world data
    const worldData = {
      id: worldId,
      worldName: extractWorldName(), // Extract from living file or default
      playerLevel: existingData.playerLevel || 1, // Preserve level if editing
      turnCount: existingData.turnCount || 0, // Preserve turn count if editing
      createdAt: existingData.createdAt || new Date().toISOString(),
      lastPlayed: new Date().toISOString(),

      // Living Files (all world building data)
      themeAndTone: wizardData.livingFiles.step0 || "",
      rulesAndMechanics: wizardData.livingFiles.step1 || wizardData.specialRules || "",
      npcsAndFactions: wizardData.livingFiles.step2 || `NPCs: ${wizardData.npcs}\nFactions: ${wizardData.factions}\nConflicts: ${wizardData.conflicts}`,
      character: wizardData.livingFiles.step3 || `Name: ${wizardData.characterName}\nClass: ${wizardData.characterConcept}\nStats: ${wizardData.stats}`,

      // Legacy fields for backward compatibility
      characterName: wizardData.characterName || "Adventurer",
      characterConcept: wizardData.characterConcept || "Hero",
      stats: wizardData.stats || "10/10/10/10/10/10",

      // Preserve scene log if editing
      sceneLog: existingData.sceneLog || []
    };

    // Save to localStorage
    localStorage.setItem(worldId, JSON.stringify(worldData));

    // Add to saved worlds list (only if new)
    if (!isEditing) {
      const savedWorldsList = JSON.parse(localStorage.getItem('saved_worlds_list') || '[]');
      savedWorldsList.push(worldId);
      localStorage.setItem('saved_worlds_list', JSON.stringify(savedWorldsList));
    }

    console.log(isEditing ? "World updated:" : "World saved:", worldData);

    // Navigate to game UI
    import("./gameUI.js")
      .then(({ renderGameUI }) => {
        renderGameUI(container, worldData);
      })
      .catch(err => {
        console.error("Failed to load gameUI.js:", err);
        alert("Error loading game UI. Check console for details.");
      });
  }

  function extractWorldName() {
    // Try to extract world name from Theme & Tone living file
    const themeContent = wizardData.livingFiles.step0;
    if (themeContent) {
      const nameMatch = themeContent.match(/(?:World Name|Name|Title):\s*([^\n]+)/i);
      if (nameMatch) return nameMatch[1].trim();

      const themeMatch = themeContent.match(/Theme:\s*([^\n]+)/i);
      if (themeMatch) return themeMatch[1].trim().substring(0, 30); // First 30 chars of theme
    }

    // Fallback to character name
    return wizardData.characterName ? `${wizardData.characterName}'s Adventure` : "Untitled World";
  }

  el.guidelineBtn.addEventListener("click", () => {
    showGuidelineEditor();
  });

  // Initial paint
  render();
}
