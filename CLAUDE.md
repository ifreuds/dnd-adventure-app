# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

This is a vanilla JavaScript browser application with no build process.

- **Local Development**: Open `index.html` directly in a browser
- **Live Deployment**: Hosted on Vercel at https://dnd-adventure-app.vercel.app/
- **Auto-deploy**: Pushes to GitHub automatically deploy to Vercel

## Architecture Overview

### Core Module Structure

- **app.js** - Entry point that orchestrates application flow (entry screen → wizard → game)
- **state.js** - Central game state holder (currently minimal/empty, will expand)
- **/ui** - Pure rendering functions with no business logic (chat.js, sidebar.js, topbar.js, utils.js)
- **/components** - Feature-specific logic and UI orchestration (entry.js, worldWizard.js, gameUI.js, romanceUI.js, imageGen.js, gallery.js)
- **/services** - External API connections (gpt.js for GPT API, supabase.js for database, imageService.js for image generation)

### Navigation Flow

1. **Entry Screen** (`entry.js`) - Two buttons: "New World" or "Load World"
2. **World Creation Wizard** (`worldWizard.js`) - Four-step creation process with sidebar progress tracker, conversation panel, and living file panel
3. **Main Game UI** (`gameUI.js`) - Not yet implemented; will be chat-based narration with choice selection
4. **Special Modes** - Romance UI toggle, image generation, gallery viewing

## Data Architecture

### Three-Tier Save System

The game uses Supabase to persist three types of data:

1. **Scene Log** - Rolling 8-10 turn history in machine-readable JSON format; updated every turn
2. **Progress Summary** - Narrative summary updated every ~20 turns or at major milestones
3. **Save File** - Complete world state including character stats, companions, inventory, relationship scores, and story flags

**Data Flow**: Player action → Frontend sends Scene Log + Save File to GPT → GPT returns narration + choices → Frontend updates UI + writes to Supabase → Every ~20 turns creates checkpoint save

### GPT-as-Dungeon-Master Pattern

- GPT API acts as the game's Dungeon Master
- Each turn sends context (Scene Log + Save File) to GPT for narration generation
- GPT responds with 2-3 paragraphs of narration + 3 AI-generated choices
- Player can choose from suggested options or use free text input
- Romance Mode switches to a separate AI model for mature content, then summarizes back into main narrative

## World Creation Wizard

The wizard uses a **two-panel collaborative design**:

- **Left Panel (Conversation)**: Shows step description and input fields for user to fill out
- **Right Panel (Living File)**: Structured summary that updates in real-time as user types
- **Sidebar**: Shows 4 clickable steps (Theme & Tone → Rules & Mechanics → NPCs & Factions → Character Creation)
- **Navigation**: Back/Next buttons, data persists across steps, Finish button navigates to Main Game UI with wizard data

**Current implementation**: User fills input fields manually. **Future**: AI conversation to collaboratively build world via chat, with AI extracting structured data to Living File.

## Game Mechanics

### Dice & Combat System

- Core checks: d20 + stat modifier vs. DC (Easy 10, Normal 13, Hard 16)
- Standard 6 D&D stats (STR/DEX/CON/INT/WIS/CHA)
- Combat: d20 to hit, simple damage dice (e.g., 1d6+Stat)
- Death handling: Story continues (revival/curse) or retry from last checkpoint
- Fail forward philosophy: Failed rolls advance story, don't block progress

### Companion & Romance System

- NPCs tracked with personality tags and relationship scores in Save File
- NPCs can become companions or romance options
- Relationship progression affects story availability and dialogue

## Current Implementation Status

### ✅ Frontend Complete
- **Entry Screen** - New World and Load World buttons
- **World Wizard** - 4-step creation with input fields, live-updating Living File, data persistence across steps
- **Main Game UI** - Chat narration, choice buttons, free text input, character panel (stats + skills), animated d20 dice roller
- **Top Bar** - Save, Settings, Mode toggle, Image Gen, Gallery, Menu (all functional)
- **Modals** - Image generation modal, gallery modal, load world modal
- **Navigation** - All flows working (Entry ↔ Wizard ↔ Game)

