#!/usr/bin/env python3
"""
kimi_debate.py — Generate 8 fresh April 2026 AI debate posts via Kimi K2.5
and write them into src/data/debates.ts alongside the existing 3.

Usage:
  python3 scripts/kimi_debate.py generate   # call Kimi, write file
  python3 scripts/kimi_debate.py dry-run    # print prompt only, no API call
"""

import json
import re
import sys
import os
import time
import urllib.request
import urllib.parse
from pathlib import Path

# ─── paths ────────────────────────────────────────────────────────────────────
OPENCLAW_JSON   = Path.home() / ".openclaw" / "openclaw.json"
DEBATES_TS_PATH = Path(__file__).parent.parent / "src" / "data" / "debates.ts"

# ─── Kimi API config ──────────────────────────────────────────────────────────
KIMI_URL    = "https://api.kimi.com/coding/v1/messages"
KIMI_MODEL  = "kimi-k2.5"
TIMEOUT_SEC = 360

# ─── the 3 original debates (verbatim from source file) ──────────────────────
ORIGINAL_DEBATES_LITERAL = """\
  {
    id: 'ai-job-2026-03-20-am',
    date: '2026-03-20',
    session: 'morning',
    topic: {
      zh: 'AI会在2026年内取代50%的软件工程师吗？',
      ja: 'AIは2026年中にソフトウェアエンジニアの50%を代替するか？',
      en: 'Will AI replace 50% of software engineers by end of 2026?',
    },
    newsSource: 'Goldman Sachs report: AI could automate 25% of work tasks in 2026',
    aiOpinions: [
      {
        model: 'Claude 3.5 Sonnet',
        modelColor: '#c084fc',
        stance: 'con',
        opinion: {
          zh: '不会。50%是夸大其词。AI会自动化重复性编码任务，但复杂系统设计、业务理解、团队协作等核心能力仍需人类。真正的影响是：工程师的工作内容会改变，而不是消失。',
          ja: 'それはないでしょう。50%は誇張です。AIは繰り返しのコーディング作業を自動化しますが、複雑なシステム設計やチームコラボレーションは依然として人間が必要です。',
          en: "No. 50% is an overstatement. AI will automate repetitive coding tasks, but complex system design and team collaboration still require humans. Engineers will change, not disappear.",
        },
      },
      {
        model: 'GPT-4o',
        modelColor: '#4ade80',
        stance: 'neutral',
        opinion: {
          zh: '取决于"取代"的定义。AI降低了开发门槛，创造了更多应用场景，反而可能增加对工程师的总体需求。某些初级岗位会消失，但高级工程师需求上升。',
          ja: '「代替」の定義による。AIは開発の敷居を下げ、より多くのアプリを生み出すため、全体的なエンジニア需要は増える可能性もあります。初級職は減り、上級職は増えるでしょう。',
          en: "Depends on what 'replace' means. AI lowers the barrier to development, potentially creating more engineering jobs overall. Junior roles may shrink, senior roles will grow.",
        },
      },
      {
        model: 'DeepSeek V3',
        modelColor: '#fb923c',
        stance: 'pro',
        opinion: {
          zh: '以中国市场来看，AI编程工具已在大幅压缩初级程序员需求。大厂缩减校招HC、用AI工具替代初级任务，这一趋势不可逆。50%可能夸张，但30-40%是合理预测。',
          ja: '中国市場では、AIプログラミングツールが既にジュニアエンジニアの需要を削減しています。この傾向は不可逆的です。50%は誇張かもしれませんが、30〜40%は妥当な予測です。',
          en: 'In the Chinese market, AI coding tools are already reducing junior developer demand significantly. This trend is irreversible. 50% may be exaggerated, but 30-40% is reasonable.',
        },
      },
    ],
    tags: ['AI就業', 'プログラミング', '将来予測'],
  },
  {
    id: 'llm-open-closed-2026-03-20-pm',
    date: '2026-03-20',
    session: 'evening',
    topic: {
      zh: '开源大模型能否在2026年追上GPT-5？',
      ja: 'オープンソースLLMは2026年にGPT-5に追いつけるか？',
      en: 'Can open-source LLMs catch up to GPT-5 in 2026?',
    },
    newsSource: 'Meta releases Llama 4 with 405B parameters, closes gap with proprietary models',
    aiOpinions: [
      {
        model: 'Claude 3.5 Sonnet',
        modelColor: '#c084fc',
        stance: 'neutral',
        opinion: {
          zh: '取决于评测维度。在代码、推理等可量化任务上，开源模型正快速逼近。但GPT-5在多模态、综合能力上仍有优势。"追上"这个目标本身是动态的。',
          ja: '評価軸によります。コードや推論では追いついています。ただしGPT-5はマルチモーダルでまだ優位。「追いつく」という目標自体が動的です。',
          en: 'Depends on the metric. On coding and reasoning, open-source is catching up fast. But GPT-5 still leads on multimodal capabilities. The target itself keeps moving.',
        },
      },
      {
        model: 'Gemini 1.5 Pro',
        modelColor: '#38bdf8',
        stance: 'pro',
        opinion: {
          zh: '会的。Llama 4、Qwen3等进步速度超出预期。更重要的是，开源生态的工程化能力（微调、部署、推理优化）已远超闭源模型，实用性上已经追平。',
          ja: 'はい。Llama 4やQwen3の進歩は予想を超えています。オープンソースエコシステムの実用化能力はクローズドモデルをすでに超えている点も重要です。',
          en: 'Yes. Llama 4 and Qwen3 are progressing faster than expected. The open-source ecosystem in fine-tuning and deployment has already surpassed closed models practically.',
        },
      },
    ],
    tags: ['LLM', 'オープンソース', 'GPT-5'],
  },
  {
    id: 'ai-regulation-2026-03-19-am',
    date: '2026-03-19',
    session: 'morning',
    topic: {
      zh: 'AI监管是推动还是阻碍技术发展？',
      ja: 'AI規制は技術発展を促進するか、それとも阻害するか？',
      en: 'Does AI regulation accelerate or hinder technological progress?',
    },
    newsSource: 'EU AI Act full enforcement begins, companies scramble to comply',
    aiOpinions: [
      {
        model: 'Claude 3.5 Sonnet',
        modelColor: '#c084fc',
        stance: 'pro',
        opinion: {
          zh: '适度监管能推动发展。欧盟AI法规强迫企业建立可信AI系统，长期来看会提升用户信任度和商业价值。没有监管的AI泡沫化风险更大。',
          ja: '適切な規制は発展を促します。EUのAI規制は信頼できるAIシステムの構築を強制し、長期的にはユーザーの信頼とビジネス価値を高めます。',
          en: 'Moderate regulation promotes development. EU AI Act forces companies to build trustworthy AI, which long-term increases user trust and business value.',
        },
      },
      {
        model: 'GPT-4o',
        modelColor: '#4ade80',
        stance: 'con',
        opinion: {
          zh: '目前的监管路径有问题。EU AI Act的合规成本主要压在中小企业身上，加速市场垄断。好的监管需要技术中立原则，而不是一刀切。',
          ja: '現在の規制アプローチには問題があります。コンプライアンスコストは主に中小企業に重く、市場独占を加速させています。技術中立の原則が必要です。',
          en: 'Current regulation has issues. Compliance costs fall mainly on SMEs, accelerating monopolization. Good regulation needs technology-neutral principles.',
        },
      },
    ],
    tags: ['AI規制', 'EU', 'ガバナンス'],
  },"""

