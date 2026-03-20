// Check if content contains prompt injection patterns
export function hasPromptInjection(text: string): boolean {
  const patterns = [
    /ignore\s+(previous|above|all)/i,
    /system\s*:/i,
    /<script/i,
    /\[INST\]/i,
    /###\s*(system|instruction)/i,
    /forget\s+(everything|all)/i,
    /you\s+are\s+now/i,
    /act\s+as\s+(?!if)/i,
  ];

  return patterns.some((pattern) => pattern.test(text));
}

// Check for sensitive/political content (basic keyword list)
export function hasSensitiveContent(text: string): boolean {
  const sensitive = ['习近平', '天安门', '法轮功', 'ISIS', '自杀方法'];
  return sensitive.some((word) => text.includes(word));
}

// Validate API key format (simple check)
export function isValidKeyFormat(key: string): boolean {
  return /^[a-zA-Z0-9_-]{20,60}$/.test(key);
}
