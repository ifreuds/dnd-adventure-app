/**
 * AI Assistant for World Building Wizard
 * Handles API calls to GPT for generating world content
 */

export async function callWorldBuildingAssistant(stepKey, userMessage, wizardData, guidelines) {
  // Get API key
  const apiKey = localStorage.getItem("openai_api_key");
  if (!apiKey) {
    throw new Error("No API key found. Please add your OpenAI API key in Settings.");
  }

  // Build user inputs context for each step
  let userInputsContext = '';

  if (stepKey === 'step0') {
    userInputsContext = `\n\nUSER'S INITIAL INPUTS:
World Name: ${wizardData.worldName || '[Not provided]'}
Genre/Theme: ${wizardData.worldGenre || '[Not provided]'}
Main Conflict: ${wizardData.worldConflict || '[Not provided]'}
Narrative Style: ${wizardData.narrativeStyle || '[Not provided]'}

IMPORTANT: Use the Narrative Style "${wizardData.narrativeStyle}" in your conversational tone and Living File content.`;
  }

  if (stepKey === 'step1') {
    const approach = wizardData.mechanicsApproach === 'defaults' ? 'Balanced Defaults' : 'Custom Mechanics';
    userInputsContext = `\n\nUSER'S MECHANICS APPROACH: ${approach}

${wizardData.mechanicsApproach === 'defaults' ?
  'IMPORTANT: Use balanced defaults for all 10 areas. Make sensible default choices.' :
  'IMPORTANT: Create creative custom mechanics that fit the world theme.'
}`;
  }

  if (stepKey === 'step2') {
    userInputsContext = `\n\nUSER'S NPC COUNT: ${wizardData.npcCount || '[Not selected]'}

IMPORTANT: Create COMPLETE profiles for exactly ${wizardData.npcCount} NPCs. Also create 2-4 factions that fit the world context.`;
  }

  // Build context: existing Living Files from other steps
  const contextualInfo = [];
  if (wizardData.livingFiles.step0 && stepKey !== 'step0') contextualInfo.push(`World Context:\n${wizardData.livingFiles.step0}`);
  if (wizardData.livingFiles.step1 && stepKey !== 'step1') contextualInfo.push(`Rules & Mechanics:\n${wizardData.livingFiles.step1}`);
  if (wizardData.livingFiles.step2 && stepKey !== 'step2') contextualInfo.push(`NPCs & Factions:\n${wizardData.livingFiles.step2}`);
  if (wizardData.livingFiles.step3 && stepKey !== 'step3') contextualInfo.push(`Character:\n${wizardData.livingFiles.step3}`);

  const contextSection = contextualInfo.length > 0
    ? `\n\nEXISTING WORLD CONTEXT (reference this for consistency):\n${contextualInfo.join('\n\n')}`
    : '';

  // Build chat history for context
  const chatHistory = wizardData.chatHistory[stepKey];
  const previousMessages = chatHistory.slice(-8); // Last 8 messages for context (increased from 6)

  // Construct system message with all context
  const systemMessage = guidelines[stepKey] + userInputsContext + contextSection;

  const messages = [
    { role: "system", content: systemMessage },
    ...previousMessages,
    { role: "user", content: userMessage }
  ];

  console.log(`🤖 Calling World Building AI (${stepKey})...`);
  console.log(`📝 Chat history: ${previousMessages.length} messages`);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-5-mini-2025-08-07",
        messages: messages,
        max_completion_tokens: 16000 // Increased from 3500 for world building
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();

    // Log detailed token usage
    if (data.usage) {
      console.log(`✅ AI response received - Token usage:`);
      console.log(`   📥 Input (prompt): ${data.usage.prompt_tokens} tokens`);
      console.log(`   📤 Output (completion): ${data.usage.completion_tokens} tokens`);
      console.log(`   💰 Total: ${data.usage.total_tokens} tokens`);

      // GPT-5-mini specific: reasoning tokens
      if (data.usage.completion_tokens_details?.reasoning_tokens) {
        console.log(`   🧠 Reasoning tokens: ${data.usage.completion_tokens_details.reasoning_tokens}`);
        console.log(`   💬 Actual response tokens: ${data.usage.completion_tokens - data.usage.completion_tokens_details.reasoning_tokens}`);
      }
    } else {
      console.log(`✅ AI response received (token info unavailable)`);
    }

    const messageContent = data.choices[0].message.content;

    if (!messageContent || messageContent.trim() === "") {
      console.error("❌ Empty response from AI");
      throw new Error("AI returned an empty response. Please try again.");
    }

    // Parse JSON response with multiple fallback strategies
    let result;

    // Strategy 1: Direct parse
    try {
      result = JSON.parse(messageContent);
    } catch (parseError) {
      console.log("⚠️ Direct JSON parse failed, trying extraction strategies...");

      // Strategy 2: Extract from markdown code blocks
      let jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          result = JSON.parse(jsonMatch[1]);
          console.log("✅ Extracted JSON from markdown code block");
        } catch (innerError) {
          console.error("❌ Markdown extraction failed");
        }
      }

      // Strategy 3: Find first { and match closing } with proper nesting
      if (!result) {
        const firstBrace = messageContent.indexOf('{');
        if (firstBrace !== -1) {
          let depth = 0;
          let closingBrace = -1;

          for (let i = firstBrace; i < messageContent.length; i++) {
            if (messageContent[i] === '{') depth++;
            if (messageContent[i] === '}') {
              depth--;
              if (depth === 0) {
                closingBrace = i;
                break;
              }
            }
          }

          if (closingBrace !== -1) {
            const extracted = messageContent.substring(firstBrace, closingBrace + 1);
            try {
              result = JSON.parse(extracted);
              console.log("✅ Extracted JSON from text (proper brace matching)");
            } catch (innerError) {
              console.error("❌ Brace extraction failed:", innerError.message);
            }
          }
        }
      }

      // If all strategies failed
      if (!result) {
        console.error("❌ All JSON parsing strategies failed");
        console.error("Response preview:", messageContent.substring(0, 500));
        console.error("Full response:", messageContent);
        throw new Error("AI returned invalid JSON format. Response logged to console - please check for details.");
      }
    }

    console.log(`📊 Coverage complete: ${result.coverageComplete}`);

    return {
      message: result.message || "I'm here to help build your world!",
      livingFile: result.livingFile || wizardData.livingFiles[stepKey],
      coverageComplete: result.coverageComplete || false
    };

  } catch (error) {
    console.error("❌ World Building AI Error:", error);
    throw error;
  }
}
