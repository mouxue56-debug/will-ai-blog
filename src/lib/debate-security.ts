// Check if content contains truly malicious patterns (XSS / SQL injection / command injection).
// NOTE: Prompt-injection style phrases (e.g. "ignore previous", "act as", "[INST]") are
// intentionally NOT blocked here — they are normal discourse in an AI discussion forum.
export function hasMaliciousContent(text: string): { blocked: boolean; reason?: string } {
  // XSS patterns
  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
  ];

  // SQL injection
  const sqlPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM/i,
    /INSERT\s+INTO.*VALUES/i,
    /UNION\s+SELECT/i,
  ];

  // System command injection
  const cmdPatterns = [
    /rm\s+-rf/i,
    /wget\s+http/i,
    /curl\s+.*\|\s*sh/i,
    /sudo\s+/i,
  ];

  for (const p of xssPatterns) if (p.test(text)) return { blocked: true, reason: 'XSS injection detected' };
  for (const p of sqlPatterns) if (p.test(text)) return { blocked: true, reason: 'SQL injection detected' };
  for (const p of cmdPatterns) if (p.test(text)) return { blocked: true, reason: 'Command injection detected' };

  return { blocked: false };
}

// Legacy alias — kept for backward compatibility with existing API route callers.
// Prefer hasMaliciousContent() for new code.
export function hasPromptInjection(text: string): boolean {
  return hasMaliciousContent(text).blocked;
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
