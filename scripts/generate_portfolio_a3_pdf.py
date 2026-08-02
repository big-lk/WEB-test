from pathlib import Path

from PIL import Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A3, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output/pdf/kong-weipeng-portfolio-a3-story-cn.pdf"
FONT = "/Library/Fonts/Arial Unicode.ttf"
CACHE = ROOT / "tmp/pdfs/a3-image-cache"
LOGO = ROOT / "public/works/portfolio/kong-logo-cover-clean.png"

W, H = landscape(A3)
M = 16 * mm

PAPER = colors.HexColor("#FFFAF0")
INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#5C554B")
LINE = colors.HexColor("#E2B84B")
CREAM = colors.HexColor("#FFF1CF")
TEAL = colors.HexColor("#1F766F")
BLUE = colors.HexColor("#3869A6")
CORAL = colors.HexColor("#E6674A")
GOLD = colors.HexColor("#B57900")
BLACK = colors.HexColor("#111111")


def register_fonts():
    pdfmetrics.registerFont(TTFont("A3Sans", FONT))


def asset(path):
    return ROOT / "public" / path.lstrip("/")


def optimized(path, max_side=2400):
    CACHE.mkdir(parents=True, exist_ok=True)
    out = CACHE / f"{path.stem}-{max_side}.jpg"
    if out.exists() and out.stat().st_mtime >= path.stat().st_mtime:
        return out
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    return out


