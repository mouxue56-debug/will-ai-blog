// 速率限制 + 内容过滤工具
// 注：评论系统已用 Redis 做速率限制（见 comments/route.ts）
// 本文件提供内容过滤逻辑，供 comments API 使用

// XSS 注入模式（补全覆盖范围）
const XSS_PATTERNS = [
  /<script/i,
  /javascript:/i,
  /vbscript:/i,
  /on\w+\s*=/i,           // onerror=, onclick=, onload= 等事件处理器
  /data:text\/html/i,
  /<iframe/i,
  /<object/i,
  /<embed/i,
  /expression\s*\(/i,     // CSS expression()
];

// 敏感词列表
const BLOCKED_WORDS = [
  '垃圾', 'spam', 'hack', 'exploit', 'eval(',
  'DROP TABLE', 'SELECT *',
  '他妈', '傻逼', '草泥马', 'fuck', 'shit',
];

export function filterContent(content: string): { ok: boolean; reason?: string } {
  // XSS 注入检测（优先于敏感词）
  if (XSS_PATTERNS.some((p) => p.test(content))) {
    return { ok: false, reason: '内容包含不允许的代码' };
  }

  const lower = content.toLowerCase();

  // 检查敏感词
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { ok: false, reason: '内容包含不允许的词汇' };
    }
  }

  // 长度限制
  if (content.length > 1000) {
    return { ok: false, reason: '评论过长（最多1000字）' };
  }

  // 空内容
  if (content.trim().length < 2) {
    return { ok: false, reason: '评论太短' };
  }

  // 检测纯重复内容（防刷）
  const chars = content.split('').slice(0, 20);
  const unique = new Set(chars);
  if (unique.size < 3 && content.length > 10) {
    return { ok: false, reason: '检测到重复内容' };
  }

  return { ok: true };
}

/**
 * 简单速率限制检查（基于 Redis，已在 checkRateLimit 里实现）
 * 这里提供一个通用接口，方便其他 API 复用
 */
export function validateCommentInput(
  content: string,
  postSlug: string
): { ok: boolean; reason?: string } {
  if (!postSlug || postSlug.trim().length === 0) {
    return { ok: false, reason: 'postSlug 不能为空' };
  }

  return filterContent(content);
}