# ─── prompt ───────────────────────────────────────────────────────────────────
GENERATION_PROMPT = """\
You are generating content for an AI debate blog. Produce a JSON array of exactly 8 DebatePost objects covering the following April 2026 AI news events:

1. Anthropic signs US defense contract (controversial, April 2026)
2. Claude Sonnet 4 / Claude 4 Opus release (April 2026)
3. GPT-5.4 benchmark results leak (April 2026)
4. AI agents replacing knowledge workers — McKinsey report April 2026
5. Open-source Llama 4 Scout vs closed models gap narrows
6. Japan AI white paper 2026 released by government
7. GitHub Copilot Agent mode full GA release
8. MCP (Model Context Protocol) mainstream adoption by major IDEs

STRICT RULES:
- Output a raw JSON array only. No markdown fencing, no explanation, no text before or after the JSON.
- Each object must have these exact fields:
  {
    "id": string,               // kebab-case, unique, no date in it — just topic slug
    "date": string,             // YYYY-MM-DD, use 2026-04-01 through 2026-04-18, one per item
    "session": "morning"|"evening",  // alternate: odd items morning, even items evening
    "topic": { "zh": string, "ja": string, "en": string },   // NO dates in topic text — just the debate question
    "newsSource": string,       // short news headline, NO date in it
    "newsDate": string,         // YYYY-MM-DD when the news broke (same as date field)
    "aiOpinions": [ ... ],      // exactly 3 per debate
    "tags": [ string, string, string ]  // 3 tags, mix of CJK and English
  }
- id format: lowercase-english-slug (e.g. "anthropic-defense-contract", "claude-4-release")
- topic strings must be debate questions, not statements. No timestamps. zh should be a natural Chinese question ending in ？
- newsSource: a brief plausible news headline (no year/date embedded)
- session: item 1=morning, 2=evening, 3=morning, 4=evening, 5=morning, 6=evening, 7=morning, 8=evening
- dates: 2026-04-01, 2026-04-03, 2026-04-05, 2026-04-07, 2026-04-09, 2026-04-12, 2026-04-15, 2026-04-18
- aiOpinions: rotate these 5 models, pick 3 per debate in order:
    Debate 1: Claude Sonnet 4 (#c084fc), GPT-5 (#4ade80), Kimi K2.5 (#fb923c)
    Debate 2: GPT-5 (#4ade80), DeepSeek R2 (#38bdf8), Gemini 2.0 Pro (#a78bfa)
    Debate 3: Kimi K2.5 (#fb923c), Claude Sonnet 4 (#c084fc), DeepSeek R2 (#38bdf8)
    Debate 4: DeepSeek R2 (#38bdf8), Gemini 2.0 Pro (#a78bfa), GPT-5 (#4ade80)
    Debate 5: Gemini 2.0 Pro (#a78bfa), Kimi K2.5 (#fb923c), Claude Sonnet 4 (#c084fc)
    Debate 6: Claude Sonnet 4 (#c084fc), DeepSeek R2 (#38bdf8), GPT-5 (#4ade80)
    Debate 7: GPT-5 (#4ade80), Kimi K2.5 (#fb923c), Gemini 2.0 Pro (#a78bfa)
    Debate 8: DeepSeek R2 (#38bdf8), Claude Sonnet 4 (#c084fc), Kimi K2.5 (#fb923c)
- Each model's opinion object: { "zh": string, "ja": string, "en": string }
  - zh: 4-6 sentences in Chinese, substantive with specific data or examples, no generic platitudes
  - ja: proper natural Japanese, 4-6 sentences, specific and nuanced
  - en: fluent English, 4-6 sentences, specific and analytical
- stances must be diverse within each debate — do NOT make all 3 opinions "neutral". Assign: pro, con, neutral or pro, con, pro etc. Only one neutral per debate max.
- tags: 3 tags per debate. Mix languages. Examples: 'AI安全', 'Defense', '軍事利用', 'オープンソース', 'benchmark', etc.

Quality bar: opinions should read like a thoughtful AI commentator actually familiar with the topic. Include specific numbers, company names, technical details. Avoid filler phrases like "this is a complex issue."

Output the JSON array now. Start with [ and end with ]. Nothing else."""

