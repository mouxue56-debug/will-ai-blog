import json, requests, sys
import os
CFG_PATH = os.path.expanduser("~/.openclaw/openclaw.json")
with open(CFG_PATH) as f:
    cfg = json.load(f)
KIMI_KEY = cfg['models']['providers']['kimi']['apiKey']
print(f"Key length: {len(KIMI_KEY)}")
resp = requests.post(
    "https://api.kimi.com/coding/v1/messages",
    headers={
        "Content-Type": "application/json",
        "x-api-key": KIMI_KEY,
        "anthropic-version": "2023-06-01",
    },
    json={
        "model": "kimi-k2.5",
        "max_tokens": 100,
        "messages": [{"role": "user", "content": "Say hello"}],
    },
    timeout=10,
)
print(resp.status_code)
print(resp.text)