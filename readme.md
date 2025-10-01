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
- Repo + hosting live.  
- Entry screen working.  
- World Creation Wizard skeleton implemented (sidebar + panels + navigation).  

---

## Next Steps
1. Add input field to Conversation Panel → update Living File live.  
2. Build Main Game UI skeleton (chat, sidebar, topbar).  
3. Connect GPT API (replace static placeholders).  
4. Connect Supabase (autosave + load).  
5. Add advanced features (Romance, Gallery, etc.).  
