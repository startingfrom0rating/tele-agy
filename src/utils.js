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
