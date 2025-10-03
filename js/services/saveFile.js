/**
 * Save File Manager
 * Handles Save File creation, delta updates, and validation
 */

/**
 * Create a new Save File from wizard data
 */
export function createNewSaveFile(wizardData) {
  return {
    metadata: {
      worldName: wizardData.worldName || "Adventure",
      created: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      turnCount: 0,
      playTime: "0m"
    },

    character: {
      name: wizardData.characterName || "Hero",
      gender: wizardData.characterGender || "Other",
      race: wizardData.characterRace || "Human",
      class: wizardData.characterClass || "Adventurer",
      level: 1,
      xp: 0,
      hp: calculateInitialHP(wizardData.pointBuyStats),
      stats: wizardData.pointBuyStats || {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
      },
      abilities: parseAbilitiesFromLivingFile(wizardData.livingFiles?.step3 || ''),
      statusEffects: []
    },

    npcs: parseNPCsFromLivingFile(wizardData.livingFiles?.step2 || ''),

    inventory: {
      gold: 100,  // Default starting gold
      items: []   // Will be parsed from Step 3 Living File
    },

    factions: parseFactionReputationFromLivingFile(wizardData.livingFiles?.step0 || ''),

    storyFlags: [],

    progressSummary: ""  // Will be updated as story progresses
  };
}

/**
 * Calculate initial HP based on CON stat
 */
function calculateInitialHP(stats) {
  const con = stats?.CON || 10;
  const conModifier = Math.floor((con - 10) / 2);
  const baseHP = 10;  // Base HP at level 1
  const maxHP = baseHP + conModifier;

  return {
    current: Math.max(1, maxHP),  // Minimum 1 HP
    max: Math.max(1, maxHP)
  };
}

/**
 * Parse abilities from Step 3 Living File
 */
function parseAbilitiesFromLivingFile(step3Content) {
  // Match "Starting Abilities:" section
  const abilitiesMatch = step3Content.match(/Starting Abilities:\s*([\s\S]*?)(?=\n\n===|\n\n[A-Z]|$)/i);

  if (abilitiesMatch) {
    const abilitiesText = abilitiesMatch[1].trim();
    // Extract bullet points (lines starting with -)
    const abilities = abilitiesText
      .split('\n')
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.replace(/^-\s*/, '').trim());

    return abilities.length > 0 ? abilities : [];
  }

  return [];
}

/**
 * Parse NPCs from Step 2 Living File
 */
function parseNPCsFromLivingFile(step2Content) {
  const npcs = [];

  // Match each NPC section (--- NPC Name ---)
  const npcMatches = step2Content.matchAll(/---\s*(.+?)\s*---[\s\S]*?(?=---|$)/g);

  for (const match of npcMatches) {
    const npcSection = match[0];
    const name = match[1].trim();

    // Extract relationship stance
    const stanceMatch = npcSection.match(/General Stance:\s*(Ally|Neutral|Enemy)/i);
    const stance = stanceMatch ? stanceMatch[1] : 'Neutral';

    // Convert stance to initial relationship points (will be refined in Step 3)
    let initialPoints = 0;
    if (stance === 'Ally') initialPoints = 30;
    else if (stance === 'Enemy') initialPoints = -40;

    // Create NPC ID (lowercase, replace spaces with underscores)
    const id = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

    npcs.push({
      id: id,
      name: name,
      relationshipPoints: initialPoints,
      status: 'alive',
      location: 'Unknown',
      flagsSet: [],
      lastInteraction: null
    });
  }

  return npcs;
}

/**
 * Parse factions from Step 0 Living File and initialize reputation
 */
function parseFactionReputationFromLivingFile(step0Content) {
  const factions = [];

  // Match faction sections
  const factionMatches = step0Content.matchAll(/---\s*(.+?)\s*---[\s\S]*?Type:[\s\S]*?(?=---|===|$)/g);

  for (const match of factionMatches) {
    const name = match[1].trim();

    factions.push({
      name: name,
      reputation: 0,  // Neutral starting reputation
      flagsSet: []
    });
  }

  return factions;
}