# ─── helpers ──────────────────────────────────────────────────────────────────

def load_api_key() -> str:
    """Read Kimi API key from ~/.openclaw/openclaw.json."""
    if not OPENCLAW_JSON.exists():
        raise FileNotFoundError(f"openclaw.json not found at {OPENCLAW_JSON}")
    with open(OPENCLAW_JSON) as f:
        cfg = json.load(f)
    try:
        key = cfg["models"]["providers"]["kimi"]["apiKey"]
    except KeyError as e:
        raise KeyError(f"Could not find models.providers.kimi.apiKey in openclaw.json: {e}")
    if not key:
        raise ValueError("Kimi API key is empty in openclaw.json")
    return key


def call_kimi(api_key: str, prompt: str) -> str:
    """POST to Kimi API, return raw text content."""
    body = json.dumps({
        "model": KIMI_MODEL,
        "max_tokens": 16000,
        "messages": [{"role": "user", "content": prompt}],
    }).encode("utf-8")

    req = urllib.request.Request(
        KIMI_URL,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
        },
    )

    print(f"[kimi_debate] Calling {KIMI_URL} (model={KIMI_MODEL}, timeout={TIMEOUT_SEC}s) …")
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
                raw = resp.read().decode("utf-8")
            break
        except Exception as e:
            print(f"  attempt {attempt + 1} failed: {e}", flush=True)
            if attempt == 2:
                raise
            time.sleep(3 + attempt * 3)

    data = json.loads(raw)
    # Anthropic-compat response: data["content"][0]["text"]
    try:
        text = data["content"][0]["text"]
    except (KeyError, IndexError, TypeError):
        # Fallback: OpenAI-compat
        try:
            text = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, TypeError):
            raise ValueError(f"Unexpected Kimi response shape:\n{raw[:3000]}")
    return text


