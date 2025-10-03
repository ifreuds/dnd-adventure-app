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

### Architecture (Fully Overhauled - 396 lines main + 9 modules)

**Modular Structure** - Streamlined AI-assisted workflow with auto-generation:

- **`worldWizard.js` (396 lines)** - Main orchestrator
  - Step navigation and state management
  - Loads guidelines from localStorage or defaults
  - Handles "Edit Guidelines" modal for advanced customization
  - Saves world data to localStorage on completion

- **`/wizardSteps/` modules**:
  - `step0-theme.js` - Theme & Tone (pre-fill → AI creates 7 areas including factions & DM rules)
  - `step1-mechanics.js` - Rules & Mechanics (choose defaults → AI creates complete 10-area system)
  - `step2-npcs.js` - NPCs (select 3-6 count → AI creates all profiles + assigns factions)
  - `step3-character.js` - Character Creation (form + point-buy → AI creates backstory)
  - `sharedChat.js` - Hybrid chat UI logic (uses getStepXInitialMessage for auto-gen)
  - `aiAssistant.js` - GPT API integration with detailed token logging
  - `livingFile.js` - Formatting utilities for Living File display
  - `guidelines.js` (651 lines) - Comprehensive AI guidelines per step (all questions removed)

### UI Design - Two-Panel Collaborative Mode

- **Left Panel (Conversation)**: Pre-fill form → AI chat expansion
- **Right Panel (Living File)**: Structured summary updated by AI in real-time
- **Sidebar**: 4 clickable steps (Theme & Tone → Rules & Mechanics → NPCs & Factions → Character Creation)
- **Navigation**: Back/Next buttons, data persists across steps, Finish button navigates to Main Game UI

### Streamlined Workflow (No Questions!)

1. **User fills pre-fill form** (World Name, Genre, Main Conflict, Narrative Style)
2. **Auto-generation triggers** - AI immediately creates COMPLETE Living File (all areas filled)
3. **User refines via chat** - User requests changes, AI updates Living File
4. **No questions asked** - AI provides complete draft, user only comments on changes

### Step 0: Theme & Tone - 7 Areas Auto-Generated

**Pre-fill fields:**
- **World Name** - e.g., "The Shattered Realms", "Neo-Tokyo 2099"
- **Genre/Theme** - e.g., "Dark Fantasy", "Cyberpunk", "Steampunk"
- **Main Conflict** - Brief 1-2 sentence description
- **Narrative Style** - Dropdown with 6 options:
  - Descriptive & Atmospheric (detailed environments, vivid imagery)
  - Action-Focused (fast-paced, emphasis on what happens)
  - Dramatic & Theatrical (emotional, intense moments)
  - Casual & Conversational (relaxed, friendly tone)
  - Grim & Brutal (dark, unforgiving, visceral)
  - Mysterious & Enigmatic (cryptic, haunting atmosphere)

**AI auto-creates (first response):**
1. Premise & Origin
2. Main Objective (win/lose conditions)
3. World Setting (era, tech level, culture)
4. Key Locations (3-5 locations)
5. **Factions (2-4 complete factions with details)**
6. Tone & Narrative Style
7. **DM Narration Rules (combat 1 para, conversation 1-2, romance 2-3, max 3 paras)**

No questions - complete draft on first AI response

### AI Conversation Guidelines (guidelines.js - 651 lines)

**Strict rules enforced:**
- **FORMATTING**: Short paragraphs (2-3 sentences max), blank lines between paragraphs
- **NO QUESTIONS**: AI creates complete draft immediately, only asks user to review
- **FIRST RESPONSE**: Complete Living File with ALL areas filled (no placeholders)
- **JSON RESPONSE FORMAT**: `{ "message": "...", "livingFile": "...", "coverageComplete": true/false }`
- **LINE BREAKS**: Use `\n\n` in message field for blank lines
- **TOKEN EFFICIENCY**: Removed redundancy, concise formats (~200 lines saved across steps)
- **PROMPT CACHING**: Automatic 90% discount on cached input tokens (no config needed)

### Layout & Scrolling

**Fixed-height flexbox layout** ensures buttons always visible:
- `.wizard` - 100vh height, flex-direction: column
- `.wizard-content` - Flex: 1, overflow: hidden
- `.panel` - Individual overflow-y scrollbars (conversation panel and living file panel scroll independently)
- Headers and input areas - `flex-shrink: 0` to prevent collapse
- Button bar - Always visible at bottom

### Auto-Generation Feature

