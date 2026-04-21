#!/usr/bin/env python3
"""Kimi K2.5 case-study enrichment — expand story/technical/deep with inline links.

Usage:
  python3 scripts/kimi_enrich.py cases [--slug SLUG] [--dry-run] [--backup]

Reads cases.ts, calls Kimi once per case to rewrite story/technical/deep in
zh/ja/en with inline markdown links [text](url), then patches cases.ts.
Key from ~/.openclaw/openclaw.json under models.providers.kimi.apiKey.
"""
from __future__ import annotations
import argparse, json, os, re, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CASES_TS = ROOT / "src/data/cases.ts"
KIMI_URL = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL = "kimi-k2.5"

LINK_POOL = {
    "blog_openclaw_multi": ("/blog/openclaw-multi-instance", "OpenClaw 多实例实录"),
    "blog_swarm_v2": ("/blog/swarm-v2-birth-story", "蜂群引擎 v2 诞生记"),
    "blog_swarm_v62": ("/blog/swarm-v62-evolution", "蜂群 v6.2 进化"),
    "blog_hermes_practical": ("/blog/hermes-openclaw-agent-practical-notes", "Hermes + OpenClaw 实战"),
    "blog_content_pipeline": ("/blog/content-pipeline-full-auto", "内容流水线全自动"),
    "blog_cross_instance_sync": ("/blog/cross-instance-smart-sync", "跨实例智能同步"),
    "blog_memory_lancedb": ("/blog/memory-lancedb-pro-repair-guide", "LanceDB 记忆维修"),
    "blog_mlx_whisper": ("/blog/mlx-whisper-optimization", "MLX Whisper 优化"),
    "blog_ai_clinic": ("/blog/ai-clinic-case", "大阪诊所多语言 AI 咨询"),
    "blog_browser_auto": ("/blog/browser-automation-four-track", "浏览器自动化四轨"),
    "blog_cattery_timeline": ("/blog/cattery-timeline", "猫舎 SNS 运营时间线"),
    "dior_live": ("https://dior.fuluckai.com", "dior.fuluckai.com"),
    "fuluck_site": ("https://fuluck.ai", "fuluck.ai"),
    "cattery_site": ("https://cattery.fuluckai.com", "cattery.fuluckai.com"),
    "openclaw_repo": ("https://github.com/OpenClaw/openclaw", "OpenClaw"),
    "hermes_docs": ("https://hermes.fuluckai.com", "Hermes"),
    "tailscale": ("https://tailscale.com", "Tailscale"),
    "minimax": ("https://www.minimaxi.com", "MiniMax"),
}


def load_key() -> str:
    cfg = Path.home() / ".openclaw/openclaw.json"
    if not cfg.is_file():
        raise RuntimeError(f"Config not found: {cfg}")
    data = json.loads(cfg.read_text())
    providers = data.get("models", {}).get("providers", {})
    k = providers.get("kimi", {}).get("apiKey")
    if not k:
        raise RuntimeError("kimi.apiKey missing in openclaw.json")
    return k.strip()


def kimi_call(prompt: str, key: str, max_tokens: int = 16000) -> str:
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": max_tokens,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")
    req = urllib.request.Request(
        KIMI_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=360) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            blocks = data.get("content", [])
            text = ""
            for b in blocks:
                if b.get("type") == "text":
                    text = b.get("text", "").strip()
                    if text:
                        break
            if text:
                return text
        except Exception as e:
            print(f"    attempt {attempt + 1} failed: {e}", flush=True)
            time.sleep(2 + attempt * 2)
    raise RuntimeError("Kimi call failed 3x")


