# DnD-Style AI Adventure Game

## Project Goal
A browser-based, modular **text-adventure RPG** inspired by D&D.  
- GPT API acts as the **Dungeon Master (DM)**.  
- Player explores story scenes, makes choices, rolls dice.  
- **Autosave + load** ensures continuity across sessions.  
- **Romance Mode** available as optional toggle (uses separate AI model).  
- Hosted online, playable anywhere with shared saves.

---

## Project Links
- GitHub Repo: https://github.com/ifreuds/dnd-adventure-app  
- Live App (Vercel): https://dnd-adventure-app.vercel.app/  

---

## User Flow (v3)

### Entry Flow
- On launch, app shows **two buttons only**:  
  1. New World  
  2. Load World  

### New World → Creation Wizard
- Right Sidebar: Progress Tracker (clickable steps)  
  1. World Theme & Tone  
  2. Rules & Mechanics  
  3. NPCs & Factions  
  4. Character Creation  

- Main Area: split into two panels  
  - Left = Conversation Panel → user input + AI proposals  
  - Right = Living File → structured summary updated live  

- Navigation:  
  - Next/Back buttons  
  - Autosave draft each step  
  - Finalization creates Save File + Progress Summary + empty Scene Log  

### Main Game UI
- Center: Chat-style narration (2–3 paragraphs) → “What do you do?”  
  - 3 AI-generated choices  
  - 1 free text input  

- Right Sidebar:  
  - Character info (name, stats, HP, abilities)  
  - Dice panel (d20 only, AI signals when active)  

- Top Bar:  
  - Settings (return to Wizard)  
  - Mode toggle (Normal GPT / Romance AI)  
  - Generate Image button  
  - Gallery (view saved images)  
  - Menu (return to Entry)  

### Game Flow Rules
- Every turn: narration → ends with choices → player acts → resolution.  
- Autosave every turn (Scene Log).  
- Checkpoint save every ~20 turns (Save File + Progress Summary).  
- Manual Save button available.  
- Fail forward: story continues even on failed rolls.  

---

## Core Design Concepts

### Dice & Rules
- Core check: d20 + stat vs DC (Easy 10 / Normal 13 / Hard 16).  
- Combat: d20 to hit, damage dice simple (1d6+Stat).  
- Standard 6 D&D stats (STR/DEX/CON/INT/WIS/CHA).  
- Death: either story continuation (revive/curse) or retry checkpoint.  

### Save & Memory System
1. Scene Log → rolling 8–10 turns, machine-readable JSON.  
2. Progress Summary → updated ~20 turns or big milestones.  
3. Save File → world info, characters, companions, inventory, flags, snapshot.  

### Companions & Relationships
- NPCs with personality tags.  
- Relationship score tracked in Save File.  
- NPCs can become companions or romances.  

### Romance Mode
- Toggle in UI.  
- Switches narration to Romance AI for mature encounters.  
- On exit, mini-summary updates Progress Summary + Save File.  

---

## Infrastructure

- GitHub → repo (code storage).  
- Vercel → hosting (auto-deploy on push).  
- Supabase → database (Scene Log, Save File, Progress Summary).  
- GPT API → Dungeon Master (story, choices, dice outcomes).  

**Data Flow:**  
1. Player acts → Frontend sends Scene Log + Save File to GPT.  
2. GPT replies with narration + choices.  
3. Frontend updates UI + writes Scene Log to Supabase.  
4. Every ~20 turns → checkpoint (Save File + Summary).  
5. Load World → fetch Supabase → resume with last Scene Log.  

---

## Repo Structure (v1)

/dnd-adventure-app
│
├── index.html # Entry point
├── /css
│ └── styles.css # Global styles (dark mode)
├── /assets # Images, icons
│
├── /js
│ ├── app.js # Orchestrates flow (entry → wizard → game)
│ ├── state.js # Holds current game state
│ │
│ ├── /ui # UI rendering only
│ │ ├── chat.js # Adventure chat window
│ │ ├── sidebar.js # Stats + dice panel
│ │ ├── topbar.js # Settings, Mode, Menu
│ │ └── utils.js # Small DOM helpers
│ │
│ ├── /components # Game logic per feature
│ │ ├── entry.js # Entry screen
│ │ ├── worldWizard.js# World creation wizard
│ │ ├── gameUI.js # Main gameplay loop
│ │ ├── romanceUI.js # Romance mode
│ │ ├── imageGen.js # Image generation
│ │ └── gallery.js # Image gallery
│ │
│ └── /services # External connections
│ ├── gpt.js # GPT API calls
│ ├── supabase.js # Supabase DB calls
│ └── imageService.js # Image AI