When user completes pre-fill form and clicks "Generate":
1. Form data saved to `wizardData`
2. Chat UI renders with "Generating your world draft..." message
3. **Async auto-trigger** - `sharedChat.js` calls `getStepXInitialMessage(wizardData)`
   - Step 0: "Create complete world with 7 areas including factions & DM rules"
   - Step 1: "Create complete 10-area rules system with balanced defaults"
   - Step 2: "Create X complete NPC profiles + assign to factions from Step 0"
   - Step 3: "Create character backstory, abilities, equipment based on inputs"
4. AI responds with COMPLETE Living File (no "[To be defined]" placeholders)
5. User reviews and requests changes via chat

**No questions, no placeholders** - Complete draft on first response, user refines via chat.

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
- **World Wizard** - ✅ **REFACTORED & ENHANCED**
  - **Modular architecture**: 396-line orchestrator + 9 specialized modules (80% code reduction from 2050 lines)
  - **Hybrid AI-assisted workflow**: Pre-fill forms → Auto-generation → AI chat expansion
  - **Step 0 (Theme & Tone)**: World Name, Genre, Main Conflict, Narrative Style (6 dropdown options)
  - **Auto-generation**: First AI response auto-triggers with draft Living File
  - **AI conversation quality**: Strict guidelines enforce 1 question max, proper formatting with line breaks
  - **Fixed scrolling**: Individual panel scrollbars, buttons always visible at bottom
  - **Guideline editor**: Advanced users can customize AI behavior per step
  - Data persists across steps in localStorage
- **Main Game UI** - Chat narration, choice buttons, free text input, character panel (stats + skills), animated d20 dice roller
- **Top Bar** - Save, Settings, Mode toggle, Image Gen, Gallery, Menu (all functional)
- **Modals** - Image generation modal, gallery modal, load world modal
- **Navigation** - All flows working (Entry ↔ Wizard ↔ Game)

### ✅ Backend Integration - GPT API
- **GPT API** - ✅ WORKING!
  - **Normal Mode (Game)**: `js/services/gpt.js`
    - Model: `gpt-5-mini-2025-08-07`
    - API key stored in localStorage (user enters via Settings modal)
    - System prompt includes world theme, character stats, recent scene log
    - Returns narration, choices, dice requirements
    - **Important GPT-5-mini quirks:**
      - ❌ Do NOT use `response_format: { type: "json_object" }` - causes empty responses with all tokens used for reasoning
      - ❌ Do NOT use `temperature` parameter - only default (1) is supported
      - ✅ Use `max_completion_tokens` (not `max_tokens`)
      - ✅ Set high token limit (3500) to account for reasoning tokens (~2000) + actual response (~1500)
      - ✅ Parse JSON from response (handles both raw JSON and markdown code blocks)
      - ⚠️ **Known issue**: Complex prompts may consume all tokens in reasoning, leaving empty response. Solution: simplify prompts and increase token limit.

  - **World Building Mode (Wizard)**: `js/components/wizardSteps/aiAssistant.js`
    - Model: `gpt-5-mini-2025-08-07` (max_completion_tokens: 16000 for longer context)
    - Uses same API key from localStorage
    - Guidelines loaded from localStorage or defaults (per step)
    - Context includes user's pre-fill inputs + chat history (last 8 messages)
    - Returns JSON: `{ "message": "...", "livingFile": "...", "coverageComplete": true/false }`
    - Auto-triggered on form submission (no manual "Continue" needed)
    - **Enhanced prompts (v2)**:
      - Passes user's Narrative Style explicitly in system prompt
      - Better structured guidelines with clear formatting rules
      - Enforces 1 question per response maximum
      - Improved Living File format with consistent structure
      - Better logging for debugging (console shows token usage)

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

### ✅ Living File Integration into Gameplay
- **How it works**:
  1. Wizard creates 4 Living Files (Step 0-3) stored in localStorage
  2. Game start loads all 4 Living Files + creates/loads Save File
  3. DM receives full context: Living Files (static, cached) + Save File (dynamic, updates each turn)
  4. DM returns narration + delta updates (hp: -5, xp: +100, npc_lyra_relationship: +10)
  5. Frontend applies deltas to Save File, saves to localStorage

