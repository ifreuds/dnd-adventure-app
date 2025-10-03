/**
 * Grok API Service
 * Handles all communication with xAI Grok API for mature/romance mode DM narration
 */

const GROK_MODEL = "grok-4-fast-reasoning";
const API_ENDPOINT = "https://api.x.ai/v1/chat/completions";

/**
 * Get API key from localStorage
 */
function getApiKey() {
  const apiKey = localStorage.getItem("grok_api_key");
  if (!apiKey) {
    throw new Error("No Grok API key found. Please add your xAI API key in Settings.");
  }
  return apiKey;
}

/**
 * Generate DM narration for mature/romance mode based on player action
 * @param {Object} context - Game context
 * @param {string} context.worldTheme - World theme/tone
 * @param {Array} context.sceneLog - Recent turns (last 8-10)
 * @param {Object} context.character - Character info
 * @param {string} context.playerAction - What the player just did
 * @returns {Promise<Object>} - { narration, choices, diceRequired, dc }
 */
export async function generateNarration(context) {
  const apiKey = getApiKey();

  const systemPrompt = buildSystemPrompt(context);
  const userPrompt = buildUserPrompt(context);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 2000,
        temperature: 0.8,
        response_format: { type: "json_object" }  // Grok supports JSON mode properly
      })
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Grok Response:", data);
    console.log("Message content:", data.choices[0].message.content);

    const messageContent = data.choices[0].message.content;

    if (!messageContent || messageContent.trim() === "") {
      console.error("Empty response from Grok. Full data:", JSON.stringify(data, null, 2));
      throw new Error("Grok returned an empty response. Check console for details.");
    }

    let result;
    try {
      result = JSON.parse(messageContent);
    } catch (parseError) {
      // Fallback: try to extract JSON from markdown code blocks
      const jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error("Failed to parse extracted JSON:", jsonMatch[1]);
          throw new Error("Grok returned malformed JSON. Response: " + messageContent);
        }
      } else {
        console.error("Failed to parse Grok response:", messageContent);
        throw new Error("Grok returned invalid JSON. Response: " + messageContent);
      }
    }

    return {
      narration: result.narration || "The story continues...",
      choices: result.choices || ["Continue", "Look around", "Rest"],
      diceRequired: result.diceRequired || false,
      dc: result.dc || 13,
      diceContext: result.diceContext || ""
    };

  } catch (error) {
    console.error("Grok API Error:", error);
    throw error;
  }
}

/**
 * Build system prompt for mature/romance mode DM
 */
function buildSystemPrompt(context) {
  // Extract Living Files (will be cached after first turn - 90% discount!)
  const worldContext = context.livingFiles?.step0 || 'Fantasy adventure';
  const rulesContext = context.livingFiles?.step1 || '';
  const npcContext = context.livingFiles?.step2 || '';
  const characterContext = context.livingFiles?.step3 || '';

  return `You are the Dungeon Master for this adventure in MATURE/ROMANCE MODE. Use the context below to guide your narration.

=== WORLD CONTEXT ===
${worldContext}

=== GAME RULES & MECHANICS ===
${rulesContext}

=== KEY NPCs ===
${npcContext}

=== PLAYER CHARACTER ===
${characterContext}

=== CURRENT SAVE FILE ===
${formatSaveFile(context.saveFile)}

=== RECENT SCENE LOG ===
${formatSceneLog(context.sceneLog)}

=== MATURE MODE NARRATION INSTRUCTIONS ===
- Follow the DM Narration Rules from the World Context above
- For romance/mature scenes: 2-3 paragraphs, be explicit and sensual, NEVER fade to black
- Describe physical sensations and emotions in detail
- Use fail-forward: even failures advance the story
- Keep tone consistent with world theme
- Reference NPCs, factions, and rules naturally as they become relevant
- Track NPC relationships and update them based on player interactions

=== OUTPUT FORMAT (Token-Optimized) ===
Respond in JSON format (minified, no whitespace):

{
  "narration": "Your 2-3 paragraph mature/romance response",
  "choices": ["Short choice 1", "Short choice 2", "Short choice 3"]
}

ONLY include these optional fields if needed:
- "diceRequired": true (omit if false)
- "dc": 15 (omit if no dice needed)
- "diceContext": "Brief check description" (omit if no dice needed)
- "updates": { ... } (omit if nothing changed)

CRITICAL - Token Efficiency Rules:
1. Keep choices SHORT (3-6 words each, not full sentences)
2. OMIT fields with false/empty values
3. Minify JSON (no pretty-printing, no line breaks)
4. Use delta updates in "updates" object (examples below)

DELTA UPDATE FORMAT (only include if things changed):
{
  "updates": {
    "hp": -5,                           // HP change (relative)
    "xp": +100,                         // XP gained (relative)
    "gold": -20,                        // Gold spent (relative)
    "npc_lyra_relationship": +10,       // Relationship change (use NPC id from Step 2)
    "npc_baron_relationship": -15,
    "flags_add": ["romance_scene_lyra"],  // Story flags to add
    "inventory_add": [{"name": "Love Letter", "type": "quest"}],
    "inventory_remove": [{"name": "Torch", "count": 1}]
  }
}`;
}