---

## Current Status

### ✅ Completed (Frontend Skeleton)
- **Entry Screen** - New World / Load World buttons with full navigation
- **World Creation Wizard** - ✅ **FULLY OVERHAULED** - Streamlined AI-assisted wizard
  - **Modular Architecture**: Split into separate files for maintainability
    - `worldWizard.js` (396 lines) - Main orchestrator
    - `wizardSteps/step0-theme.js` - Theme & Tone with pre-fill + AI expansion
    - `wizardSteps/step1-mechanics.js` - Rules & Mechanics (defaults auto-generated)
    - `wizardSteps/step2-npcs.js` - NPCs (number selection → AI creates profiles)
    - `wizardSteps/step3-character.js` - Character Creation with point-buy system
    - `wizardSteps/sharedChat.js` - Hybrid chat UI logic
    - `wizardSteps/aiAssistant.js` - GPT API integration with token logging
    - `wizardSteps/guidelines.js` (651 lines) - Comprehensive AI guidelines per step

  - **Step 0 (Theme & Tone)**: 7 areas auto-generated
    - Pre-fill: World Name, Genre, Conflict, Narrative Style (6 dropdown options)
    - AI creates: Premise, Objective, Setting, Locations (3-5), **Factions (2-4)**, Tone, **DM Narration Rules**
    - **DM Narration Rules**: Combat 1 para, Conversation 1-2 paras, Romance 2-3 paras, max 3 paras
    - No questions asked - complete draft on first response

  - **Step 1 (Rules & Mechanics)**: 10 areas auto-generated with balanced defaults
    - Choose: Balanced Defaults or Custom
    - AI creates: Core mechanics, **Fractional combat system**, Companions, **Streamlined XP (15,000 total)**, Inventory, Magic, Crafting, Social, Relationships, Hazards
    - **Combat**: Group enemies = combined HP, multiple attacks, cleave mechanics
    - **Death**: First=saved+debuff, Second+=permadeath (can continue)
    - **Progression**: +6 HP/level, +1 stat/level (19 total), XP 15k (was 76k)
    - No questions asked - complete rules on first response

  - **Step 2 (NPCs & Factions)**: Select count → AI creates all profiles
    - Select 3-6 NPCs
    - AI creates: Name, race, role, backstory, **concise physical description**, personality, starting relationship, companion stats, faction assignment
    - **All NPCs recruitable and romanceable** (no toggles)
    - Factions assigned from Step 0
    - No manual NPC list - AI generates everything

  - **Step 3 (Character Creation)**: Hybrid form + point-buy + AI backstory
    - Fill: Name, gender, race, class, goal
    - Point-buy: 27 points (stats 8-15)
    - AI creates: Backstory, racial bonuses, physical description, personality, abilities, equipment

  - **Auto-generation**: All steps auto-trigger AI on form submission
  - **Token Efficiency**: Removed redundancy, concise formats, ~200 lines saved
  - **Prompt Caching**: Automatic (90% discount on cached tokens)
  - **Guideline Editor**: Advanced users can customize AI behavior per step
  - Data persists across step navigation
  - Finishes into Main Game UI with 4 Living Files
- **Main Game UI** - Complete game interface
  - Chat-based narration with choice buttons + free text input
  - Character panel (name, class, HP, stats, skills/abilities)
  - Animated d20 dice roller (number cycling animation)
  - Top bar: Save, Settings, Mode, Image Gen, Gallery, Menu
- **Modal Systems**
  - Image Generation modal (text prompt → placeholder image → save to gallery)
  - Gallery modal (grid view of saved images)
  - Load World modal (list of saved games with metadata)
- **Navigation** - All flows working
  - Entry → Wizard → Game ✅
  - Entry → Load World → Game ✅
  - Game → Menu → Entry ✅
  - Game → Settings → Wizard ✅
- **Romance Mode** - Warning message (not yet implemented)