def crop_image(c, image_path, x, y, w, h):
    path = optimized(asset(image_path))
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.setFillColor(BLACK)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.drawImage(reader, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def cover(c):
    c.setFillColor(colors.white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    reader = ImageReader(str(optimized(LOGO, max_side=2200)))
    iw, ih = reader.getSize()
    target = 77.5 * mm
    scale = min(target / iw, target / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(reader, (W - dw) / 2, (H - dh) / 2, dw, dh, mask="auto")


def para(c, text, x, top, width, style):
    p = Paragraph(text, style)
    _, h = p.wrap(width, 999 * mm)
    p.drawOn(c, x, top - h)
    return top - h


def base(c, page, case_no):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(M, H - 12 * mm, W - M, H - 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("A3Sans", 7.8)
    c.drawString(M, H - 8 * mm, f"KONG WEIPENG PORTFOLIO / {case_no}")
    c.drawRightString(W - M, H - 8 * mm, f"{page:02d}")


def tag(c, text, x, y, color):
    c.setFillColor(CREAM)
    c.roundRect(x, y, 41 * mm, 8 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(color)
    c.setFont("A3Sans", 8)
    c.drawString(x + 3 * mm, y + 2.4 * mm, text)


def step(c, no, title, body, x, y, w, color):
    c.setFillColor(color)
    c.setFont("A3Sans", 9)
    c.drawString(x, y + 24 * mm, no)
    c.setFillColor(INK)
    c.setFont("A3Sans", 14)
    c.drawString(x + 12 * mm, y + 23 * mm, title)
    para(c, body, x + 12 * mm, y + 16 * mm, w - 12 * mm, ST["small"])


def feature(c, title, body, x, top, w, color):
    c.setFillColor(color)
    c.circle(x + 2 * mm, top - 3 * mm, 1.4 * mm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("A3Sans", 12.4)
    c.drawString(x + 8 * mm, top - 6 * mm, title)
    bottom = para(c, body, x + 8 * mm, top - 11 * mm, w - 8 * mm, ST["feature"])
    return bottom - 4 * mm


def key_sentence(c, text, x, top, w):
    c.setStrokeColor(LINE)
    c.setLineWidth(1.0)
    c.line(x, top - 3 * mm, x + 24 * mm, top - 3 * mm)
    c.setFillColor(GOLD)
    c.setFont("A3Sans", 8.8)
    c.drawString(x, top - 10 * mm, "核心判断")
    return para(c, text, x, top - 15 * mm, w, ST["key"])


def flow_box(c, x, y, w, h, title, body, color, fill=colors.white):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 3 * mm, fill=1, stroke=0)
    c.setStrokeColor(color)
    c.setLineWidth(1.2)
    c.roundRect(x, y, w, h, 3 * mm, fill=0, stroke=1)
    c.setFillColor(color)
    c.setFont("A3Sans", 13.5)
    c.drawString(x + 6 * mm, y + h - 11 * mm, title)
    old_color = ST["small"].textColor
    ST["small"].textColor = colors.HexColor("#BFB7AA")
    para(c, body, x + 6 * mm, y + h - 18 * mm, w - 12 * mm, ST["small"])
    ST["small"].textColor = old_color


def arrow(c, x1, y1, x2, y2, color=MUTED):
    c.setStrokeColor(color)
    c.setLineWidth(1.6)
    c.line(x1, y1, x2, y2)
    direction = 1 if x2 >= x1 else -1
    c.line(x2, y2, x2 - direction * 5 * mm, y2 + 2.5 * mm)
    c.line(x2, y2, x2 - direction * 5 * mm, y2 - 2.5 * mm)


def ai_flow(c, x, y, w, h):
    c.setFillColor(BLACK)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#171717"))
    c.rect(x + 2 * mm, y + 2 * mm, w - 4 * mm, h - 4 * mm, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.rect(x, y, w, h, fill=0, stroke=1)

    c.setFillColor(colors.white)
    c.setFont("A3Sans", 28)
    c.drawString(x + 16 * mm, y + h - 27 * mm, "共创前先判断：这一步由谁承担？")
    c.setFillColor(colors.HexColor("#D7D1C7"))
    c.setFont("A3Sans", 10.5)
    c.drawString(x + 16 * mm, y + h - 38 * mm, "界面不是替用户做完，而是把参与方式前置，让用户看见自己的判断位置。")

    fy = y + h - 82 * mm
    start_x = x + 16 * mm
    flow_box(c, start_x, fy, 52 * mm, 34 * mm, "用户意图", "想做什么，但还没完全想清楚。", TEAL, colors.HexColor("#202725"))
    share_x = start_x + 70 * mm
    flow_box(c, share_x, fy, 58 * mm, 34 * mm, "分担判断", "先选择 AI 与用户的责任关系。", GOLD, colors.HexColor("#28251E"))
    arrow(c, start_x + 54 * mm, fy + 17 * mm, share_x - 3 * mm, fy + 17 * mm, colors.HexColor("#BEB7AA"))

    bx = start_x + 148 * mm
    buttons = [
        ("AI 代行", "重复、低风险、可撤回的步骤", BLUE),
        ("AI 商谈", "展开可能性，一起讨论方向", GOLD),
        ("用户决定", "收束目标，保留最终判断", TEAL),
    ]
    for i, (title, body, color) in enumerate(buttons):
        by = fy + (1 - i) * 35 * mm
        flow_box(c, bx, by, 58 * mm, 26 * mm, title, body, color, colors.HexColor("#201F1B"))
        arrow(c, share_x + 60 * mm, fy + 17 * mm, bx - 4 * mm, by + 13 * mm, colors.HexColor("#BEB7AA"))

    rx = x + w - 66 * mm
    flow_box(c, rx, fy, 52 * mm, 34 * mm, "共创结果", "AI 提供帮助，用户仍承担选择。", CORAL, colors.HexColor("#2A211F"))
    for i in range(3):
        by = fy + (1 - i) * 35 * mm + 13 * mm
        arrow(c, bx + 60 * mm, by, rx - 4 * mm, fy + 17 * mm, colors.HexColor("#BEB7AA"))

    c.setFillColor(colors.HexColor("#F8F1DF"))
    c.roundRect(x + 18 * mm, y + 25 * mm, w - 36 * mm, 34 * mm, 3 * mm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("A3Sans", 13)
    c.drawString(x + 27 * mm, y + 45 * mm, "验证方式")
    para(
        c,
        "聊天调查 -> 故事模拟 -> 三版 UI 比较 -> 眼动任务。看提示是否改变用户看哪里、停多久、最后怎么选。",
        x + 27 * mm,
        y + 39 * mm,
        w - 54 * mm,
        ST["small"],
    )


def board(c, page, item):
    base(c, page, item["case"])
    left_x = M
    img_x = M + 92 * mm
    img_y = 38 * mm
    img_w = W - img_x - M
    img_h = H - 60 * mm

    c.setFillColor(INK)
    c.setFont("A3Sans", 9.4)
    c.drawString(left_x, H - 35 * mm, item["category"])
    title_bottom = para(c, item["title"], left_x, H - 45 * mm, 78 * mm, ST["title"])
    hook_top = H - 76 * mm
    if title_bottom < hook_top:
        hook_top = title_bottom - 7 * mm
    hook_bottom = para(c, item["hook"], left_x, hook_top, 72 * mm, ST["hook"])
    key_top = H - 102 * mm
    if hook_bottom < key_top:
        key_top = hook_bottom - 8 * mm
    key_bottom = key_sentence(c, item["key"], left_x, key_top, 76 * mm)

    top = min(H - 142 * mm, key_bottom - 15 * mm)
    palette = [TEAL, GOLD, CORAL, BLUE, TEAL]
    for i, s in enumerate(item["features"]):
        top = feature(c, s[0], s[1], left_x, top, 76 * mm, palette[i % len(palette)])

    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.line(left_x, 48 * mm, left_x + 76 * mm, 48 * mm)
    para(c, item["bottom"], left_x, 40 * mm, 76 * mm, ST["bottom"])
    for i, t in enumerate(item["tags"]):
        tag(c, t, left_x + i * 43 * mm, 14 * mm, [TEAL, BLUE, CORAL][i])

    if item.get("layout") == "ai_flow":
        ai_flow(c, img_x, img_y, img_w, img_h)
    else:
        crop_image(c, item["image"], img_x, img_y, img_w, img_h)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.rect(img_x, img_y, img_w, img_h, fill=0, stroke=1)

    if item.get("bubble"):
        bx, by = img_x + item["bubble"][0] * img_w, img_y + item["bubble"][1] * img_h
        c.setFillColor(colors.white)
        c.roundRect(bx, by, item["bubble"][2] * mm, 15 * mm, 4 * mm, fill=1, stroke=0)
        c.setStrokeColor(item["bubble_color"])
        c.setLineWidth(1.2)
        c.roundRect(bx, by, item["bubble"][2] * mm, 15 * mm, 4 * mm, fill=0, stroke=1)
        c.setFillColor(item["bubble_color"])
        c.setFont("A3Sans", 12.5)
        c.drawString(bx + 5 * mm, by + 5 * mm, item["bubble"][3])


ITEMS = [
    {
        "case": "CASE 01 / INTELLIGENT DRIVING HMI",
        "category": "智能驾驶 / 关注价值 HMI",
        "title": "驾驶关注价值界面",
        "hook": "智驾越稳定，人越容易把驾驶交出去。这个界面不堆行车参数，而是说清 AI 正在担心哪里。",
        "key": "高价值驾驶不该只剩交通工具。HMI 要让人继续参与路面判断，而不是安静地退成乘客。",
        "features": [
            ("驾驶意愿", "智驾会逐渐影响真实驾驶意愿；如果人只负责坐着，高价值车的体验会被压成工具属性。"),
            ("能力依赖", "很多驾驶者会认为 AI 比自己强，也有人因为智驾稳定就不再认真看路。法规提示之外，还需要可感知的参与感。"),
            ("AI 关注明示", "增加信任只是基础。更重要的是让 AI 明示自己正在关注哪些可能造成问题的重点位置。"),
            ("情绪化警示", "普通感叹号太无聊。小朋友可能闯出、旁车可能靠近，用表情和短句让危险被立刻理解。"),
        ],
        "bottom": "核心体验：按危险程度控制提示强度，画面保持克制，在安全边界内保留人的驾驶关注价值。",
        "tags": ["驾驶意愿", "AI关注明示", "情绪警示"],
        "image": "/works/portfolio/generated/hmi-risk-overlay.png",
    },
    {
        "case": "CASE 02 / HUMAN-AI CO-CREATION",
        "category": "AI 产品体验 / 毕业设计",
        "title": "个人判断价值提升界面",
        "hook": "AI 共创的问题不只是回答质量，而是用户的判断很容易被输出结果盖过去。",
        "key": "界面先让用户判断“这一步谁负责”，再让 AI 根据分担关系调整回答，提升个人判断价值。",
        "features": [
            ("显性分担", "AI 代行、AI 商谈、用户决定不是按钮样式，而是把责任关系变成用户可选择的显性行为。"),
            ("响应调整", "AI 接收价值项目、分担选择和上下文，再调整提案粒度、解释强度、追问策略和结论强度。"),
            ("判断沉淀", "用户确认和再调整会形成分担数据，让系统逐渐学习个人判断偏好，而不是只积累对话内容。"),
        ],
        "bottom": "核心体验：把共创从“等 AI 输出”变成“判断分担 - 响应调整 - 反馈学习”的循环。",
        "tags": ["判断分担", "响应调整", "偏好学习"],
        "image": "/works/portfolio/ai-judgement-value-flow-original.png",
    },
    {
        "case": "CASE 03 / MINI PROGRAM",
        "category": "微信小程序 / 饮食记忆",
        "title": "好久没吃",
        "hook": "吃什么不总是搜索问题。很多时候只是突然想起：那一碗，好久没吃了。",
        "key": "吃可以是周期的，也可以是感觉的。总有那么一周一次，会想起那一家、那一碗。",
        "features": [
            ("个人规律", "饮食有周期，嘴馋也有周期。一周总会想吃那一家、那一碗，这比泛推荐更接近真实选择。"),
            ("味道线索", "记录店、菜、时间和当时的感觉，让用户从自己的经历里找到今天想吃什么。"),
            ("回到旧味道", "提醒不是催促，也不是扩大选择，而是带理由地帮用户回到某个具体味道。"),
        ],
        "bottom": "核心体验：让个人饮食记忆成为选择入口，而不是把用户推向更大的推荐列表。",
        "tags": ["选择过载", "味道记忆", "再会提醒"],
        "image": "/works/portfolio/haojiu-meichi-cover-upscaled.png",
    },
    {
        "case": "CASE 04 / MR EXPERIENCE",
        "category": "MR 眼镜 / 跨时间摄影",
        "title": "FrameTrace",
        "hook": "看到一张经典照片时，人会想知道：它当时是站在哪里、用什么角度拍出来的。",
        "key": "FrameTrace 是跨越时间和空间的摄影交友：和另一个时间的人，在同一个机位完成一次共拍。",
        "features": [
            ("经典怎么拍", "不是只看照片结果，而是看它的机位、焦距、构图和拍摄姿态，理解那张照片为什么成立。"),
            ("时间同场", "MR 眼镜把不同年份、不同拍摄者的痕迹放回同一地点，让过去不是资料，而是现场里的另一个人。"),
            ("摄影交友", "用户沿着取景、对齐和相机焦距提示，像和过去的拍摄者一起完成一张照片。"),
        ],
        "bottom": "核心体验：把“这张经典怎么拍的”变成可行走、可对齐、可共同完成的跨时间摄影",
        "tags": ["经典机位", "跨时同场", "摄影交友"],
        "image": "/works/portfolio/frametrace-grid-4.png",
    },
    {
        "case": "CASE 05 / PRODUCT SYSTEM",
        "category": "大学毕业设计 / 食材日期管理",
        "title": "FRIDGE TIMELINE SYSTEM",
        "hook": "让临期食材被看见、被注意，而不是在冰箱深处慢慢被忘掉。",
        "key": "这个系统的重点不是多一个提醒，而是通过可见的临期状态，培养用户管理食品日期的习惯。",
        "features": [
            ("临期可见", "把临期状态从手机提醒变成冰箱里的可见信息，让用户开门时就知道哪些食材需要优先处理。"),
            ("注意触发", "灯光不是装饰，而是把视线引到具体位置，让“快过期了”变成此刻能被注意到的状态。"),
            ("习惯形成", "扫描、存放和手机联动不是单独功能，而是在反复使用中帮助用户建立日期管理习惯。"),
        ],
        "bottom": "核心体验：让临期被看见、被注意，并把日期管理习惯拆进日常开门和取用动作。",
        "tags": ["临期可见", "注意触发", "习惯形成"],
        "image": "/works/portfolio/fridge-timeline-system.png",
    },
]


ST = {
    "title": ParagraphStyle("title", fontName="A3Sans", fontSize=29, leading=34, textColor=INK, alignment=TA_LEFT),
    "hook": ParagraphStyle("hook", fontName="A3Sans", fontSize=13.5, leading=20.5, textColor=INK, alignment=TA_LEFT),
    "key": ParagraphStyle("key", fontName="A3Sans", fontSize=12.4, leading=17.2, textColor=INK, alignment=TA_LEFT),
    "feature": ParagraphStyle("feature", fontName="A3Sans", fontSize=9.1, leading=12.8, textColor=MUTED, alignment=TA_LEFT),
    "small": ParagraphStyle("small", fontName="A3Sans", fontSize=9.4, leading=13.5, textColor=MUTED, alignment=TA_LEFT),
    "bottom": ParagraphStyle("bottom", fontName="A3Sans", fontSize=12.2, leading=18.5, textColor=INK, alignment=TA_LEFT),
}


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()
    c = canvas.Canvas(str(OUT), pagesize=landscape(A3), pageCompression=1)
    c.setTitle("KONG WEIPENG A3 Story Portfolio")
    c.setAuthor("KONG WEIPENG")
    cover(c)
    c.showPage()
    for page, item in enumerate(ITEMS, 1):
        board(c, page, item)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
