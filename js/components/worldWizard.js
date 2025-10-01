export function renderWorldWizard(container) {
  const steps = [
    { id: 0, title: "Theme & Tone" },
    { id: 1, title: "Rules & Mechanics" },
    { id: 2, title: "NPCs & Factions" },
    { id: 3, title: "Character Creation" },
  ];

  let currentStep = 0;

  container.innerHTML = `
    <div class="wizard">
      <!-- Sidebar -->
      <div class="wizard-sidebar">
        <h3>Progress</h3>
        <ol id="wizardSteps" class="wizard-steps"></ol>
        <p class="muted">Click any step to jump.</p>
      </div>

      <!-- Main Content -->
      <div style="flex:1; display:flex; flex-direction:column;">
        <div class="wizard-main">
          <!-- Left: Conversation -->
          <div class="panel">
            <h2 id="convoTitle">Conversation</h2>
            <div id="convoBody" class="muted"></div>
          </div>
          <!-- Right: Living File -->
          <div class="panel">
            <h2>Living File</h2>
            <div id="fileBody" class="muted"></div>
          </div>
        </div>

        <!-- Buttons -->
        <div class="button-bar">
          <button id="backBtn">Back</button>
          <button id="nextBtn">Next</button>
        </div>
      </div>
    </div>
  `;

  const el = {
    steps: container.querySelector("#wizardSteps"),
    convoTitle: container.querySelector("#convoTitle"),
    convoBody: container.querySelector("#convoBody"),
    fileBody: container.querySelector("#fileBody"),
    backBtn: container.querySelector("#backBtn"),
    nextBtn: container.querySelector("#nextBtn"),
  };

  function renderSteps() {
    el.steps.innerHTML = steps
      .map(
        (s, idx) =>
          `<li data-idx="${idx}" class="${idx === currentStep ? "active-step" : ""}">${idx + 1}. ${s.title}</li>`
      )
      .join("");
    // Click to jump
    el.steps.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        currentStep = Number(li.getAttribute("data-idx"));
        render();
      });
    });
  }

  function contentFor(stepIdx) {
    switch (stepIdx) {
      case 0:
        return {
          convoTitle: "Theme & Tone",
          convoBody:
            "Describe your world vibe (dark fantasy, cozy adventure, high magic, etc.). We’ll refine this with AI later.",
          fileBody:
            "- World Theme: (empty)\n- Tone Tags: (empty)\n- Inspirations: (empty)",
        };
      case 1:
        return {
          convoTitle: "Rules & Mechanics",
          convoBody:
            "Simple d20 checks + lightweight combat. Note any house rules or special conditions you want.",
          fileBody:
            "- Core Check: d20 vs DC\n- Combat: d20 to hit, simple damage dice\n- Special Rules: (empty)",
        };
      case 2:
        return {
          convoTitle: "NPCs & Factions",
          convoBody:
            "List a few key NPCs (ally/rival/romance) and at least one faction with a goal.",
          fileBody:
            "- Key NPCs: (empty)\n- Factions: (empty)\n- Conflicts: (empty)",
        };
      case 3:
        return {
          convoTitle: "Character Creation",
          convoBody:
            "Pick your character concept and 6 stats. We’ll balance with AI later.",
          fileBody:
            "- Name: (empty)\n- Class/Concept: (empty)\n- Stats (STR/DEX/CON/INT/WIS/CHA): (empty)",
        };
      default:
        return { convoTitle: "Conversation", convoBody: "", fileBody: "" };
    }
  }

  function renderMain() {
    const c = contentFor(currentStep);
    el.convoTitle.textContent = c.convoTitle;
    el.convoBody.textContent = c.convoBody;
    el.fileBody.textContent = c.fileBody;

    // Buttons state
    el.backBtn.disabled = currentStep === 0;
    el.nextBtn.textContent = currentStep === steps.length - 1 ? "Finish" : "Next";
  }

  function render() {
    renderSteps();
    renderMain();
  }

  // Button handlers
  el.backBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      render();
    }
  });
  el.nextBtn.addEventListener("click", () => {
    if (currentStep < steps.length - 1) {
      currentStep++;
      render();
    } else {
      // Finish placeholder: later this will write initial Save File + Summary
      alert("Wizard complete (placeholder). Returning to Entry for now.");
      // (Optional) navigate back to entry without reloading:
      import("./entry.js").then(({ renderEntry }) => renderEntry(container));
    }
  });

  // Initial paint
  render();
}