/**
 * Apply delta updates from DM response to Save File
 */
export function applySaveFileUpdates(currentSaveFile, updates) {
  if (!updates) return currentSaveFile;

  const newSaveFile = JSON.parse(JSON.stringify(currentSaveFile));  // Deep clone

  // Character updates (relative changes)
  if (updates.hp !== undefined) {
    newSaveFile.character.hp.current += updates.hp;
    // Clamp to 0-max
    newSaveFile.character.hp.current = Math.max(0, Math.min(newSaveFile.character.hp.current, newSaveFile.character.hp.max));
  }

  if (updates.xp !== undefined) {
    newSaveFile.character.xp += updates.xp;
  }

  if (updates.level !== undefined) {
    newSaveFile.character.level = updates.level;  // Absolute value
  }

  if (updates.gold !== undefined) {
    newSaveFile.inventory.gold += updates.gold;
    newSaveFile.inventory.gold = Math.max(0, newSaveFile.inventory.gold);  // Can't go negative
  }

  // NPC relationship updates (relative changes)
  Object.keys(updates).forEach(key => {
    if (key.startsWith('npc_') && key.endsWith('_relationship')) {
      const npcId = key.replace('npc_', '').replace('_relationship', '');
      const npc = newSaveFile.npcs.find(n => n.id === npcId);
      if (npc) {
        npc.relationshipPoints += updates[key];
        // Clamp to -100 to +150
        npc.relationshipPoints = Math.max(-100, Math.min(150, npc.relationshipPoints));
      }
    }
  });

  // Story flags (additive only)
  if (updates.flags_add && Array.isArray(updates.flags_add)) {
    newSaveFile.storyFlags = [...new Set([...newSaveFile.storyFlags, ...updates.flags_add])];
  }

  // Inventory additions
  if (updates.inventory_add && Array.isArray(updates.inventory_add)) {
    updates.inventory_add.forEach(newItem => {
      const existing = newSaveFile.inventory.items.find(i => i.name === newItem.name);
      if (existing) {
        existing.count = (existing.count || 1) + (newItem.count || 1);
      } else {
        newSaveFile.inventory.items.push({ ...newItem, count: newItem.count || 1 });
      }
    });
  }

  // Inventory removals
  if (updates.inventory_remove && Array.isArray(updates.inventory_remove)) {
    updates.inventory_remove.forEach(removeItem => {
      const existing = newSaveFile.inventory.items.find(i => i.name === removeItem.name);
      if (existing) {
        existing.count = (existing.count || 1) - (removeItem.count || 1);
        // Remove item entirely if count reaches 0
        if (existing.count <= 0) {
          newSaveFile.inventory.items = newSaveFile.inventory.items.filter(i => i.name !== removeItem.name);
        }
      }
    });
  }

  // Status effects
  if (updates.status_add && Array.isArray(updates.status_add)) {
    newSaveFile.character.statusEffects = [...newSaveFile.character.statusEffects, ...updates.status_add];
  }

  if (updates.status_remove && Array.isArray(updates.status_remove)) {
    newSaveFile.character.statusEffects = newSaveFile.character.statusEffects.filter(
      effect => !updates.status_remove.includes(effect.effect || effect)
    );
  }

  // Update metadata
  newSaveFile.metadata.lastPlayed = new Date().toISOString();
  newSaveFile.metadata.turnCount += 1;

  // Validate before returning
  validateSaveFile(newSaveFile);

  return newSaveFile;
}

/**
 * Validate Save File structure
 */
function validateSaveFile(saveFile) {
  const required = ['metadata', 'character', 'npcs', 'inventory', 'storyFlags'];
  required.forEach(field => {
    if (!saveFile[field]) {
      throw new Error(`Invalid save file: missing ${field}`);
    }
  });

  // Validate character
  if (!saveFile.character.name || !saveFile.character.hp) {
    throw new Error('Invalid save file: character missing required fields');
  }

  // Validate NPCs
  if (!Array.isArray(saveFile.npcs)) {
    throw new Error('Invalid save file: npcs must be array');
  }

  // All good
  return true;
}
