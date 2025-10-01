/**
 * GPT API Service
 * Handles all communication with OpenAI API for DM narration
 */

const GPT_MODEL = "gpt-5-mini";
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
        response_format: { type: "json_object" },
        max_completion_tokens: 800
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

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
  return `You are a Dungeon Master for a D&D-style text adventure game.

WORLD SETTING:
${context.worldTheme || "Fantasy adventure"}

CHARACTER:
- Name: ${context.character?.name || "Hero"}
- Class: ${context.character?.class || "Adventurer"}
- Stats: STR ${context.character?.stats?.STR || 10}, DEX ${context.character?.stats?.DEX || 10}, CON ${context.character?.stats?.CON || 10}, INT ${context.character?.stats?.INT || 10}, WIS ${context.character?.stats?.WIS || 10}, CHA ${context.character?.stats?.CHA || 10}

RULES:
- Write 2-3 paragraphs of immersive narration
- End with a question or prompt for action
- Provide 3 interesting choices for the player
- If a check is needed, set diceRequired: true and specify DC (10=easy, 13=normal, 16=hard)
- Use fail-forward: even failures advance the story
- Keep tone consistent with world theme

RECENT EVENTS:
${formatSceneLog(context.sceneLog)}

OUTPUT FORMAT (JSON):
{
  "narration": "2-3 paragraphs describing what happens",
  "choices": ["Choice 1", "Choice 2", "Choice 3"],
  "diceRequired": true/false,
  "dc": 13,
  "diceContext": "What the roll is for (if diceRequired is true)"
}`;
}

/**
 * Build user prompt with player action
 */
function buildUserPrompt(context) {
  return `The player does: "${context.playerAction}"

Generate the next turn of the adventure. Remember to respond in JSON format.`;
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
