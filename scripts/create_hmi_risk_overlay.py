from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/var/folders/vz/74x6dp7d2bjfds3qg7qvfv8r0000gn/T/codex-clipboard-4c5769d0-59ff-4ff4-b878-0b5e38524158.png")
OUT = ROOT / "public/works/portfolio/generated/hmi-risk-overlay.png"
FONT = "/Library/Fonts/Arial Unicode.ttf"


def font(size):
    return ImageFont.truetype(FONT, size)


def rounded_box(draw, xy, radius, fill, outline, width=3):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def face(draw, cx, cy, r, color, mood):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), outline=color, width=5, fill=(*color[:3], 34))
    draw.ellipse((cx - r * 0.42, cy - r * 0.22, cx - r * 0.24, cy - r * 0.04), fill=color)
    draw.ellipse((cx + r * 0.24, cy - r * 0.22, cx + r * 0.42, cy - r * 0.04), fill=color)
    if mood == "smile":
        draw.arc((cx - r * 0.43, cy - r * 0.15, cx + r * 0.43, cy + r * 0.55), 25, 155, fill=color, width=4)
    else:
        draw.arc((cx - r * 0.42, cy + r * 0.23, cx + r * 0.42, cy + r * 0.75), 205, 335, fill=color, width=4)
        draw.line((cx, cy - r * 0.02, cx, cy + r * 0.28), fill=color, width=4)


def glow_layer(size, circles):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    for cx, cy, r, color in circles:
        draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)
    return layer.filter(ImageFilter.GaussianBlur(24))


def main():
    base = Image.open(SOURCE).convert("RGBA")
    w, h = base.size
    sx, sy = w / 1680, h / 945

    green = (63, 218, 157, 210)
    red = (244, 85, 73, 224)
    amber = (245, 178, 70, 180)
    white = (255, 255, 255, 232)

    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    glow = glow_layer(
        base.size,
        [
            (int(516 * sx), int(240 * sy), int(92 * sx), (42, 220, 150, 70)),
            (int(1212 * sx), int(250 * sy), int(92 * sx), (245, 74, 64, 76)),
        ],
    )
    overlay.alpha_composite(glow)
    draw = ImageDraw.Draw(overlay)

    # Left: calm watch state for possible lane change.
    lx, ly, lr = int(515 * sx), int(240 * sy), int(42 * sx)
    face(draw, lx, ly, lr, green, "smile")
    draw.arc((int(294 * sx), int(150 * sy), int(635 * sx), int(430 * sy)), 210, 350, fill=green, width=int(5 * sx))
    draw.line((lx + int(45 * sx), ly + int(12 * sy), int(620 * sx), int(336 * sy)), fill=green, width=int(4 * sx))
    rounded_box(
        draw,
        (int(355 * sx), int(138 * sy), int(558 * sx), int(188 * sy)),
        int(15 * sx),
        (255, 255, 255, 215),
        green,
        width=int(3 * sx),
    )
    draw.text((int(382 * sx), int(151 * sy)), "可能变道", fill=(32, 147, 103, 255), font=font(int(26 * sx)))

    # Right: higher attention state for pedestrian entering road.
    rx, ry, rr = int(1193 * sx), int(230 * sy), int(44 * sx)
    face(draw, rx, ry, rr, red, "alert")
    draw.line((rx - int(28 * sx), ry + int(45 * sy), int(1125 * sx), int(400 * sy)), fill=red, width=int(5 * sx))
    draw.arc((int(1080 * sx), int(136 * sy), int(1298 * sx), int(368 * sy)), 210, 55, fill=red, width=int(5 * sx))
    rounded_box(
        draw,
        (int(1134 * sx), int(108 * sy), int(1378 * sx), int(160 * sy)),
        int(15 * sx),
        (255, 255, 255, 224),
        red,
        width=int(3 * sx),
    )
    draw.text((int(1162 * sx), int(122 * sy)), "可能闯入马路", fill=(215, 54, 48, 255), font=font(int(25 * sx)))

    # Shared HMI field on road center.
    draw.ellipse((int(755 * sx), int(410 * sy), int(925 * sx), int(466 * sy)), outline=amber, width=int(3 * sx))
    draw.line((int(690 * sx), int(384 * sy), int(812 * sx), int(434 * sy)), fill=(245, 178, 70, 120), width=int(4 * sx))
    draw.line((int(1005 * sx), int(388 * sy), int(866 * sx), int(436 * sy)), fill=(245, 178, 70, 120), width=int(4 * sx))

    result = Image.alpha_composite(base, overlay)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    result.convert("RGB").save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
