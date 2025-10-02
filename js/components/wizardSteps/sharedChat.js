/**
 * Shared Hybrid Chat UI for all wizard steps
 */

import { callWorldBuildingAssistant } from './aiAssistant.js';
import * as Step0 from './step0-theme.js';
import * as Step1 from './step1-mechanics.js';
import * as Step2 from './step2-npcs.js';
import * as Step3 from './step3-character.js';

const stepModules = {
  0: Step0,
  1: Step1,
  2: Step2,
  3: Step3
};

export function renderHybridChat(currentStep, stepKey, config, wizardData, guidelines, el, onUpdate) {
  const chatHistory = wizardData.chatHistory[stepKey];
  const stepModule = stepModules[currentStep];

  // Render chat container
  const chatContainer = document.createElement('div');
  chatContainer.style.cssText = 'max-height: 400px; overflow-y: auto; margin-bottom: 15px; padding: 10px; background: #1a1a1a; border-radius: 4px;';

  if (chatHistory.length === 0) {
    // Show loading - we'll auto-generate the first response
    chatContainer.innerHTML = `
      <div style="margin-bottom: 15px;">
        <div style="color: #888; font-size: 12px; margin-bottom: 5px;">🤖 World Building Assistant</div>
        <div style="background: #2a2a2a; padding: 10px; border-radius: 4px; color: #e0e0e0; line-height: 1.6;">
          Generating your world draft...
        </div>
      </div>
    `;
  } else {
    // Render existing chat
    chatHistory.forEach(msg => {
      const isUser = msg.role === 'user';
      const msgDiv = document.createElement('div');
      msgDiv.style.marginBottom = '15px';

      const labelDiv = document.createElement('div');
      labelDiv.style.cssText = 'color: #888; font-size: 12px; margin-bottom: 5px;';
      labelDiv.textContent = isUser ? '👤 You' : '🤖 World Building Assistant';

      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `background: ${isUser ? '#1e3a5f' : '#2a2a2a'}; padding: 10px; border-radius: 4px; color: #e0e0e0; white-space: pre-wrap; line-height: 1.6;`;
      contentDiv.textContent = msg.content;

      msgDiv.appendChild(labelDiv);
      msgDiv.appendChild(contentDiv);
      chatContainer.appendChild(msgDiv);
    });

    setTimeout(() => chatContainer.scrollTop = chatContainer.scrollHeight, 0);
  }

  el.convoBody.innerHTML = '';
  el.convoBody.appendChild(chatContainer);

  // Render input area
  el.inputArea.innerHTML = `
    <div style="display: flex; gap: 10px;">
      <textarea
        id="chatInput"
        placeholder="${config.initialPlaceholder}"
        style="flex: 1; padding: 10px; background: #1e1e1e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px; resize: vertical; min-height: 80px; font-family: inherit;"
      ></textarea>
      <button id="sendBtn" style="padding: 10px 20px; background: #d97706; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">Send</button>
    </div>
    <div id="loadingIndicator" style="margin-top: 10px; color: #888; font-size: 14px; display: none;">
      <span>🤖 Assistant is thinking</span>
      <span class="dots" style="display: inline-block; width: 20px; text-align: left;">...</span>
    </div>
  `;

  const chatInput = el.inputArea.querySelector('#chatInput');
  const sendBtn = el.inputArea.querySelector('#sendBtn');

  async function handleSend() {
    const userMessage = chatInput.value.trim();
    if (!userMessage) return;

    chatInput.value = '';
    chatInput.disabled = true;
    sendBtn.disabled = true;

    wizardData.chatHistory[stepKey].push({ role: 'user', content: userMessage });
    localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

    // Re-render and show loading
    onUpdate();
    const newLoadingIndicator = el.inputArea.querySelector('#loadingIndicator');
    if (newLoadingIndicator) {
      newLoadingIndicator.style.display = 'block';
    }

    try {
      // Build context using step module
      let contextMessage = userMessage;
      if (stepModule.buildStep0Context) {
        contextMessage = stepModule.buildStep0Context(wizardData, userMessage);
      } else if (stepModule.buildStep1Context) {
        contextMessage = stepModule.buildStep1Context(wizardData, userMessage);
      } else if (stepModule.buildStep2Context) {
        contextMessage = stepModule.buildStep2Context(wizardData, userMessage);
      } else if (stepModule.buildStep3Context) {
        contextMessage = stepModule.buildStep3Context(wizardData, userMessage);
      }

      const response = await callWorldBuildingAssistant(stepKey, contextMessage, wizardData, guidelines);

      wizardData.chatHistory[stepKey].push({ role: 'assistant', content: response.message });

      if (response.livingFile) {
        wizardData.livingFiles[stepKey] = response.livingFile;
        localStorage.setItem(`wizard_livingFile_${stepKey}`, response.livingFile);
      }

      localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

      onUpdate();

    } catch (error) {
      alert(`Error: ${error.message}`);
      wizardData.chatHistory[stepKey].pop();
      localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));
      onUpdate();
    }
  }

  sendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Auto-generate first response if chat is empty
  if (chatHistory.length === 0) {
    // Build initial context message
    let initialPrompt = "Please create a draft Living File based on the inputs I provided. Fill in what you can infer, and mark incomplete areas as '[To be defined]'. Then ask me ONE specific question about what to expand on first.";

    if (stepModule.buildStep0Context) {
      initialPrompt = stepModule.buildStep0Context(wizardData, initialPrompt);
    } else if (stepModule.buildStep1Context) {
      initialPrompt = stepModule.buildStep1Context(wizardData, initialPrompt);
    } else if (stepModule.buildStep2Context) {
      initialPrompt = stepModule.buildStep2Context(wizardData, initialPrompt);
    } else if (stepModule.buildStep3Context) {
      initialPrompt = stepModule.buildStep3Context(wizardData, initialPrompt);
    }

    // Trigger auto-generation
    (async () => {
      try {
        const response = await callWorldBuildingAssistant(stepKey, initialPrompt, wizardData, guidelines);

        wizardData.chatHistory[stepKey].push({ role: 'assistant', content: response.message });

        if (response.livingFile) {
          wizardData.livingFiles[stepKey] = response.livingFile;
          localStorage.setItem(`wizard_livingFile_${stepKey}`, response.livingFile);
        }

        localStorage.setItem(`wizard_chat_${stepKey}`, JSON.stringify(wizardData.chatHistory[stepKey]));

        onUpdate();
      } catch (error) {
        alert(`Error generating initial draft: ${error.message}`);
        onUpdate();
      }
    })();
  }
}
