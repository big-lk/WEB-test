"""AOI の定義と注視点の割り当て。

2 つの方式：
1. 動的 AOI（推奨）：ログ強化パッチ版が events に残す "aoi_layout"（描画・スクロール・リサイズの
   たびに各要素の画面座標を記録）を、時刻ごとに使い分ける。
2. 静的 AOI（現行 v5.0.18 の近似）：1920×1080・全画面・倍率 100% で実測した座標。
   現行版はスクロールを記録しないため、左側は「最新回答」と「履歴」を区別できず、
   左側全体を ANSWER として扱う。

座標は CSS px（全画面時は画面座標と一致）。2026-11-17 に preview 画面で実測。
"""
from __future__ import annotations

from bisect import bisect_right
from dataclasses import dataclass

Rect = tuple[float, float, float, float]  # x, y, w, h

# AOI → 分析上のまとまり（両 UI に共通するものだけを群間比較に使う）
GROUP = {
    "AI_LATEST": "ANSWER", "LEFT_CHAT": "ANSWER", "HISTORY": "HISTORY",
    "CARD_1": "PANEL", "CARD_2": "PANEL", "CARD_3": "PANEL",
    "INPUT": "INPUT", "GUIDE": "GUIDE", "EXAMPLE": "EXAMPLE_B", "HELP": "PANEL_HELP",
    # v0.2（2026-11-22）：UI B のボタン行。カードより小さい矩形なので、ボタン上の注視はこちらに入り、
    # PANEL はカード本文だけになる（UI B のカードが広い分の混同を避ける。分析計画 H3）
    "BTN_1": "PANEL_BUTTONS", "BTN_2": "PANEL_BUTTONS", "BTN_3": "PANEL_BUTTONS",
    # logging-patch-v3（2026-11-26）：カード本文だけの矩形。カード内の余白に落ちた点は hit() が
    # 本文かボタンの近い方に割り当てるので、v3 のログでは PANEL＝本文（TEXT_n）になる。
    "TEXT_1": "PANEL", "TEXT_2": "PANEL", "TEXT_3": "PANEL",
    "EXAMPLE_TEXT": "EXAMPLE_B",
}

STATIC = {
    "UI_A": {
        "GUIDE": (0, 100, 1358, 119), "LEFT_CHAT": (0, 219, 1358, 701), "INPUT": (0, 920, 1358, 160),
        "HELP": (1383, 100, 515, 38),
        "CARD_1": (1383, 141, 515, 139), "CARD_2": (1383, 290, 515, 139), "CARD_3": (1383, 440, 515, 139),
    },
    "UI_B": {
        "GUIDE": (0, 100, 1358, 119), "LEFT_CHAT": (0, 219, 1358, 701), "INPUT": (0, 920, 1358, 160),
        "HELP": (1383, 100, 515, 56),
        "CARD_1": (1383, 160, 515, 199), "CARD_2": (1383, 369, 515, 199), "CARD_3": (1383, 579, 515, 199),
        "EXAMPLE": (1361, 987, 559, 93),
        # ボタン行（静的近似：各カード下端の約 58px）
        "BTN_1": (1383, 301, 515, 58), "BTN_2": (1383, 510, 515, 58), "BTN_3": (1383, 720, 515, 58),
    },
}


def inside(x: float, y: float, r: Rect, margin: float = 0.0) -> bool:
    rx, ry, rw, rh = r
    return rx - margin <= x <= rx + rw + margin and ry - margin <= y <= ry + rh + margin


def _distance(x: float, y: float, r: Rect) -> float:
    rx, ry, rw, rh = r
    dx, dy = max(rx - x, 0.0, x - (rx + rw)), max(ry - y, 0.0, y - (ry + rh))
    return (dx * dx + dy * dy) ** 0.5


def hit(x: float, y: float, rects: dict[str, Rect], margin: float = 0.0) -> str:
    """最も小さい（＝内側の）矩形を優先して返す。どこにもなければ 'OTHER'。

    logging-patch-v3 のログ（TEXT_n がある）では、カード内の余白（本文でもボタンでもない所）に落ちた点を、
    同じカードの本文 TEXT_n とボタン BTN_n のうち近い方に割り当てる。視線の誤差で余白に落ちた注視を、
    本文とボタンのどちらにも偏らせないため。TEXT_n のない古いログでは従来どおり CARD_n を返す。
    """
    best, area = "OTHER", float("inf")
    for name, r in rects.items():
        if inside(x, y, r, margin) and r[2] * r[3] < area:
            best, area = name, r[2] * r[3]
    if best.startswith("CARD_"):
        n = best[5:]
        parts = {k: rects[k] for k in (f"TEXT_{n}", f"BTN_{n}") if k in rects}
        if f"TEXT_{n}" in parts:
            best = min(parts, key=lambda k: _distance(x, y, parts[k]))
    return best


@dataclass
class LayoutTimeline:
    """時刻 → その時点の AOI 矩形。"""
    times: list[float]
    layouts: list[dict[str, Rect]]

    def at(self, t: float) -> dict[str, Rect]:
        i = bisect_right(self.times, t) - 1
        return self.layouts[max(i, 0)]


def layout_from_session(session, to_tobii) -> LayoutTimeline:
    """パッチ版ログの aoi_layout イベントから時系列を作る。to_tobii: 壁時計→Pro Lab 時刻 の変換関数。"""
    from .session import parse_ts
    ev = sorted(session.events_of("aoi_layout"), key=lambda e: e["time"])
    if not ev:
        static = STATIC[session.condition]
        return LayoutTimeline([float("-inf")], [static])
    times = [to_tobii(parse_ts(e.get("at") or e["time"])) for e in ev]
    layouts = [{k: tuple(v) for k, v in e["rects"].items()} for e in ev]
    return LayoutTimeline(times, layouts)