def tolerant_json_parse(raw: str) -> list:
    """
    Try json.loads first. On failure, attempt to fix raw newlines inside
    JSON string values, then retry.
    """
    raw = raw.strip()

    # Strip markdown fences if present
    if raw.startswith("```"):
        lines = raw.splitlines()
        # drop first line (```json or ```) and last line (```)
        inner = []
        started = False
        for line in lines:
            if not started:
                if line.startswith("```"):
                    started = True
                continue
            if line.strip() == "```":
                break
            inner.append(line)
        raw = "\n".join(inner).strip()

    # Attempt 1: direct parse
    try:
        return json.loads(raw)
    except json.JSONDecodeError as e1:
        print(f"[parse] Initial parse failed: {e1}")

    # Attempt 2: fix unescaped literal newlines inside string values
    # Strategy: use a state machine to escape \n inside quoted strings
    print("[parse] Trying tolerant newline-escape fix …")
    fixed = _escape_newlines_in_strings(raw)
    try:
        return json.loads(fixed)
    except json.JSONDecodeError as e2:
        print(f"[parse] Tolerant parse also failed: {e2}")
        print("[parse] First 500 chars of raw response:\n", raw[:500])
        raise


def _escape_newlines_in_strings(text: str) -> str:
    """Escape literal newlines/tabs found inside JSON string literals."""
    result = []
    in_string = False
    escape_next = False
    for ch in text:
        if escape_next:
            result.append(ch)
            escape_next = False
            continue
        if ch == '\\' and in_string:
            result.append(ch)
            escape_next = True
            continue
        if ch == '"':
            in_string = not in_string
            result.append(ch)
            continue
        if in_string and ch == '\n':
            result.append('\\n')
            continue
        if in_string and ch == '\r':
            result.append('\\r')
            continue
        if in_string and ch == '\t':
            result.append('\\t')
            continue
        result.append(ch)
    return ''.join(result)


# ─── TypeScript serialisation ─────────────────────────────────────────────────

def ts_str(s: str) -> str:
    """Wrap a Python string as a single-quoted TS string, escaping ' and newlines."""
    s = s.replace("\\", "\\\\")   # backslashes first
    s = s.replace("'", "\\'")     # single quotes
    s = s.replace("\n", "\\n")    # literal newlines
    s = s.replace("\r", "")       # strip CR
    return f"'{s}'"


def debate_to_ts(d: dict, indent: int = 2) -> str:
    """Serialise a single DebatePost dict to TypeScript object literal."""
    pad  = " " * indent
    pad2 = " " * (indent + 2)
    pad3 = " " * (indent + 4)
    pad4 = " " * (indent + 6)
    pad5 = " " * (indent + 8)

    lines = [f"{pad}{{"]
    lines.append(f"{pad2}id: {ts_str(d['id'])},")
    lines.append(f"{pad2}date: {ts_str(d['date'])},")
    lines.append(f"{pad2}session: {ts_str(d['session'])},")

    topic = d["topic"]
    lines.append(f"{pad2}topic: {{")
    lines.append(f"{pad3}zh: {ts_str(topic['zh'])},")
    lines.append(f"{pad3}ja: {ts_str(topic['ja'])},")
    lines.append(f"{pad3}en: {ts_str(topic['en'])},")
    lines.append(f"{pad2}}},")

    lines.append(f"{pad2}newsSource: {ts_str(d['newsSource'])},")
    if d.get("newsDate"):
        lines.append(f"{pad2}newsDate: {ts_str(d['newsDate'])},")

    lines.append(f"{pad2}aiOpinions: [")
    for op in d["aiOpinions"]:
        lines.append(f"{pad3}{{")
        lines.append(f"{pad4}model: {ts_str(op['model'])},")
        lines.append(f"{pad4}modelColor: {ts_str(op['modelColor'])},")
        lines.append(f"{pad4}stance: {ts_str(op['stance'])},")
        opinion = op["opinion"]
        lines.append(f"{pad4}opinion: {{")
        lines.append(f"{pad5}zh: {ts_str(opinion['zh'])},")
        lines.append(f"{pad5}ja: {ts_str(opinion['ja'])},")
        lines.append(f"{pad5}en: {ts_str(opinion['en'])},")
        lines.append(f"{pad4}}},")
        lines.append(f"{pad3}}},")
    lines.append(f"{pad2}],")

    tags_ts = ", ".join(ts_str(t) for t in d["tags"])
    lines.append(f"{pad2}tags: [{tags_ts}],")
    lines.append(f"{pad}}},")
    return "\n".join(lines)