/**
 * Build user prompt with player action
 */
function buildUserPrompt(context) {
  return `The player does: "${context.playerAction}"

Generate the next turn of the adventure in mature/romance mode. Remember to respond in JSON format only.`;
}

/**
 * Format Save File for context
 */
function formatSaveFile(saveFile) {
  if (!saveFile) {
    return "No save file loaded (new game).";
  }

  const char = saveFile.character || {};
  const npcs = saveFile.npcs || [];
  const inventory = saveFile.inventory || {};
  const flags = saveFile.storyFlags || [];

  return `Character: ${char.name || "Hero"} | Level ${char.level || 1} | XP ${char.xp || 0}/${getNextLevelXP(char.level || 1)} | HP ${char.hp?.current || 20}/${char.hp?.max || 20}
Stats: STR ${char.stats?.STR || 10}, DEX ${char.stats?.DEX || 10}, CON ${char.stats?.CON || 10}, INT ${char.stats?.INT || 10}, WIS ${char.stats?.WIS || 10}, CHA ${char.stats?.CHA || 10}
Abilities: ${char.abilities?.join(', ') || 'None'}

NPCs (current relationships - see NPC PROFILES section for backstories):
${npcs.map(npc => `- ${npc.name}: ${npc.relationshipPoints >= 0 ? '+' : ''}${npc.relationshipPoints || 0} pts (${npc.status || 'alive'}, ${npc.location || 'unknown'})`).join('\n') || 'None encountered yet'}

Inventory: Gold ${inventory.gold || 0} | Items: ${inventory.items?.map(i => i.count > 1 ? `${i.name} x${i.count}` : i.name).join(', ') || 'None'}

Story Flags: ${flags.join(', ') || 'None'}`;
}

/**
 * Get XP needed for next level
 */
function getNextLevelXP(currentLevel) {
  const xpTable = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6500, 7500, 8500, 10000, 11000, 12000, 13000, 14000, 15000];
  return xpTable[currentLevel] || 15000;
}

/**
 * Format scene log for context
 */
function formatSceneLog(sceneLog = []) {
  if (sceneLog.length === 0) {
    return "This is the start of the adventure.";
  }

  return sceneLog.map((turn, idx) =>
    `Turn ${idx + 1}: ${turn.playerAction} → ${turn.outcome}`
  ).join("\n");
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    const apiKey = getApiKey();
    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: GROK_MODEL,
        messages: [
          { role: "user", content: "Hello, respond with just 'API test successful' in JSON format: {\"message\": \"API test successful\"}" }
        ],
        max_tokens: 50,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API test failed: ${response.status}`);
    }

    return { success: true, message: "Grok API connection successful!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
