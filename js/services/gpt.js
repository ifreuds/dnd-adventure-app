/**
 * GPT API Service
 * Handles all communication with OpenAI API for DM narration
 */

const GPT_MODEL = "gpt-5-mini-2025-08-07"; // Updated to use dated model name
const API_ENDPOINT = "https://api.openai.com/v1/chat/completions";

/**
 * Get API key from localStorage
 */
function getApiKey() {
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("No API key found. Please add your OpenAI API key in Settings.");
  }
  return apiKey;
}

/**
 * Generate DM narration based on player action
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
        model: GPT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 3500   // High limit to account for reasoning tokens (GPT-5-mini uses ~2000 for reasoning)
      })
    });

    if (!response.ok) {
      let errorMessage = `API error: ${response.status}`;
      try {
        const error = await response.json();
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        // If error response isn't JSON, use status text
        errorMessage = `${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("GPT Response:", data);
    console.log("Message content:", data.choices[0].message.content);
    console.log("Full message:", data.choices[0].message);

    // Parse the JSON response from GPT
    const messageContent = data.choices[0].message.content;

    if (!messageContent || messageContent.trim() === "") {
      console.error("Empty response from GPT. Full data:", JSON.stringify(data, null, 2));
      throw new Error("GPT returned an empty response. Check console for details.");
    }

    let result;
    try {
      // Try to parse as direct JSON first
      result = JSON.parse(messageContent);
    } catch (parseError) {
      console.log("⚠️ Direct JSON parse failed, trying extraction strategies...");

      // Strategy 1: Extract from markdown code blocks
      const jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1]);
          console.log("✅ Extracted JSON from markdown code block");
        } catch (e) {
          console.error("❌ Markdown extraction failed");
        }
      }

      // Strategy 2: Fix common JSON errors (like +10 instead of 10)
      if (!result) {
        try {
          // Remove + prefix from positive numbers (invalid JSON)
          const cleanedContent = messageContent.replace(/:\s*\+(\d+)/g, ': $1');
          result = JSON.parse(cleanedContent);
          console.log("✅ Fixed invalid + prefix in JSON");
        } catch (e) {
          console.error("❌ JSON cleanup failed");
        }
      }

      // If all strategies failed
      if (!result) {
        console.error("❌ All JSON parsing strategies failed");
        console.error("Response preview:", messageContent.substring(0, 500));
        console.error("Full response:", messageContent);
        console.error("Parse error:", parseError);
        throw new Error("GPT returned invalid JSON. Response: " + messageContent);
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
    console.error("GPT API Error:", error);
    throw error;
  }
}

/**
 * Build system prompt for DM
 */
function buildSystemPrompt(context) {
  // Extract Living Files (will be cached by GPT after first turn - 90% discount!)
  const worldContext = context.livingFiles?.step0 || 'Fantasy adventure';
  const rulesContext = context.livingFiles?.step1 || '';
  const npcContext = context.livingFiles?.step2 || '';
  const characterContext = context.livingFiles?.step3 || '';

  return `You are the Dungeon Master for this adventure. Use the context below to guide your narration.

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

=== NARRATION INSTRUCTIONS ===
- Follow the DM Narration Rules from the World Context above
- Use fail-forward: even failures advance the story
- Keep tone consistent with world theme
- Reference NPCs, factions, and rules naturally as they become relevant
- Track NPC relationships and update them based on player interactions

DIALOGUE FORMATTING (CRITICAL):
- Use quotation marks for all spoken dialogue: "Like this," she says.
- Separate paragraphs with \\n\\n (blank line between paragraphs)
- Put dialogue on its own line when possible
- Example good format:
  The room grows quiet.\\n\\nLyra steps forward. "We need to talk," she whispers.\\n\\nHer eyes dart to the door.
- Example bad format (DO NOT DO THIS):
  The room grows quiet. Lyra steps forward and whispers we need to talk while her eyes dart to the door.

=== OUTPUT FORMAT (Token-Optimized) ===
Respond in JSON format (minified, no whitespace):

{
  "narration": "Your 1-3 paragraph response (follow DM Narration Rules for length)",
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
    "hp": -5,                           // HP change (relative, negative for loss)
    "xp": 100,                          // XP gained (positive number, no + prefix!)
    "gold": -20,                        // Gold spent (negative for loss)
    "npc_lyra_relationship": 10,        // Relationship increase (positive number, no + prefix!)
    "npc_baron_relationship": -15,      // Relationship decrease (negative for loss)
    "flags_add": ["found_secret"],      // Story flags to add
    "inventory_add": [{"name": "Map", "type": "quest"}],
    "inventory_remove": [{"name": "Torch", "count": 1}]
  }
}

CRITICAL: Do NOT use + prefix on positive numbers in JSON (invalid JSON). Use plain numbers like 10, not +10.`;
}

/**
 * Build user prompt with player action
 */
function buildUserPrompt(context) {
  return `The player does: "${context.playerAction}"

Generate the next turn of the adventure. Remember to respond in JSON format.`;
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
    `Turn ${idx + 1}: ${turn.playerAction} � ${turn.outcome}`
  ).join("\n");
}

/**
 * Test API connection
 */
export async function testConnection() {
  try {
    const apiKey = getApiKey();
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`API test failed: ${response.status}`);
    }

    return { success: true, message: "API connection successful!" };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
