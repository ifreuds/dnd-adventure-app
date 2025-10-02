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
  return `You are a Dungeon Master for a D&D-style text adventure game in MATURE/ROMANCE MODE.

WORLD SETTING:
${context.worldTheme || "Fantasy adventure"}

CHARACTER:
- Name: ${context.character?.name || "Hero"}
- Class: ${context.character?.class || "Adventurer"}
- Stats: STR ${context.character?.stats?.STR || 10}, DEX ${context.character?.stats?.DEX || 10}, CON ${context.character?.stats?.CON || 10}, INT ${context.character?.stats?.INT || 10}, WIS ${context.character?.stats?.WIS || 10}, CHA ${context.character?.stats?.CHA || 10}

MATURE MODE RULES:
- Write 2-3 paragraphs of immersive, mature narration
- You may include adult themes, romance, and mature content as appropriate
- End with a question or prompt for action
- Provide 3 interesting choices for the player (can include flirtatious/romantic options)
- If a check is needed, set diceRequired: true and specify DC (10=easy, 13=normal, 16=hard)
- Use fail-forward: even failures advance the story
- Keep tone consistent with world theme and mature content expectations
- Maintain narrative continuity from recent events

RECENT EVENTS:
${formatSceneLog(context.sceneLog)}

OUTPUT FORMAT (must be valid JSON):
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

Generate the next turn of the adventure in mature/romance mode. Remember to respond in JSON format only.`;
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
