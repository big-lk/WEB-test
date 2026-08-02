from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/works/portfolio/ai-judgement-value-flow.png"
FONT = "/Library/Fonts/Arial Unicode.ttf"

W, H = 2400, 1600
BG = "#030507"
WHITE = "#F4F7FF"
MUTED = "#BFC8D8"
BLUE = "#2F9BFF"
GREEN = "#7FE35A"
PURPLE = "#D552FF"
YELLOW = "#FFB000"
PANEL = "#080C12"


def font(size):
    return ImageFont.truetype(FONT, size)


def text(draw, xy, s, size, fill=WHITE, anchor=None, spacing=8):
    draw.multiline_text(xy, s, font=font(size), fill=fill, anchor=anchor, spacing=spacing)


def rounded(draw, box, outline, fill=PANEL, width=3, radius=14):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def arrow(draw, start, end, fill=WHITE, width=4, dashed=False):
    x1, y1 = start
    x2, y2 = end
    if dashed:
        steps = 14
        for i in range(steps):
            if i % 2 == 0:
                ax = x1 + (x2 - x1) * i / steps
                ay = y1 + (y2 - y1) * i / steps
                bx = x1 + (x2 - x1) * (i + 1) / steps
                by = y1 + (y2 - y1) * (i + 1) / steps
                draw.line((ax, ay, bx, by), fill=fill, width=width)
    else:
        draw.line((x1, y1, x2, y2), fill=fill, width=width)
    if abs(x2 - x1) >= abs(y2 - y1):
        d = 1 if x2 >= x1 else -1
        draw.polygon([(x2, y2), (x2 - d * 18, y2 - 10), (x2 - d * 18, y2 + 10)], fill=fill)
    else:
        d = 1 if y2 >= y1 else -1
        draw.polygon([(x2, y2), (x2 - 10, y2 - d * 18), (x2 + 10, y2 - d * 18)], fill=fill)


def box(draw, xy, title, body, color, badge=None, w=290, h=210):
    x, y = xy
    rounded(draw, (x, y, x + w, y + h), color, fill="#06080D", width=3)
    if badge:
        rounded(draw, (x + 20, y + 18, x + 72, y + 62), color, fill="#10315A", width=1, radius=8)
        text(draw, (x + 46, y + 28), badge, 28, WHITE, anchor="ma")
        tx = x + 92
    else:
        tx = x + 24
    text(draw, (tx, y + 28), title, 31, WHITE)
    text(draw, (x + 24, y + 105), body, 22, MUTED, spacing=10)


def build():
    im = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(im)

    text(draw, (44, 36), "人-AI 共创中的个人判断价值提升机制", 50)
    text(draw, (46, 112), "从“让 AI 输出”转为“先判断分担”，让用户的意识、选择和反馈进入循环", 30, MUTED)

    rounded(draw, (38, 190, 2360, 850), BLUE, fill="#04070B", width=3, radius=18)
    text(draw, (68, 218), "用户界面层（用户意识与显性行为）", 34, BLUE)

    user_boxes = [
        ((74, 300), "意图表达", "用户说出目标、价值倾向、\n限制条件和模糊想法。", "01"),
        ((410, 300), "重视点显化", "界面让用户看见：\n自己到底在意什么。", "02"),
        ((770, 275), "判断分担选择", "AI 代行：交给 AI 做\nAI 商谈：一起讨论\n用户决定：保留判断", "03"),
        ((1180, 300), "AI 回答呈现", "回答不只是结果，\n还带着分担方式。", "04"),
        ((1520, 300), "用户确认再调整", "用户根据回答重新判断：\n继续、改分担、收束。", "05"),
        ((1880, 300), "对话继续", "基于新的分担进入\n下一轮共创。", "06"),
    ]
    for pos, title, body, badge in user_boxes:
        box(draw, pos, title, body, BLUE, badge=badge, w=300, h=230)

    for x1, x2 in [(374, 410), (710, 770), (1070, 1180), (1480, 1520), (1820, 1880)]:
        arrow(draw, (x1, 415), (x2, 415), WHITE, width=4)

    rounded(draw, (774, 512, 1066, 726), YELLOW, fill="#090706", width=3, radius=12)
    text(draw, (802, 536), "三种责任关系", 30, YELLOW)
    text(draw, (815, 596), "不是按钮样式，\n而是让用户确认：\n这一步谁负责。", 24, WHITE, spacing=10)

    rounded(draw, (38, 920, 1660, 1495), GREEN, fill="#030905", width=3, radius=18)
    text(draw, (68, 948), "AI 影响层（对 AI 的作用与反馈）", 34, GREEN)
    ai_boxes = [
        ((78, 1015), "数据接收", "价值项目、分担选择、\n对话上下文进入系统。", "A1"),
        ((462, 1015), "结构化理解", "把分担信号转成：\n价值项 / 责任类型 / 上下文。", "A2"),
        ((846, 1015), "响应策略调整", "调整提案粒度、解释强度、\n追问策略和结论强度。", "A3"),
        ((1230, 1015), "生成回答", "给出符合当前分担方式的\n候选方案或回应。", "A4"),
    ]
    for pos, title, body, badge in ai_boxes:
        box(draw, pos, title, body, GREEN, badge=badge, w=300, h=245)
    for x1, x2 in [(378, 462), (762, 846), (1146, 1230)]:
        arrow(draw, (x1, 1138), (x2, 1138), WHITE, width=4)

    rounded(draw, (1830, 910, 2360, 1495), PURPLE, fill="#09040D", width=3, radius=18)
    text(draw, (1862, 948), "期望层（数据积累与持续改进）", 32, PURPLE)
    future = [
        ("判断数据沉淀", "持续积累用户如何分担、\n何时接管、何时商谈。"),
        ("偏好学习", "学习用户的判断特征，\n形成更贴合的策略。"),
        ("能力提升", "提升 AI 对个人判断价值的\n支持能力。"),
    ]
    y = 1010
    for title, body in future:
        rounded(draw, (1878, y, 2310, y + 125), PURPLE, fill="#0A0610", width=2, radius=12)
        text(draw, (1910, y + 22), title, 28, PURPLE)
        text(draw, (1910, y + 65), body, 21, MUTED)
        y += 160

    arrow(draw, (920, 506), (920, 1015), GREEN, width=4, dashed=True)
    arrow(draw, (1390, 1260), (1390, 545), GREEN, width=4, dashed=True)
    arrow(draw, (1530, 1260), (1830, 1325), PURPLE, width=4, dashed=True)
    arrow(draw, (2060, 910), (1725, 430), PURPLE, width=4, dashed=True)
    arrow(draw, (1790, 415), (1880, 415), WHITE, width=4)

    rounded(draw, (1380, 24, 1660, 156), "#808080", fill="#050505", width=2, radius=14)
    arrow(draw, (1420, 58), (1498, 58), WHITE, width=4)
    text(draw, (1530, 40), "流程流向", 24, WHITE)
    arrow(draw, (1420, 104), (1498, 104), GREEN, width=4, dashed=True)
    text(draw, (1530, 86), "数据/反馈", 24, WHITE)

    rounded(draw, (1700, 24, 2320, 156), "#808080", fill="#050505", width=2, radius=14)
    text(draw, (1738, 44), "蓝：用户意识与行为", 25, BLUE)
    text(draw, (1738, 82), "绿：AI 对分担信号的响应", 25, GREEN)
    text(draw, (1738, 120), "紫：持续学习与能力提升", 25, PURPLE)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    im.save(OUT, quality=96)
    print(OUT)


if __name__ == "__main__":
    build()