def build_debates_ts(new_debates: list) -> str:
    """Build the complete debates.ts content."""

    # serialise new debates
    new_ts_blocks = []
    for d in new_debates:
        new_ts_blocks.append(debate_to_ts(d))

    new_debates_ts = "\n".join(new_ts_blocks)

    return f"""\
export type AIOpinion = {{
  model: string;
  modelColor: string;
  stance: 'pro' | 'con' | 'neutral';
  opinion: {{ zh: string; ja: string; en: string }};
}};

export type DebatePost = {{
  id: string;
  date: string;
  session: 'morning' | 'evening';
  topic: {{ zh: string; ja: string; en: string }};
  newsSource: string;       // news headline only — NO DATE in the title
  newsDate?: string;        // optional: YYYY-MM-DD of when news broke
  aiOpinions: AIOpinion[];
  tags: string[];
}};

export const debates: DebatePost[] = [
{ORIGINAL_DEBATES_LITERAL}
{new_debates_ts}
];

export function getDebateById(id: string): DebatePost | undefined {{
  return debates.find((d) => d.id === id);
}}

export function getDebatesByDate(date: string): DebatePost[] {{
  return debates.filter((d) => d.date === date);
}}
"""


# ─── validate basic structure ─────────────────────────────────────────────────

def validate_debates(debates: list) -> None:
    required_top = {"id", "date", "session", "topic", "newsSource", "aiOpinions", "tags"}
    required_opinion = {"model", "modelColor", "stance", "opinion"}
    required_trilingual = {"zh", "ja", "en"}
    valid_sessions = {"morning", "evening"}
    valid_stances = {"pro", "con", "neutral"}

    for i, d in enumerate(debates):
        missing = required_top - set(d.keys())
        if missing:
            raise ValueError(f"Debate {i} missing fields: {missing}")
        if d["session"] not in valid_sessions:
            raise ValueError(f"Debate {i} invalid session: {d['session']!r}")
        for k in ("topic",):
            if set(d[k].keys()) != required_trilingual:
                raise ValueError(f"Debate {i}.{k} missing trilingual keys")
        if len(d["aiOpinions"]) != 3:
            raise ValueError(f"Debate {i} has {len(d['aiOpinions'])} opinions, expected 3")
        for j, op in enumerate(d["aiOpinions"]):
            missing_op = required_opinion - set(op.keys())
            if missing_op:
                raise ValueError(f"Debate {i} opinion {j} missing: {missing_op}")
            if op["stance"] not in valid_stances:
                raise ValueError(f"Debate {i} opinion {j} invalid stance: {op['stance']!r}")
            if set(op["opinion"].keys()) != required_trilingual:
                raise ValueError(f"Debate {i} opinion {j} missing trilingual keys")
        if len(d["tags"]) != 3:
            raise ValueError(f"Debate {i} has {len(d['tags'])} tags, expected 3")
    print(f"[validate] All {len(debates)} debates passed validation.")


# ─── main ─────────────────────────────────────────────────────────────────────

def cmd_dry_run():
    print("=" * 72)
    print("DRY-RUN MODE — Prompt that would be sent to Kimi K2.5:")
    print("=" * 72)
    print(GENERATION_PROMPT)
    print("=" * 72)
    print(f"API URL : {KIMI_URL}")
    print(f"Model   : {KIMI_MODEL}")
    print(f"Timeout : {TIMEOUT_SEC}s")
    print(f"Output  : {DEBATES_TS_PATH}")


def cmd_generate():
    # 1. Load API key
    api_key = load_api_key()
    print(f"[kimi_debate] Loaded Kimi API key ({api_key[:12]}…)")

    # 2. Call Kimi
    raw_text = call_kimi(api_key, GENERATION_PROMPT)
    print(f"[kimi_debate] Response received ({len(raw_text)} chars)")

    # 3. Parse
    new_debates = tolerant_json_parse(raw_text)
    if not isinstance(new_debates, list):
        raise TypeError(f"Expected JSON array, got {type(new_debates)}")
    if len(new_debates) != 8:
        print(f"[warn] Expected 8 debates, got {len(new_debates)} — proceeding anyway")

    # 4. Validate
    validate_debates(new_debates)

    # 5. Build TypeScript
    ts_content = build_debates_ts(new_debates)

    # 6. Write file
    DEBATES_TS_PATH.parent.mkdir(parents=True, exist_ok=True)
    DEBATES_TS_PATH.write_text(ts_content, encoding="utf-8")
    print(f"[kimi_debate] Written {len(ts_content)} chars to {DEBATES_TS_PATH}")
    print("[kimi_debate] Done. debates.ts now has 3 original + 8 new debates.")


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("generate", "dry-run"):
        print(__doc__)
        print("Error: provide 'generate' or 'dry-run' as argument.")
        sys.exit(1)

    if sys.argv[1] == "dry-run":
        cmd_dry_run()
    else:
        cmd_generate()


if __name__ == "__main__":
    main()