- **Two-Tier Data System**:
  - **Living Files (static, never change)**:
    - Step 0: World theme, factions, DM narration rules
    - Step 1: Game mechanics, fractional combat, XP curve
    - Step 2: NPC profiles (backstories, personalities, general stance: Ally/Neutral/Enemy)
    - Step 3: Player character backstory
    - Cached by GPT after first turn (90% discount on 6k-8k tokens!)

  - **Save File (dynamic, updates every turn)** - `js/services/saveFile.js`:
    - Character: HP, XP, level, stats, abilities, status effects
    - NPCs: Current relationship points, status (alive/recruited), location, flags, last interaction
    - Inventory: Gold, items with counts
    - Factions: Reputation levels
    - Story Flags: Checkpoints, milestones
    - Progress Summary: Narrative overview

- **Token Optimization**:
  - Output format enforces: short choices (3-6 words), omit empty fields, minified JSON, delta updates only
  - Result: Output reduced from 1500+ tokens to 300-400 tokens per turn
  - Cost: 100-turn campaign ~$0.12 (was ~$0.50+ before optimization)

- **File**: `js/services/saveFile.js`
  - `createNewSaveFile(wizardData)` - Parses Living Files, creates initial game state
  - `applySaveFileUpdates(saveFile, updates)` - Applies delta updates, validates, returns new state
  - Handles relative changes (hp: -5), additive changes (flags_add: ["secret"]), inventory management

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
- **Dice Roll**:
  - When required: Button pulses with orange glow, info panel shows check type + DC
  - During roll: Numbers cycle 1-20 at 80ms intervals (15 cycles)
  - Result: Final number scales up 1.5x then back to 1x, color-coded by result (green 15+, orange 10-14, red <10)
- **DM Thinking**: Animated dots with spinning circle during API calls
- **Modal Fade-in**: 0.2s opacity fade + 0.3s slide-down from -50px
- **Dice Button Pulse**: Glowing orange animation (1.5s loop) when roll is required

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

### World Building API (aiAssistant.js)
- Model: `gpt-5-mini-2025-08-07`
- Max tokens: 16,000 (larger context for wizard)
- Uses step-specific guidelines from `guidelines.js`
- Context: User inputs + chat history (last 8 messages) + previous Living Files
- **Token Logging**: Detailed console breakdown
  - Input tokens, output tokens, total tokens
  - Reasoning tokens (GPT-5-mini specific)
  - **Cache detection**: Shows cached vs fresh, calculates savings (90% discount!)
  - Pricing: $0.25/1M input, $0.025/1M cached, $2/1M output
- Returns JSON: `{ "message": "...", "livingFile": "...", "coverageComplete": true/false }`

### Gameplay API (gpt.js / grok.js)
1. User takes action → `handlePlayerAction()` in gameUI.js
2. Build context object (**will include 4 Living Files** + character + scene log)
3. Route to appropriate API based on mode:
   - **Normal Mode** → `generateGptNarration(context)` from gpt.js (GPT-5-mini)
   - **Mature Mode** → `generateGrokNarration(context)` from grok.js (Grok-4-Fast)
4. AI returns JSON with narration, choices, dice requirements
5. Update UI with narration (clean text, no badges in chat log)
6. If dice required: Show compact info panel with check type + DC, light up dice button with pulse animation
7. Add turn to scene log (max 10 turns)

**Note**: When `diceRequired: true`, choice buttons are hidden until dice is rolled. This is expected behavior - AI provides choices but they're not shown until roll outcome is determined.

### Scene Log Format
```javascript
{
  playerAction: "Enter the forest cautiously",
  outcome: "You step into the forest...",
  diceRoll: { roll: 15, dc: 13, success: true } // null if no roll
}
```

### Debugging Tips
- Check browser console for API routing logs:
  - `🎲 Calling Grok-4-Fast (Mature Mode) API...` or `🎲 Calling GPT-5-mini (Normal Mode) API...`
  - `✅ Grok response received:` or `✅ GPT response received:` with full response object
- Look for `completion_tokens_details.reasoning_tokens` (GPT-5-mini) - if this equals total tokens, response will be empty
  - **Fix**: Increased `max_completion_tokens` to 3500 to account for reasoning overhead
  - **Fix**: Simplified dice roll context to avoid long prompts
- If JSON parsing fails, check if AI wrapped response in markdown code blocks
- Verify which DM is active by checking the loading indicator: "🎲 GPT DM is thinking" vs "🎲 Grok DM is thinking"

### Dice Roll Improvements (Latest)
- **Spoiler prevention**: Success/failure outcomes hidden from player before roll
- **Loading feedback**: "DM is thinking" indicator shows after dice animation completes
- **Simplified context**: Only check type sent to API, not full success/failure descriptions
- **Token optimization**: Context stripped to prevent GPT-5-mini reasoning token overflow
