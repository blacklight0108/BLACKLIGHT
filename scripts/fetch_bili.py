#!/usr/bin/env python3
"""
抓取 B 站 UP 主最新投稿，写入 public/data/updates.json
只用 Python 标准库，不需要安装任何依赖。

用法：
    python3 scripts/fetch_bili.py

它读取 public/content.json 里 ups 数组的 mid（UP 主 UID），
抓每个 UID 的最新投稿，结果写进 public/data/updates.json。
站点重新发布后，UP 雷达页每个卡片下面的「最新更新」就会自动显示。

时间统一：脚本写出的 updatedAt 一律是 UTC（形如 2026-10-25T08:55:31Z），
和 GitHub Actions 的 cron（UTC）保持一致，任何机器上跑结果都一样。
"""

from __future__ import annotations

import hashlib
import json
import os
import random
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "public", "content.json")
UPDATES = os.path.join(ROOT, "public", "data", "updates.json")

# B 站 App 端公开的 appkey（各家第三方客户端通用），用于接口签名
APPKEY = "1d8b6e7d45233436"
APPSECRET = "560c52ccd288fed045859ed18bffd973"
APP_UA = "Mozilla/5.0 BiliDroid/7.0.0 (bbcallen@gmail.com) os/android"
WEB_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def log(msg: str) -> None:
    print(msg, flush=True)


def http_json(url: str, ua: str, referer: str = "https://www.bilibili.com/") -> dict:
    req = urllib.request.Request(url, headers={
        "User-Agent": ua,
        "Referer": referer,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "zh-CN,zh;q=0.9",
    })
    with urllib.request.urlopen(req, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8", "replace"))


def app_sign(params: dict) -> str:
    p = dict(params)
    p.update({
        "appkey": APPKEY,
        "ts": int(time.time()),
        "mobi_app": "android",
        "platform": "android",
        "build": "7000000",
        "c_locale": "zh_CN",
        "s_locale": "zh_CN",
    })
    query = urllib.parse.urlencode(sorted(p.items()))
    p["sign"] = hashlib.md5((query + APPSECRET).encode()).hexdigest()
    return urllib.parse.urlencode(sorted(p.items()))


def fetch_by_app(mid: str, ps: int = 8) -> list[dict]:
    """走 App 端投稿接口，机房 IP 也能拿到数据。"""
    query = app_sign({"vmid": mid, "ps": str(ps), "order": "pubdate"})
    data = http_json(f"https://app.bilibili.com/x/v2/space/archive/cursor?{query}", APP_UA)
    if data.get("code") != 0:
        raise RuntimeError(f"App 接口 code={data.get('code')} {data.get('message', '')}")
    items = (data.get("data") or {}).get("item") or []
    return [
        {
            "title": v.get("title", ""),
            "bvid": v.get("bvid", ""),
            "url": f"https://www.bilibili.com/video/{v.get('bvid', '')}",
            "pubdate": v.get("ctime", 0),
        }
        for v in items
        if v.get("bvid")
    ]


# ── 网页接口（备用方案，机房 IP 常被风控时才会用到）────────────────────
MIXIN_KEY_ENC_TAB = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
    33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
    61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
    36, 20, 34, 44, 52,
]


def fetch_by_web(mid: str, ps: int = 8) -> list[dict]:
    nav = http_json("https://api.bilibili.com/x/web-interface/nav", WEB_UA)
    wbi = (nav.get("data") or {}).get("wbi_img") or {}
    img = os.path.basename(wbi.get("img_url", "")).split(".")[0]
    sub = os.path.basename(wbi.get("sub_url", "")).split(".")[0]
    raw = img + sub
    if len(raw) < 64:
        raise RuntimeError("拿不到签名 key")
    mixin = "".join(raw[i] for i in MIXIN_KEY_ENC_TAB)[:32]

    p = {
        "mid": mid, "ps": ps, "pn": 1, "order": "pubdate",
        "platform": "web", "web_location": 1550101,
        "wts": int(time.time()),
    }
    query = urllib.parse.urlencode(sorted(p.items()))
    p["w_rid"] = hashlib.md5((query + mixin).encode()).hexdigest()
    url = "https://api.bilibili.com/x/space/wbi/arc/search?" + urllib.parse.urlencode(p)
    data = http_json(url, WEB_UA, referer=f"https://space.bilibili.com/{mid}/video")
    if data.get("code") != 0:
        raise RuntimeError(f"网页接口 code={data.get('code')} {data.get('message', '')}")
    vlist = ((data.get("data") or {}).get("list") or {}).get("vlist") or []
    return [
        {
            "title": v.get("title", ""),
            "bvid": v.get("bvid", ""),
            "url": f"https://www.bilibili.com/video/{v.get('bvid', '')}",
            "pubdate": v.get("created", 0),
        }
        for v in vlist
        if v.get("bvid")
    ]


def fetch_latest(mid: str) -> list[dict]:
    try:
        return fetch_by_app(mid)
    except Exception as exc:  # noqa: BLE001
        log(f"    主接口没拿到（{exc}），换备用接口")
        return fetch_by_web(mid)


def fetch_with_retry(mid: str, attempts: int = 2) -> list[dict]:
    """两个接口都抽风时，隔几秒再整体重试一次，尽量少让某个频道掉数据。"""
    last: Exception | None = None
    for i in range(attempts):
        try:
            return fetch_latest(mid)
        except Exception as exc:  # noqa: BLE001
            last = exc
            if i + 1 < attempts:
                log(f"    第 {i + 1} 次失败（{exc}），稍后重试")
                time.sleep(3)
    raise last if last else RuntimeError("抓取失败")


def load_json(path: str, default):
    try:
        with open(path, encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:  # noqa: BLE001
        return default


def main() -> int:
    content = load_json(CONTENT, {})
    ups = content.get("ups") or []
    targets = [(str(u.get("mid", "")).strip(), u.get("name", "")) for u in ups]
    targets = [(mid, name) for mid, name in targets if mid.isdigit()]

    if not targets:
        log("content.json 里还没有填 UP 主 UID（ups[].mid），先填好再跑。")
        return 0

    previous = load_json(UPDATES, {"feeds": {}})
    feeds = previous.get("feeds") or {}
    ok = 0

    for mid, name in targets:
        label = f"{name or 'UP 主'}（{mid}）"
        try:
            items = fetch_with_retry(mid)
            feeds[mid] = items
            ok += 1
            log(f"  ✓ {label}：{len(items)} 条")
        except urllib.error.HTTPError as exc:
            log(f"  ✗ {label}：HTTP {exc.code}（保留上一次的数据）")
        except Exception as exc:  # noqa: BLE001
            log(f"  ✗ {label}：{exc}（保留上一次的数据）")
        time.sleep(random.uniform(1.0, 2.0))  # 别打太快

    now = datetime.now(timezone.utc)
    payload = {
        # 全流程统一 UTC：GitHub Actions 的 cron 是 UTC，这里也写 UTC，两边对得上
        "updatedAt": now.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "updatedAtEpoch": int(now.timestamp()),
        "timezone": "UTC",
        "note": "由 scripts/fetch_bili.py 自动生成，请勿手改。",
        "feeds": feeds,
    }
    os.makedirs(os.path.dirname(UPDATES), exist_ok=True)
    with open(UPDATES, "w", encoding="utf-8") as fh:
        json.dump(payload, fh, ensure_ascii=False, indent=2)
        fh.write("\n")

    log(f"完成：{ok}/{len(targets)} 个频道，写入 {os.path.relpath(UPDATES, ROOT)}（{payload['updatedAt']} UTC）")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
