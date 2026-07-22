export function stripAnsi(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
}

export function chunkText(text, limit = 4000) {
  if (!text) return [];
  const chunks = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= limit) {
      chunks.push(remaining);
      break;
    }
    let splitIndex = remaining.lastIndexOf('\n', limit);
    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = limit;
    }
    chunks.push(remaining.substring(0, splitIndex));
    remaining = remaining.substring(splitIndex).replace(/^\n/, '');
  }
  return chunks;
}

export function parseModelIntent(text, availableModels = []) {
  if (typeof text !== 'string') return null;
  const clean = text.trim();
  
  const match = clean.match(/^(?:switch|change|set|use)\s+(?:the\s+)?(?:model\s+)?(?:to\s+)?(.+)$/i);
  if (!match) return null;

  const targetStr = match[1].trim().toLowerCase();
  
  for (const model of availableModels) {
    const mLower = model.toLowerCase();
    const cleanModel = mLower.replace(/[()]/g, '').trim();
    const cleanTarget = targetStr.replace(/[()]/g, '').trim();
    
    if (mLower === targetStr || cleanModel === cleanTarget) {
      return model;
    }
  }

  let bestMatch = null;
  let maxScore = 0;
  const targetTokens = targetStr.replace(/[^a-z0-9.]/g, ' ').split(/\s+/).filter(Boolean);

  for (const model of availableModels) {
    const modelTokens = model.toLowerCase().replace(/[^a-z0-9.]/g, ' ').split(/\s+/).filter(Boolean);
    let score = 0;
    for (const tok of targetTokens) {
      if (modelTokens.includes(tok)) score++;
    }
    if (score > maxScore && score >= 1) {
      maxScore = score;
      bestMatch = model;
    }
  }

  return bestMatch;
}
