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

  // Build user inputs context for Step 0
  let userInputsContext = '';
  if (stepKey === 'step0') {
    userInputsContext = `\n\nUSER'S INITIAL INPUTS:
World Name: ${wizardData.worldName || '[Not provided]'}
Genre/Theme: ${wizardData.worldGenre || '[Not provided]'}
Main Conflict: ${wizardData.worldConflict || '[Not provided]'}
Narrative Style: ${wizardData.narrativeStyle || '[Not provided]'}

IMPORTANT: Use the Narrative Style "${wizardData.narrativeStyle}" in your conversational tone and Living File content.`;
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
    console.log(`✅ AI response received (${data.usage?.total_tokens || 'unknown'} tokens)`);

    const messageContent = data.choices[0].message.content;

    if (!messageContent || messageContent.trim() === "") {
      console.error("❌ Empty response from AI");
      throw new Error("AI returned an empty response. Please try again.");
    }

    // Parse JSON response
    let result;
    try {
      result = JSON.parse(messageContent);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = messageContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        console.error("❌ Failed to parse AI response as JSON:", messageContent.substring(0, 200));
        throw new Error("AI returned invalid JSON format. Please try again.");
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