### ✅ Backend Integration - Complete
- **GPT API integration (Normal Mode)** - ✅ Working!
  - Model: `gpt-5-mini-2025-08-07`
  - Settings modal for API key (stored in localStorage)
  - Scene log tracking (last 10 turns)
  - Dice roll integration with outcomes
  - **Token Usage Logging**: Detailed console breakdown
    - Input tokens, output tokens, total tokens
    - Reasoning tokens (GPT-5-mini specific)
    - **Prompt caching detection**: Shows cached vs fresh tokens, calculates savings
    - Pricing: $0.25/1M input, $0.025/1M cached (90% discount!), $2/1M output
  - **Known GPT-5-mini quirks:**
    - Cannot use `response_format: { type: "json_object" }` - causes empty responses
    - Cannot customize `temperature` - only default (1) supported
    - Uses `max_completion_tokens` instead of `max_tokens`
    - Reasoning tokens (~2000) can consume all tokens if not careful
    - **World building limit**: 16,000 tokens (larger context for wizard)

- **Grok API integration (Mature Mode)** - ✅ Working!
  - Model: `grok-4-fast-reasoning`
  - Separate API key field in Settings modal
  - Supports JSON mode properly: `response_format: { type: "json_object" }`
  - Temperature: 0.8 for creative mature content
  - Seamless mode switching mid-game
  - **Visual indicators:**
    - Mode toggle button: "Mode: Normal" ↔ "Mode: Mature 🔞"
    - Loading indicator shows active DM: "🎲 GPT DM is thinking" or "🎲 Grok DM is thinking"
    - Console logs verify which API is called
  - Both APIs share same context (world, character, scene log)

### ⚙️ Partially Implemented
- **Dice Roll UI** - ✅ Enhanced with visual feedback
  - Compact info panel shows check type + DC when roll required
  - **Spoiler prevention**: Success/failure outcomes hidden before roll
  - Button pulses with orange glow animation
  - **Loading feedback**: "DM is thinking" shows after dice animation
  - Choices hidden until dice rolled (expected behavior)
  - **Token optimization**: Simplified context to prevent GPT-5-mini overflow

### ❌ Not Yet Implemented
- **Supabase database connection** - Placeholder save/load (js/services/supabase.js exists but empty)
- **Image generation API** - Using placeholder images (js/services/imageService.js exists but empty)
- **Autosave system** - Not yet implemented (every turn + checkpoint saves)

---

## Next Steps
1. ✅ ~~**Connect GPT API**~~ - DONE! Working with gpt-5-mini-2025-08-07
2. ✅ ~~**Add Mature Mode AI**~~ - DONE! Working with grok-4-fast-reasoning
3. ✅ ~~**Enhance Dice UI**~~ - DONE! Pulsing button + compact info panel
4. ✅ ~~**Overhaul World Creation Wizard**~~ - DONE! Complete guideline rewrite
5. ✅ ~~**Token Optimization**~~ - DONE! Prompt caching, concise formats, ~200 lines saved
6. **Test Wizard End-to-End** - Verify all 4 steps generate correctly
7. **Integrate Living Files into Game Context** - Pass 4 Living Files to gameplay DM
8. **Connect Supabase** - Implement save/load system (Scene Log, Save File, Progress Summary)
9. **Wire up Image Generation API** - Real image generation from prompts
10. **Implement Autosave** - Every turn + checkpoint (20 turns) saves

## Session Notes (Latest - Wizard Guidelines Overhaul)
- ✅ **Step 0 (Theme)**: Added factions (2-4), DM narration rules, removed questions → 7 areas total
- ✅ **Step 1 (Mechanics)**: XP 76k→15k, fractional combat, fixed HP +6/level, stats +1/level, removed questions
- ✅ **Step 2 (NPCs)**: Number selection only, AI creates all profiles, concise descriptions, all recruitable/romanceable
- ✅ **Step 3 (Character)**: Already optimal (hybrid form + point-buy + AI backstory)
- ✅ **Token Logging**: Detailed breakdown with cache detection (90% discount tracking)
- ✅ **Prompt Caching**: Automatic, no config needed, 90% discount on repeated input
- 📋 **Current Priority**: Test wizard end-to-end, then integrate 4 Living Files into game context
- 💡 **DM Narration Rules** now control gameplay pacing (combat 1 para, conversation 1-2, romance 2-3, max 3)