### ✅ Backend Integration - GPT API
- **GPT API** - ✅ WORKING!
  - Location: `js/services/gpt.js`
  - Model: `gpt-5-mini-2025-08-07`
  - API key stored in localStorage (user enters via Settings modal)
  - System prompt includes world theme, character stats, recent scene log
  - Returns narration, choices, dice requirements
  - **Important GPT-5-mini quirks:**
    - ❌ Do NOT use `response_format: { type: "json_object" }` - causes empty responses with all tokens used for reasoning
    - ❌ Do NOT use `temperature` parameter - only default (1) is supported
    - ✅ Use `max_completion_tokens` (not `max_tokens`)
    - ✅ Set high token limit (2000+) to account for reasoning tokens
    - ✅ Parse JSON from response (handles both raw JSON and markdown code blocks)

### ✅ Backend Integration - Mature Mode (Grok API)
- **Grok API integration** - ✅ Working!
  - Model: `grok-4-fast-reasoning`
  - Endpoint: `https://api.x.ai/v1/chat/completions`
  - API key stored in localStorage (user enters via Settings modal)
  - Supports JSON mode: `response_format: { type: "json_object" }`
  - Temperature: 0.8 for creative mature content
  - **Mode Toggle**: Click "Mode: Normal" button to switch to "Mode: Mature 🔞"
  - **Visual indicators**:
    - DM badge shows which AI is responding ("🎲 GPT DM" or "🔞 Grok DM")
    - Loading indicator shows which DM is thinking (with spinner animation)
  - **Console logging**: Check browser console to verify which API is called
  - **Seamless switching**: Can toggle modes mid-game, all context flows to active DM

### ❌ Backend Integration - Not Yet Connected
- **Supabase** - Placeholder save/load (js/services/supabase.js exists but empty)
- **Image Generation API** - Using placeholder images (js/services/imageService.js exists but empty)
- **Autosave System** - Not yet implemented (every turn + checkpoint saves)

## UI Features

### Modals
All modals use overlay pattern (no full page replacement):
- **Image Generation Modal** - Textarea for prompt, generate button (2s delay), displays placeholder image, save to gallery
- **Gallery Modal** - Grid of saved images (150px thumbnails), click to view details, empty state message
- **Load World Modal** - List of saved worlds with metadata (character, turns, timestamp), load button per world

### Animations
- **Dice Roll**: Numbers cycle 1-20 at 80ms intervals (15 cycles), final result scales up 1.5x then back to 1x, color-coded by result (green 15+, orange 10-14, red <10)
- **Modal Fade-in**: 0.2s opacity fade + 0.3s slide-down from -50px

### Navigation Flow
- Entry → New World → Wizard (4 steps) → Game UI
- Entry → Load World → Modal (select save) → Game UI
- Game UI → Settings → Wizard (with current data)
- Game UI → Menu → Entry
- Game UI → Save (manual save alert)

## Code Patterns

- **Vanilla JavaScript** with ES6 modules (no framework, no build step)
- **Component pattern**: Each component exports a `render[ComponentName](container)` function
- **Modal pattern**: Created as DOM elements, appended to body, removed on close
- **Inline styles**: Minimal CSS in styles.css, some inline styles for layout
- **Event-driven navigation**: Components handle button clicks and call other render functions
- **Import-on-demand**: Dynamic imports used for navigation (e.g., `import("./entry.js").then(...)`)
- **State management**: Local variables in component scope (e.g., `wizardData`, `savedImages`, `sceneLog`)
- **API integration**: Async/await with fetch API, error handling with try/catch, localStorage for API keys

## GPT Integration Details

### API Call Flow
1. User takes action → `handlePlayerAction()` in gameUI.js
2. Build context object (world theme, character, scene log)
3. Route to appropriate API based on mode:
   - **Normal Mode** → `generateGptNarration(context)` from gpt.js (GPT-5-mini)
   - **Mature Mode** → `generateGrokNarration(context)` from grok.js (Grok-4-Fast)
4. AI returns JSON with narration, choices, dice requirements
5. Update UI with narration (shows DM badge: "🎲 GPT DM" or "🔞 Grok DM")
6. Add turn to scene log (max 10 turns)

### Scene Log Format
```javascript
{
  playerAction: "Enter the forest cautiously",
  outcome: "You step into the forest...",
  diceRoll: { roll: 15, dc: 13, success: true } // null if no roll
}
```

### Debugging Tips
- Check browser console for "GPT Response:" logs
- Look for `completion_tokens_details.reasoning_tokens` - if this equals total tokens, response will be empty
- If JSON parsing fails, check if GPT wrapped response in markdown code blocks