def parse_json_response(text: str) -> dict:
    t = text.strip()
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*", "", t)
        t = re.sub(r"\s*```$", "", t)
    t = t.strip()
    first = t.find("{")
    if first == -1:
        raise ValueError(f"no JSON braces in response: {t[:200]}")
    # Try finding the matching outer brace from the end
    last = t.rfind("}")
    if last == -1:
        # Response may be truncated — no closing brace at all
        body = t[first:]
    else:
        body = t[first:last + 1]

    # Pass 1: direct parse
    try:
        return json.loads(body)
    except json.JSONDecodeError:
        pass

    # Pass 2: tolerant walk — fix raw newlines/tabs inside string literals
    # and handle unescaped double-quotes by checking structural context
    out = []
    in_str = False
    escape = False
    i = 0
    chars = list(body)
    n = len(chars)
    while i < n:
        ch = chars[i]
        if in_str:
            if escape:
                out.append(ch)
                escape = False
            elif ch == "\\":
                out.append(ch)
                escape = True
            elif ch == '"':
                # Check if this looks like a legitimate string terminator:
                # peek ahead for optional whitespace then : , } ]
                j = i + 1
                while j < n and chars[j] in (' ', '\t', '\r', '\n'):
                    j += 1
                next_structural = chars[j] if j < n else ''
                if next_structural in (':', ',', '}', ']', ''):
                    out.append(ch)
                    in_str = False
                else:
                    # Embedded unescaped quote — escape it
                    out.append('\\"')
            elif ch == "\n":
                out.append("\\n")
            elif ch == "\r":
                pass
            elif ch == "\t":
                out.append("\\t")
            else:
                out.append(ch)
        else:
            if ch == '"':
                in_str = True
            out.append(ch)
        i += 1

    # Close any open string and attempt parse
    if in_str:
        out.append('"')
    fixed = "".join(out)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError:
        pass

    # Pass 3: truncation recovery — scan backwards for last valid partial object
    # Try closing incomplete JSON by appending completion tokens
    for suffix in ('"}}}', '"}}', '"}', '}}}', '}}', '}'):
        try:
            result = json.loads(fixed + suffix)
            if isinstance(result, dict):
                return result
        except json.JSONDecodeError:
            pass

    # Pass 4: extract each field independently using regex (last resort)
    result: dict = {}
    for field in ("story", "technical", "deep"):
        fm = re.search(rf'"{re.escape(field)}"\s*:\s*\{{', fixed)
        if not fm:
            continue
        field_dict: dict = {}
        for loc in ("zh", "ja", "en"):
            lm = re.search(rf'"{re.escape(loc)}"\s*:\s*"((?:[^"\\]|\\.)*)"', fixed[fm.end():])
            if lm:
                val = lm.group(1).replace("\\n", "\n").replace("\\t", "\t").replace('\\"', '"')
                field_dict[loc] = val
        if field_dict:
            result[field] = field_dict
    if result:
        return result

    raise ValueError(f"Could not parse JSON response (len={len(text)}): {text[:300]}")


def extract_case_blocks(ts: str) -> list[tuple[int, int, dict]]:
    """Return [(start_index, end_index, {slug, block})] for each case entry in ts."""
    out = []
    anchor = ts.find("export const cases")
    if anchor == -1:
        raise RuntimeError("cases array not found")
    assign = ts.find("=", anchor)
    bracket = ts.find("[", assign)
    if bracket == -1:
        raise RuntimeError("[ not found")
    i = bracket + 1
    depth = 0
    start = -1
    in_str = None
    escape = False
    while i < len(ts):
        ch = ts[i]
        if in_str:
            if escape:
                escape = False
            elif ch == "\\":
                escape = True
            elif ch == in_str:
                in_str = None
        else:
            if ch in ("'", '"', "`"):
                in_str = ch
            elif ch == "{":
                if depth == 0:
                    start = i
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0 and start != -1:
                    block = ts[start:i + 1]
                    slug_m = re.search(r"slug:\s*'([^']+)'", block)
                    if slug_m:
                        out.append((start, i + 1, {"slug": slug_m.group(1), "block": block}))
                    start = -1
            elif ch == "]" and depth == 0:
                break
        i += 1
    return out


def replace_field_in_block(block: str, field: str, locale: str, new_value: str) -> str:
    """Replace story/technical/deep[locale] value in block."""
    # Escape for embedding in a TS single-quoted string
    esc = new_value.replace("\\", "\\\\").replace("'", "\\'").replace("\n", "\\n")
    # Find "<field>:" object, then locale key inside
    m = re.search(rf"({re.escape(field)}:\s*\{{[\s\S]*?\}})", block)
    if not m:
        return block
    obj = m.group(1)
    # Find the exact locale key position and replace via string slicing
    # (avoids re.sub replacement-string interpretation of \n as newline)
    lm = re.search(rf"({locale}:\s*)'(?:[^'\\]|\\.)*'", obj)
    if not lm:
        return block
    new_obj = obj[:lm.start()] + f"{locale}: '{esc}'" + obj[lm.end():]
    return block[:m.start(1)] + new_obj + block[m.end(1):]


