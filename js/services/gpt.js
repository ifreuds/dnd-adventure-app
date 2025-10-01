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
        response_format: { type: "json_object" },
        reasoning_effort: "minimal",  // Use minimal reasoning for faster, more concise responses
        max_completion_tokens: 1500   // Increased to account for reasoning tokens + actual content
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
      result = JSON.parse(messageContent);
    } catch (parseError) {
      console.error("Failed to parse GPT response:", messageContent);
      console.error("Parse error:", parseError);
      throw new Error("GPT returned invalid JSON. Response: " + messageContent);
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
