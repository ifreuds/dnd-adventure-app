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
- **World Creation Wizard** - 4-step wizard with input fields and live-updating Living File
  - Step 1: Theme & Tone (3 input fields)
  - Step 2: Rules & Mechanics (1 input field)
  - Step 3: NPCs & Factions (3 input fields)
  - Step 4: Character Creation (3 input fields)
  - Data persists across step navigation
  - Finishes into Main Game UI with wizard data
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

### ⚙️ Partially Implemented (Backend Integration)
- **GPT API integration** - ✅ Working!
  - Model: `gpt-5-mini-2025-08-07`
  - Settings modal for API key (stored in localStorage)
  - Scene log tracking (last 10 turns)
  - Dice roll integration with GPT outcomes
  - **Known issues with GPT-5-mini:**
    - Cannot use `response_format: { type: "json_object" }` - causes empty responses
    - Cannot customize `temperature` - only default (1) supported
    - Uses `max_completion_tokens` instead of `max_tokens`
    - Reasoning tokens can consume all tokens if not careful
- **Supabase database connection** - ❌ Not yet connected (placeholder save/load)
- **Image generation API** - ❌ Using placeholder images
- **Autosave system** - ❌ Not yet implemented (every turn + checkpoint saves)
- **Romance mode AI** - ❌ Shows warning, not implemented

---

## Next Steps
1. ✅ ~~**Connect GPT API**~~ - DONE! Working with gpt-5-mini-2025-08-07
2. **Improve GPT Integration** - Fine-tune prompts for better JSON output reliability
3. **Connect Supabase** - Implement save/load system (Scene Log, Save File, Progress Summary)
4. **Wire up Image Generation API** - Real image generation from prompts
5. **Implement Autosave** - Every turn + checkpoint (20 turns) saves
6. **Add Romance Mode AI** - Separate model for mature content
7. **Polish & Testing** - End-to-end gameplay testing

## Session Notes (for next session)
- GPT-5-mini integration working but needs prompt refinement for better JSON parsing
- User has API key set up and working
- Next: Either improve GPT prompts OR move to Supabase integration  