ENRICH_PROMPT = """你是一个资深技术写作者，正在帮 Will（AI 工作流实验者）彻底重写一个 case study 的三段式正文：story / technical / deep。每段都要用中文(zh)、日文(ja)、英文(en) 输出。

**输入（原文）：**
标题：{title_zh} / {title_en}
副标题：{subtitle_zh}
tech stack: {tech}

原 story (zh)：{story_zh}
原 technical (zh)：{technical_zh}
原 deep (zh)：{deep_zh}

**重写要求（必须严格遵守，不照做视作失败）：**

1. **大幅扩写**：每段至少是原文的 2.5 倍长度（250%-320%）。不要水，要加具体细节——时间、数字、人名、工具版本、具体卡点、具体突破、原话引用、代码片段（用 ``` 包裹）、对比、反直觉发现。

2. **强制结构化 markdown 排版**，每段内部必须包含：
   - 至少 2 个 `## 小标题` 切分子主题（不要从 `#` 开始，从 `##` 起步）
   - 至少 1 个无序列表 `- 项` 或有序列表 `1. 项`
   - 至少 1 处 **粗体** 关键词
   - 适当使用 `` `inline code` `` 包裹技术名词（命令、变量、路径、API）
   - 可选：> 块引用 包裹一句关键洞察

3. **超链接密度**：每段（每个 locale）插入 **5-8 个 inline markdown 链接** `[锚文本](URL)`，链接对象必须来自下面这个链接池，上下文强相关才用，不要硬塞：
{link_pool}

4. **分段职责明确**：
   - `story`：场景化、有情绪、讲"为什么做、卡在哪、最后怎么走出来"，像朋友间的夜谈。开头用一句钩子，不要流水账。
   - `technical`：工程细节，要能被同行看出门道。架构图用文字描述、关键配置用 `code` 包裹、tradeoff 列清楚、踩过的坑有具体报错。
   - `deep`：反思层，讲认知变化、对行业/工作流的启发、如果重来会怎么做。不要喊口号，要有反常识观点。

5. **本地化**：日语和英语不要直译，要按各自语言读者的阅读习惯重构句式。技术品牌词保持原样（OpenClaw、MiniMax、Kimi、DeepSeek、Hermes、Tailscale、Next.js、LanceDB 等）。

6. **标点**：中文全角标点，日文日式标点（「」、『』、，），英文半角。

7. **输出格式**：严格输出 JSON only，不要 ```code fence 包裹整个 JSON，不要前言后语。markdown 内容里可以用 ```lang ... ``` 代码块，但整体 JSON 不要被 fence。格式：

{{
  "story":     {{"zh":"...","ja":"...","en":"..."}},
  "technical": {{"zh":"...","ja":"...","en":"..."}},
  "deep":      {{"zh":"...","ja":"...","en":"..."}}
}}

注意所有 `"..."` 里的换行在 JSON 里用 `\\n` 表示，确保 JSON 严格合法。
"""


def build_prompt(block: str, title_en: str) -> str:
    def get_nested(field: str, locale: str) -> str:
        m = re.search(
            rf"{re.escape(field)}:\s*\{{[\s\S]*?{locale}:\s*'((?:[^'\\]|\\.)*)'",
            block,
        )
        return m.group(1).replace("\\'", "'").replace("\\n", "\n") if m else ""

    title_zh = re.search(r"title:\s*\{\s*zh:\s*'([^']+)'", block)
    subtitle_zh = re.search(r"subtitle:\s*\{\s*zh:\s*'([^']+)'", block)
    techm = re.search(r"techStack:\s*\[([^\]]+)\]", block)
    tech = techm.group(1).replace("'", "").strip() if techm else ""

    link_pool_str = "\n".join(
        f"- {url}  — {label}" for (url, label) in LINK_POOL.values()
    )
    return ENRICH_PROMPT.format(
        title_zh=title_zh.group(1) if title_zh else "",
        title_en=title_en,
        subtitle_zh=subtitle_zh.group(1) if subtitle_zh else "",
        tech=tech,
        story_zh=get_nested("story", "zh"),
        technical_zh=get_nested("technical", "zh"),
        deep_zh=get_nested("deep", "zh"),
        link_pool=link_pool_str,
    )


def cmd_cases(args):
    key = load_key()
    if args.backup:
        ts0 = CASES_TS.read_text()
        bk = CASES_TS.with_suffix(".ts.bak")
        bk.write_text(ts0)
        print(f"backup → {bk}")

    # Collect slugs to process first, then iterate — re-reading file each time
    # so incremental writes keep offsets valid.
    all_blocks = extract_case_blocks(CASES_TS.read_text())
    slug_list = [b[2]["slug"] for b in all_blocks if not args.slug or b[2]["slug"] == args.slug]
    print(f"Targets: {len(slug_list)}")

    for slug in slug_list:
        # Re-read and re-parse every iteration so offsets stay correct after writes
        ts = CASES_TS.read_text()
        blocks = extract_case_blocks(ts)
        entry = next((b for b in blocks if b[2]["slug"] == slug), None)
        if entry is None:
            print(f"  SKIP {slug} (not found after re-parse)")
            continue
        start, end, meta = entry
        block = meta["block"]
        title_en_m = re.search(r"title:\s*\{[\s\S]*?en:\s*'([^']+)'", block)
        title_en = title_en_m.group(1) if title_en_m else slug
        prompt = build_prompt(block, title_en)
        if args.dry_run:
            print(f"  DRY {slug} (prompt {len(prompt)} chars)")
            continue
        print(f"  calling Kimi for {slug} …", flush=True)
        try:
            raw = kimi_call(prompt, key)
            parsed = parse_json_response(raw)
        except Exception as e:
            print(f"  FAIL {slug}: {e}")
            continue
        new_block = block
        for field in ("story", "technical", "deep"):
            for locale in ("zh", "ja", "en"):
                val = parsed.get(field, {}).get(locale)
                if not val:
                    continue
                new_block = replace_field_in_block(new_block, field, locale, val)
        # Write immediately — crash-safe incremental save
        CASES_TS.write_text(ts[:start] + new_block + ts[end:])
        print(f"  OK  {slug}")
        time.sleep(1.0)

    print(f"done → {CASES_TS}")


def main():
    p = argparse.ArgumentParser()
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("cases")
    c.add_argument("--slug", type=str, default="")
    c.add_argument("--dry-run", action="store_true")
    c.add_argument("--backup", action="store_true", default=True)
    c.set_defaults(func=cmd_cases)
    args = p.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
