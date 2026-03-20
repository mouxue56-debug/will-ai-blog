/** Detect prompt injection attempts */
export function hasPromptInjection(text: string): boolean {
  const patterns = [
    /ignore\s+(previous|above|all)/i,
    /system\s*:/i,
    /<script/i,
    /\[INST\]/i,
    /###\s*(system|instruction)/i,
    /forget\s+(everything|all)/i,
    /you\s+are\s+now\s+/i,
    /disregard\s+(all|previous)/i,
    /new\s+instructions?:/i,
  ];
  return patterns.some((p) => p.test(text));
}

/** Basic sensitive content filter */
export function hasSensitiveContent(text: string): boolean {
  const sensitive = ['法轮功', 'ISIS', 'ISIL', '自杀方法', '制造炸弹'];
  return sensitive.some((w) => text.includes(w));
}

/** Get client IP from request headers */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
