/**
 * Living File formatting and display utilities
 */

export function formatLivingFile(text) {
  // Parse and format Living File with colors and bold
  const lines = text.split('\n');
  let formattedHTML = '';

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      formattedHTML += '<br>';
      return;
    }

    // Check if line has a label (e.g., "Theme:", "Tone:", etc.)
    const labelMatch = trimmed.match(/^([^:]+):\s*(.*)$/);

    if (labelMatch) {
      const label = labelMatch[1];
      const value = labelMatch[2];
      formattedHTML += `<div style="margin-bottom: 8px;">
        <span style="color: #d97706; font-weight: bold;">${label}:</span>
        <span style="color: #e0e0e0;">${value || '<span style="color: #666;">(empty)</span>'}</span>
      </div>`;
    } else {
      // Regular line without label
      formattedHTML += `<div style="margin-bottom: 4px; color: #e0e0e0;">${trimmed}</div>`;
    }
  });

  return formattedHTML || '<span style="color: #666;">Chat with the World Building Assistant to create your world...</span>';
}
