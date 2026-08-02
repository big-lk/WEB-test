from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / "public/works/portfolio/generated"
FONT = "/Library/Fonts/Arial Unicode.ttf"


def font(size):
    return ImageFont.truetype(FONT, size)


def glow(size, items):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    for x, y, r, color in items:
        d.ellipse((x - r, y - r, x + r, y + r), fill=color)
    return layer.filter(ImageFilter.GaussianBlur(22))


def bubble(d, x, y, text, color, size=28, pad=22):
    f = font(size)
    box = d.textbbox((0, 0), text, font=f)
    w = box[2] - box[0] + pad * 2
    h = box[3] - box[1] + pad
    d.rounded_rectangle((x, y, x + w, y + h), radius=18, fill=(255, 255, 255, 222), outline=color, width=4)
    d.text((x + pad, y + pad * 0.44), text, fill=color, font=f)
    return w, h


def line(d, start, end, color, width=5):
    d.line((start, end), fill=color, width=width)
    ex, ey = end
    sx, sy = start
    # simple arrow head
    dx = 1 if ex >= sx else -1
    d.line((ex, ey, ex - 18 * dx, ey - 9), fill=color, width=width)
    d.line((ex, ey, ex - 18 * dx, ey + 9), fill=color, width=width)


def mark(path, out, specs):
    img = Image.open(DIR / path).convert("RGBA")
    w, h = img.size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gitems = []
    for item in specs:
        if "target" in item:
            tx, ty = int(item["target"][0] * w), int(item["target"][1] * h)
            gitems.append((tx, ty, int(item.get("r", 78)), item["glow"]))
    layer.alpha_composite(glow((w, h), gitems))
    d = ImageDraw.Draw(layer)
    for item in specs:
        x, y = int(item["box"][0] * w), int(item["box"][1] * h)
        color = item["color"]
        bubble(d, x, y, item["text"], color, item.get("size", 28))
        if "target" in item:
            tx, ty = int(item["target"][0] * w), int(item["target"][1] * h)
            line(d, (x + int(item.get("line_x", 120)), y + int(item.get("line_y", 56))), (tx, ty), color, item.get("width", 5))
            d.ellipse((tx - 16, ty - 16, tx + 16, ty + 16), outline=color, width=5)
    result = Image.alpha_composite(img, layer)
    result.convert("RGB").save(DIR / out, quality=95)
    print(DIR / out)


def main():
    teal = (34, 183, 148, 230)
    blue = (61, 125, 218, 230)
    gold = (202, 135, 17, 230)
    coral = (229, 82, 63, 235)
    glow_teal = (34, 183, 148, 78)
    glow_blue = (61, 125, 218, 70)
    glow_gold = (240, 169, 48, 74)
    glow_coral = (230, 78, 60, 76)

    mark(
        "ai-cocreation-hero.png",
        "ai-cocreation-overlay.png",
        [
            {"text": "AI 代行", "box": (0.13, 0.23), "target": (0.28, 0.60), "color": blue, "glow": glow_blue},
            {"text": "AI 商谈", "box": (0.43, 0.14), "target": (0.50, 0.57), "color": gold, "glow": glow_gold},
            {"text": "用户决定", "box": (0.68, 0.22), "target": (0.75, 0.58), "color": teal, "glow": glow_teal},
        ],
    )
    mark(
        "taste-memory-hero.png",
        "taste-memory-overlay.png",
        [
            {"text": "好久没吃", "box": (0.51, 0.12), "target": (0.56, 0.32), "color": gold, "glow": glow_gold},
            {"text": "那一碗", "box": (0.09, 0.20), "target": (0.17, 0.55), "color": coral, "glow": glow_coral},
            {"text": "再去吃", "box": (0.70, 0.18), "target": (0.69, 0.52), "color": teal, "glow": glow_teal},
        ],
    )
    mark(
        "frametrace-hero-generated.png",
        "frametrace-overlay.png",
        [
            {"text": "旧照机位", "box": (0.19, 0.15), "target": (0.32, 0.50), "color": gold, "glow": glow_gold},
            {"text": "空间对齐", "box": (0.45, 0.18), "target": (0.48, 0.54), "color": teal, "glow": glow_teal},
            {"text": "同地再拍", "box": (0.68, 0.16), "target": (0.72, 0.47), "color": blue, "glow": glow_blue},
        ],
    )
    mark(
        "fridge-system-hero.png",
        "fridge-system-overlay.png",
        [
            {"text": "放入即记录", "box": (0.23, 0.11), "target": (0.42, 0.32), "color": teal, "glow": glow_teal},
            {"text": "灯光找食材", "box": (0.37, 0.54), "target": (0.52, 0.43), "color": gold, "glow": glow_gold},
            {"text": "临期就行动", "box": (0.70, 0.12), "target": (0.78, 0.48), "color": coral, "glow": glow_coral},
        ],
    )


if __name__ == "__main__":
    main()
