from pathlib import Path

from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output/pdf/kong-weipeng-portfolio-cn.pdf"
FONT = "/Library/Fonts/Arial Unicode.ttf"
PORTFOLIO_URL = "https://lkdesigner.top"
CACHE_DIR = ROOT / "tmp/pdfs/portfolio-image-cache"

W, H = landscape(A4)
M = 14 * mm

INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#595959")
PALE = colors.HexColor("#FFFAF0")
SOFT = colors.HexColor("#FFF4CF")
LINE = colors.HexColor("#E7BC43")
BRAND = colors.HexColor("#B57900")
GREEN = colors.HexColor("#1F766F")
CORAL = colors.HexColor("#E6674A")
BLUE = colors.HexColor("#3568A6")


def register_fonts():
    pdfmetrics.registerFont(TTFont("PortfolioSans", FONT))


def asset(path):
    return ROOT / "public" / path.lstrip("/")


def draw_qr(c, value, x, y, size):
    qr = QrCodeWidget(value)
    bounds = qr.getBounds()
    drawing = Drawing(size, size, transform=[size / (bounds[2] - bounds[0]), 0, 0, size / (bounds[3] - bounds[1]), 0, 0])
    drawing.add(qr)
    renderPDF.draw(drawing, c, x, y)


def para(c, text, x, top, width, style, max_height=None):
    p = Paragraph(text, style)
    _, h = p.wrap(width, max_height or 999 * mm)
    p.drawOn(c, x, top - h)
    return top - h


def optimized_image(path, max_side=1800):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out = CACHE_DIR / f"{path.stem}-{max_side}.jpg"
    if out.exists() and out.stat().st_mtime >= path.stat().st_mtime:
        return out
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(out, "JPEG", quality=84, optimize=True, progressive=True)
    return out


def fit_image(c, image_path, x, y, w, h, border=True, bg=colors.white):
    path = asset(image_path) if str(image_path).startswith("/") else ROOT / image_path
    if not path.exists():
        c.setFillColor(SOFT)
        c.rect(x, y, w, h, fill=1, stroke=0)
        c.setFillColor(MUTED)
        c.setFont("PortfolioSans", 8)
        c.drawCentredString(x + w / 2, y + h / 2, "image pending")
        return
    path = optimized_image(path)
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.setFillColor(bg)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.drawImage(reader, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    if border:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.5)
        c.rect(x, y, w, h, fill=0, stroke=1)


def header(c, page, section="KONG WEIPENG PORTFOLIO"):
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(M, H - 11 * mm, W - M, H - 11 * mm)
    c.line(M, 10 * mm, W - M, 10 * mm)
    c.setFont("PortfolioSans", 7.5)
    c.setFillColor(MUTED)
    c.drawString(M, H - 8 * mm, section)
    c.drawRightString(W - M, H - 8 * mm, f"Page {page}")
    c.drawString(M, 5.8 * mm, "KONG WEIPENG / 孔维鹏 - Product Design Portfolio")
    c.drawRightString(W - M, 5.8 * mm, "lkdesigner.top")


def chip(c, text, x, y, color=BRAND, fill=SOFT):
    c.setFillColor(fill)
    c.roundRect(x, y, 33 * mm, 8 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(color)
    c.setFont("PortfolioSans", 7.2)
    c.drawString(x + 3 * mm, y + 2.5 * mm, text)


def card(c, x, y, w, h, title, body, accent=BRAND):
    c.setFillColor(colors.white)
    c.roundRect(x, y, w, h, 2.5 * mm, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.45)
    c.roundRect(x, y, w, h, 2.5 * mm, fill=0, stroke=1)
    c.setFillColor(accent)
    c.rect(x, y + h - 1.5 * mm, w, 1.5 * mm, fill=1, stroke=0)
    para(c, title, x + 4 * mm, y + h - 5 * mm, w - 8 * mm, ST["card_title"])
    para(c, body, x + 4 * mm, y + h - 15 * mm, w - 8 * mm, ST["small"])


def arrow(c, x1, y1, x2, y2, color=MUTED):
    c.setStrokeColor(color)
    c.setLineWidth(1.0)
    c.line(x1, y1, x2, y2)
    c.setFillColor(color)
    if x2 >= x1:
        c.line(x2, y2, x2 - 3 * mm, y2 + 1.6 * mm)
        c.line(x2, y2, x2 - 3 * mm, y2 - 1.6 * mm)
    else:
        c.line(x2, y2, x2 + 3 * mm, y2 + 1.6 * mm)
        c.line(x2, y2, x2 + 3 * mm, y2 - 1.6 * mm)


def soft_box(c, x, y, w, h, title, body="", accent=BRAND, fill=colors.white, title_size=13):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, 3 * mm, fill=1, stroke=0)
    c.setStrokeColor(accent)
    c.setLineWidth(0.8)
    c.roundRect(x, y, w, h, 3 * mm, fill=0, stroke=1)
    c.setFillColor(accent)
    c.setFont("PortfolioSans", title_size)
    c.drawString(x + 5 * mm, y + h - 8 * mm, title)
    if body:
        para(c, body, x + 5 * mm, y + h - 15 * mm, w - 10 * mm, ST["small"])


def ai_flow_page(c, page, work):
    header(c, page, "CASE 01 / HUMAN-AI CO-CREATION")
    title_block(
        c,
        "AI 共创界面",
        "先选择怎么参与，再进入共创",
        "界面不只是展示 AI 回答，而是在关键步骤提示用户：这一步由谁来承担？",
        width=138 * mm,
    )
    top = H - 82 * mm
    x0 = M + 4 * mm
    y0 = top - 30 * mm
    soft_box(c, x0, y0, 48 * mm, 28 * mm, "用户意图", "我想做什么？", GREEN)
    soft_box(c, x0 + 66 * mm, y0, 54 * mm, 28 * mm, "界面提示", "先判断分担方式", BRAND)
    arrow(c, x0 + 50 * mm, y0 + 14 * mm, x0 + 64 * mm, y0 + 14 * mm)

    bx = x0 + 146 * mm
    by = y0 + 18 * mm
    buttons = [
        ("AI 代行", "系统先处理", BLUE),
        ("AI 商谈", "一起讨论", BRAND),
        ("用户决定", "自己收束", GREEN),
    ]
    for i, (title, body, color) in enumerate(buttons):
        soft_box(c, bx, by - i * 25 * mm, 48 * mm, 18 * mm, title, body, color, SOFT, 11)
        arrow(c, x0 + 122 * mm, y0 + 14 * mm, bx - 3 * mm, by + 9 * mm - i * 25 * mm)

    fx = bx + 68 * mm
    soft_box(c, fx, y0, 48 * mm, 28 * mm, "共创结果", "保留用户判断", CORAL)
    for i in range(3):
        arrow(c, bx + 50 * mm, by + 9 * mm - i * 25 * mm, fx - 3 * mm, y0 + 14 * mm)

    c.setFillColor(INK)
    c.setFont("PortfolioSans", 16)
    c.drawString(M + 4 * mm, 48 * mm, "研究路径")
    steps = [("聊天调查", "发现分担不清"), ("故事模拟", "观察是否察觉"), ("三版 UI", "比较提示强度"), ("眼动任务", "看注意路径")]
    sx, sy = M + 4 * mm, 28 * mm
    for i, (title, body) in enumerate(steps):
        x = sx + i * 66 * mm
        soft_box(c, x, sy, 52 * mm, 18 * mm, title, body, [GREEN, BRAND, BLUE, CORAL][i], colors.white, 10)
        if i < len(steps) - 1:
            arrow(c, x + 54 * mm, sy + 9 * mm, x + 64 * mm, sy + 9 * mm)


def draw_car_scene(c, x, y, w, h, title, speech, danger_side="right", accent=CORAL):
    c.setFillColor(colors.HexColor("#20242A"))
    c.roundRect(x, y, w, h, 4 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor("#8A8F96"))
    c.setLineWidth(0.7)
    for i in range(1, 4):
        xx = x + i * w / 4
        c.line(xx, y + 6 * mm, xx, y + h - 6 * mm)
    c.setFillColor(colors.HexColor("#3A3F46"))
    c.roundRect(x + w / 2 - 12 * mm, y + 7 * mm, 24 * mm, 18 * mm, 3 * mm, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.roundRect(x + w / 2 - 8 * mm, y + 13 * mm, 16 * mm, 7 * mm, 2 * mm, fill=1, stroke=0)
    if danger_side == "right":
        dx = x + w - 30 * mm
        label = "小朋友"
    else:
        dx = x + 22 * mm
        label = "并线车"
    c.setFillColor(accent)
    c.circle(dx, y + h - 25 * mm, 5 * mm, fill=1, stroke=0)
    c.setFont("PortfolioSans", 8)
    c.setFillColor(colors.white)
    c.drawCentredString(dx, y + h - 27.5 * mm, "!")
    c.setStrokeColor(accent)
    c.setLineWidth(1.2)
    c.line(dx, y + h - 30 * mm, x + w / 2, y + 28 * mm)
    c.setFillColor(colors.white)
    c.roundRect(x + 8 * mm, y + h - 18 * mm, w - 16 * mm, 13 * mm, 3 * mm, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("PortfolioSans", 11)
    c.drawString(x + 12 * mm, y + h - 13.5 * mm, speech)
    c.setFillColor(MUTED)
    c.setFont("PortfolioSans", 7.5)
    c.drawString(x + 8 * mm, y + 5 * mm, f"{title} / {label}")


def hmi_concept_page(c, page, work):
    header(c, page, "CASE 02 / ATTENTION HMI")
    title_block(
        c,
        "智驾注意力 HMI",
        "不是显示车距，而是提示危险会怎么发生",
        "高价值智驾不只让人信任系统，也要把驾驶者的关注拉回道路。",
        width=145 * mm,
    )
    scene_y = 72 * mm
    draw_car_scene(c, M + 8 * mm, scene_y, 116 * mm, 70 * mm, "右侧行人风险", "小朋友可能突然冲出", "right", CORAL)
    draw_car_scene(c, M + 145 * mm, scene_y, 116 * mm, 70 * mm, "右侧并线风险", "你不要过来啊", "left", BRAND)
    soft_box(c, M + 8 * mm, 28 * mm, 74 * mm, 28 * mm, "信息取舍", "少量、短句、只提示高危重点。", GREEN)
    soft_box(c, M + 99 * mm, 28 * mm, 74 * mm, 28 * mm, "情绪价值", "轻度娱乐化让用户重新关注路面。", BRAND)
    soft_box(c, M + 190 * mm, 28 * mm, 74 * mm, 28 * mm, "安全边界", "高风险时只保留关键警示。", CORAL)


def title_block(c, kicker, title, body, x=M, top=None, width=105 * mm):
    if top is None:
        top = H - 22 * mm
    c.setFillColor(BRAND)
    c.setFont("PortfolioSans", 8.5)
    c.drawString(x, top, kicker)
    y = para(c, title, x, top - 5 * mm, width, ST["h1"])
    y = para(c, body, x, y - 4 * mm, width, ST["body"])
    return y


def section_page(c, page, work, image_path=None, detail_image=None, accent=BRAND):
    header(c, page, "SELECTED PROJECT")
    left_w = 105 * mm
    right_x = M + left_w + 12 * mm
    right_w = W - right_x - M
    title_block(c, f"{work['category']} / {work['year']}", work["title"], work["question"], width=left_w)

    y = H - 75 * mm
    c.setFillColor(accent)
    c.setFont("PortfolioSans", 8)
    c.drawString(M, y, "3 个设计点")
    y -= 5 * mm
    for i, (t, b) in enumerate(work["process"], 1):
        y = para(c, f"<b>{i:02d} · {t}</b>", M, y, left_w, ST["point"])
        y -= 3 * mm

    c.setFillColor(accent)
    c.setFont("PortfolioSans", 8)
    c.drawString(M, y, "项目特点")
    y -= 5 * mm
    y = para(c, work["feature"], M, y, left_w, ST["quote"])

    if image_path:
        fit_image(c, image_path, right_x, H - 118 * mm, right_w, 96 * mm)
    if detail_image:
        fit_image(c, detail_image, right_x, H - 183 * mm, right_w, 57 * mm)
    else:
        info_y = H - 183 * mm
        soft_box(c, right_x, info_y + 15 * mm, right_w, 38 * mm, "视觉重点", work["feature"], accent)


def project_index(c, works, profile=None):
    header(c, 2, "PORTFOLIO MAP")
    title = "这不是作品堆叠，而是六个具体问题"
    body = "每个项目都先从用户卡住的一刻进入，再说明界面取舍、原型范围和还需要验证的部分。面试时可以先看目录页，再按岗位方向跳到相关案例。"
    fit = "用户研究、AI 产品体验、车载 HMI、学习 UX、MR/AR 交互、日常产品系统。"
    if profile:
        title = profile["map_title"]
        body = profile["map_body"]
        fit = profile["fit"]
    title_block(
        c,
        "阅读方式",
        title,
        body,
        width=132 * mm,
    )
    x0, y0 = M, H - 103 * mm
    cw, ch = 84 * mm, 41 * mm
    for i, work in enumerate(works):
        x = x0 + (i % 3) * (cw + 7 * mm)
        y = y0 - (i // 3) * (ch + 8 * mm)
        c.setFillColor(colors.white)
        c.roundRect(x, y, cw, ch, 2.5 * mm, fill=1, stroke=0)
        c.setStrokeColor(LINE)
        c.setLineWidth(0.45)
        c.roundRect(x, y, cw, ch, 2.5 * mm, fill=0, stroke=1)
        c.setFillColor(BRAND)
        c.setFont("PortfolioSans", 7.2)
        c.drawString(x + 4 * mm, y + ch - 7 * mm, f"{i+1:02d} / {work['type']}")
        para(c, work["title"], x + 4 * mm, y + ch - 12 * mm, cw - 8 * mm, ST["card_title"])
        para(c, work["question"], x + 4 * mm, y + ch - 24 * mm, cw - 8 * mm, ST["tiny"])

    card(c, M, 30 * mm, 83 * mm, 28 * mm, "我能提供的部分", "问题定义、用户研究、信息架构、UI/UX 原型、视频/空间刺激、眼动与比较任务设计。", GREEN)
    card(c, M + 91 * mm, 30 * mm, 83 * mm, 28 * mm, "当前边界", "多数项目是研究型作品；可运行 MVP 与可验证数据会明确标出，不把计划说成已完成结果。", CORAL)
    card(c, M + 182 * mm, 30 * mm, 83 * mm, 28 * mm, "适配方向", fit, BLUE)


def cover(c, profile=None):
    cover_title = "面向用户研究与 AI 产品体验的作品集"
    cover_lead = "我从用户犹豫、分心、忘记、没把握的具体时刻进入设计，把问题转成界面结构、原型任务和可以继续验证的判断。"
    chips = ["用户研究", "AI 产品体验", "车载 HMI"]
    if profile:
        cover_title = profile["cover_title"]
        cover_lead = profile["cover_lead"]
        chips = profile["chips"]
    c.setFillColor(PALE)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    fit_image(c, "/works/portfolio/1op.PNG", W - 122 * mm, H - 91 * mm, 92 * mm, 65 * mm, border=False, bg=PALE)
    fit_image(c, "/works/frametrace/hero.jpg", W - 108 * mm, H - 155 * mm, 78 * mm, 55 * mm, border=False, bg=PALE)
    fit_image(c, "/works/portfolio/haojiu-meichi-cover.png", W - 124 * mm, H - 190 * mm, 94 * mm, 34 * mm, border=False, bg=PALE)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.8)
    c.rect(M, M, W - 2 * M, H - 2 * M, fill=0, stroke=1)
    c.setFillColor(BRAND)
    c.setFont("PortfolioSans", 9)
    c.drawString(24 * mm, H - 35 * mm, "PRODUCT DESIGN / HCI / KANSEI ENGINEERING")
    para(c, "孔维鹏", 24 * mm, H - 48 * mm, 110 * mm, ST["cover_name"])
    para(c, cover_title, 24 * mm, H - 82 * mm, 130 * mm, ST["cover_title"])
    para(
        c,
        cover_lead,
        24 * mm,
        H - 112 * mm,
        126 * mm,
        ST["lead"],
    )
    chip_colors = [GREEN, BLUE, CORAL]
    for i, item in enumerate(chips[:3]):
        chip(c, item, (24 + i * 37) * mm, 37 * mm, chip_colors[i])
    c.setFillColor(MUTED)
    c.setFont("PortfolioSans", 8.4)
    c.drawString(24 * mm, 26 * mm, "lkdesigner.top / littlekeen@outlook.com")
    draw_qr(c, PORTFOLIO_URL, W - 54 * mm, 24 * mm, 23 * mm)
    c.drawCentredString(W - 42.5 * mm, 18 * mm, "详细网页作品集")


def frametrace_detail(c, page):
    header(c, page, "KEY CASE / FRAMETRACE")
    title_block(
        c,
        "研究型重点项目",
        "FrameTrace：把照片里的机位变成可再次进入的空间线索",
        "这个项目的关键不是把照片贴到 MR 里，而是把“站在哪里、看向哪里、为什么这样构图”拆成可行走、可对齐、可授权的体验流程。",
        width=130 * mm,
    )
    fit_image(c, "/works/frametrace/story-discover.jpg", M, H - 139 * mm, 82 * mm, 57 * mm)
    fit_image(c, "/works/frametrace/story-navigate.jpg", M + 90 * mm, H - 139 * mm, 82 * mm, 57 * mm)
    fit_image(c, "/works/frametrace/story-align.jpg", M + 180 * mm, H - 139 * mm, 82 * mm, 57 * mm)
    card(c, M, 35 * mm, 60 * mm, 37 * mm, "调查样本", "106 份形成性问卷；排除高风险回答后的主分析为 N=82。", GREEN)
    card(c, M + 67 * mm, 35 * mm, 60 * mm, 37 * mm, "主要发现", "公共机位复现适合作为主流程，私人旧照回访更适合作为个人记忆支线。", BRAND)
    card(c, M + 134 * mm, 35 * mm, 60 * mm, 37 * mm, "下一步", "用 Quest 3 观察寻找、行走、对齐中的完成时间、构图误差、分心与疲劳。", CORAL)
    card(c, M + 201 * mm, 35 * mm, 60 * mm, 37 * mm, "边界", "问卷只能判断概念方向，不能代替真实头显中的行为验证。", BLUE)


def taste_detail(c, page):
    header(c, page, "KEY CASE / MINI PROGRAM")
    title_block(
        c,
        "可运行 MVP",
        "好久没吃：把“想不起来吃什么”改成查看个人饮食记忆",
        "它不是再做一个外卖推荐列表，而是让用户从此刻的感觉进入，再从自己的记录里找回少量有来历的候选。",
        width=132 * mm,
    )
    imgs = [
        ("/works/haojiu-meichi/ui/home.jpg", "感觉入口"),
        ("/works/haojiu-meichi/ui/record.jpg", "低负担记录"),
        ("/works/haojiu-meichi/ui/memories.jpg", "味道时间轴"),
        ("/works/haojiu-meichi/ui/reminders.jpg", "再会提醒"),
    ]
    x = M
    for path, label in imgs:
        fit_image(c, path, x, H - 170 * mm, 58 * mm, 98 * mm)
        c.setFillColor(BRAND)
        c.setFont("PortfolioSans", 7.5)
        c.drawCentredString(x + 29 * mm, H - 176 * mm, label)
        x += 65 * mm
    card(c, M, 27 * mm, 82 * mm, 31 * mm, "流程", "感觉 -> 少量候选 -> 行动/稍后 -> 记录 -> 时间轴 -> 再会提醒。", GREEN)
    card(c, M + 91 * mm, 27 * mm, 82 * mm, 31 * mm, "隐私", "照片、地点和文字默认不公开；记录和偏好以个人数据为中心组织。", BRAND)
    card(c, M + 182 * mm, 27 * mm, 82 * mm, 31 * mm, "下一步测试", "5-8 人任务测试和 7 天使用观察，查看它是否真的带来一次再吃。", CORAL)


def method_page(c, page):
    header(c, page, "METHOD")
    title_block(
        c,
        "工作方式",
        "从感性词到可验证界面",
        "我的方法不是先把项目包装成宏大概念，而是把用户说不清的感受拆成设计变量，再用原型让它可以被讨论和比较。",
        width=128 * mm,
    )
    steps = [
        ("01 发现卡点", "访谈、问卷和场景整理：用户在哪一刻犹豫、分心、忘记或没把握。"),
        ("02 拆成变量", "把安心、继续、注意、责任感这类词，变成提示强度、信息位置、默认状态和反馈节奏。"),
        ("03 做成原型", "用 Figma、Blender、After Effects、Quest 3 或微信小程序，把判断放回真实流程。"),
        ("04 比较与边界", "用任务、问卷、眼动或行为观察说明当前能判断什么，哪些还不能说满。"),
    ]
    x0, y0 = M, H - 108 * mm
    for i, (t, b) in enumerate(steps):
        card(c, x0 + (i % 2) * 136 * mm, y0 - (i // 2) * 48 * mm, 123 * mm, 37 * mm, t, b, [GREEN, BRAND, BLUE, CORAL][i])
    fit_image(c, "/works/portfolio/3cn.PNG", M, 28 * mm, 82 * mm, 45 * mm)
    fit_image(c, "/works/portfolio/6cn.PNG", M + 91 * mm, 28 * mm, 82 * mm, 45 * mm)
    fit_image(c, "/works/portfolio/2op.PNG", M + 182 * mm, 28 * mm, 82 * mm, 45 * mm)


def closing(c, page):
    header(c, page, "CONTACT")
    title_block(
        c,
        "最后",
        "如果只记住一句话",
        "我做的不是把界面画得更满，而是把用户在某一刻为什么停住、为什么需要帮助、为什么还要自己判断讲清楚，并把它做成可以继续验证的产品原型。",
        width=150 * mm,
    )
    card(c, M, H - 123 * mm, 82 * mm, 40 * mm, "可实习时间", "2026.09-2026.11 可全职实习，预计约 3 个月；正式入职可考虑 2027.05 后。", GREEN)
    card(c, M + 91 * mm, H - 123 * mm, 82 * mm, 40 * mm, "语言与背景", "哈尔滨理工大学工业设计系本科；札幌市立大学人间情报设计修士前期课程；日语 JLPT N1。", BRAND)
    card(c, M + 182 * mm, H - 123 * mm, 82 * mm, 40 * mm, "工具", "Figma、Photoshop、Illustrator、Blender、After Effects，主要服务于 UX 实验模拟和概念验证。", BLUE)
    draw_qr(c, PORTFOLIO_URL, W / 2 - 18 * mm, 36 * mm, 36 * mm)
    c.setFillColor(INK)
    c.setFont("PortfolioSans", 12)
    c.drawCentredString(W / 2, 28 * mm, "lkdesigner.top")
    c.setFillColor(MUTED)
    c.setFont("PortfolioSans", 9)
    c.drawCentredString(W / 2, 21 * mm, "littlekeen@outlook.com")


works = [
    {
        "title": "人-AI 分担共创界面",
        "type": "AI 交互 / 人-AI 共创",
        "category": "AI 交互",
        "year": "2025-2026",
        "status": "修士研究进行中",
        "role": "交互概念、UI 架构、比较任务与眼动验证流程",
        "methods": "聊天调查、故事流程模拟、比较 UI、眼动追踪",
        "evidence": "已形成 AI 代行、AI 商谈、用户决定三类界面变量；眼动与选择任务为下一步验证。",
        "feature": "AI 代行 / AI 商谈 / 用户决定",
        "description": "把共创过程拆成 AI 代行、AI 商谈和用户决定三种状态，让用户能看见自己在哪一步还需要参与判断。",
        "question": "AI 共创不是只有“输出好不好”，还要问用户是否知道自己应该在哪一步介入。",
        "process": [("发现问题", "从自由聊天调查中整理用户对 AI 共创的依赖、犹豫和责任不清。"), ("模拟流程", "用固定故事流程观察用户在生成、讨论、决定之间是否会改变参与方式。"), ("比较验证", "把不同程度的提示做成可比较 UI，再用眼动和选择任务检查注意路径。")],
        "outcomes": ["界面提示的重点不是解释 AI 有多强，而是标出当前更适合代行、商谈还是用户决定。", "三种状态可以作为后续比较实验的自变量。", "修士研究会继续检查提示方式是否改变视线分配和最终选择。"],
        "image": "/works/portfolio/1op.PNG",
    },
    {
        "title": "智驾注意力 AR-HUD",
        "type": "汽车 HMI / AR-HUD",
        "category": "汽车 HMI",
        "year": "2025-2026",
        "status": "注意力提示概念",
        "role": "HMI 研究、注意力设计、安全边界与用户主观体验测试计划",
        "methods": "驾驶场景拆解、AR-HUD 概念、信息负担梳理",
        "evidence": "当前为概念与测试方案阶段，重点是信息分层和安全边界，不写成已完成安全验证。",
        "feature": "用短句和情绪提示明示高危重点",
        "description": "把智驾系统正在关注的风险位置、原因和紧急程度表达出来，避免界面只堆叠速度、距离和状态信息。",
        "question": "自动驾驶辅助越强，驾驶者越容易变成旁观者；HMI 需要说明什么，才不会增加干扰？",
        "process": [("场景分层", "区分日常巡航、潜在风险和接管前后的信息需求。"), ("提示强度", "比较理性说明、轻度视觉提示和指导化提示对注意力的影响。"), ("安全边界", "高风险时清除非必要内容，只保留关键警示和行动信息。")],
        "outcomes": ["这个方向不是证明 AR-HUD 更安全，而是先界定哪些信息可能帮助驾驶者理解系统关注点。", "后续需要用视频刺激或模拟任务比较提示强度。", "评价重点会放在理解负担、分心风险和接管前信息清晰度。"],
        "image": "/works/portfolio/2op.PNG",
    },
    {
        "title": "日语试读辅助界面",
        "type": "学习 UX / AI 陪伴",
        "category": "学习 UX",
        "year": "2025-2026",
        "status": "试读流程概念",
        "role": "学习体验、适当支援模型、UI 叙事",
        "methods": "试读流程、卡顿支援、成长痕迹地图、反馈界面",
        "evidence": "已完成试读流程、卡顿支援层级和反馈界面构想，下一步需要移动端任务测试。",
        "feature": "从自己的文稿试读，只在卡顿时帮助",
        "description": "从学习者自己的文稿出发，在试读卡顿时给出分级帮助，而不是一开始就替用户改完整段。",
        "question": "学习者真正卡住的时刻，可能不是不知道答案，而是不知道该不该继续读下去。",
        "process": [("文稿出发", "围绕用户自己想说的话练习，降低从孤立单词开始的割裂感。"), ("分级支援", "把提示拆成假名、词义、语气和整句示范，避免一次性代替。"), ("回看练习", "保存停顿、重读和顺利读过的表达，让用户知道下一次该练哪里。")],
        "outcomes": ["这个项目的核心不是做一个全能日语老师，而是控制 AI 介入的时机。", "试读流程可以把卡顿从失败感改成可继续练习的线索。", "下一步需要把文稿、卡顿帮助和练习回看连成完整手机流程。"],
        "image": "/works/portfolio/3op.PNG",
        "detail": "/works/portfolio/3cn.PNG",
    },
    {
        "title": "FrameTrace 跨时间摄影引导",
        "type": "MR 眼镜 / 跨时间摄影",
        "category": "MR 眼镜",
        "year": "2025-2026",
        "status": "Quest 3 原型进行中",
        "role": "独立完成调研、空间 UX、MR 交互与 Quest 3 原型",
        "methods": "106 份问卷、敏感性分析、场景设计与空间原型",
        "evidence": "106 份概念问卷，主分析 N=82；整体概念 5.65/7，私人旧照回访 5.81/7，隐私顾虑 69.5%。",
        "feature": "和另一个时间的人在同一空间共同摄影",
        "description": "通过 MR 眼镜让用户在同一真实空间中，与另一个时间的自己或他人共同完成摄影体验。",
        "question": "用户想复现一张照片时，缺少的往往不是照片本身，而是拍摄者当时站在哪里、看向哪里。",
        "process": [("调查概念印象", "用 106 份形成性问卷比较核心概念、支线功能、采用顾虑与整体好感。"), ("拆清主线", "结果提示公共机位复现更适合作为主流程，私人旧照回访更适合作为个人记忆支线。"), ("制作下一版原型", "继续实现行走状态、授权、旧照回访和空间共创流程，并进行行为验证。")],
        "outcomes": ["公共机位复现需要优先解决寻找、行走和对齐三步。", "主分析 N=82 中，整体概念第一印象为 5.65/7。", "隐私、推荐解释与行走安全是下一版原型的优先课题。"],
        "image": "/works/frametrace/hero.jpg",
    },
    {
        "title": "好久没吃 微信小程序",
        "type": "微信小程序 / 饮食记忆提醒",
        "category": "微信小程序",
        "year": "2025-2026",
        "status": "MVP 可运行",
        "role": "独立完成产品定义、调研、UX/UI 与微信小程序实现",
        "methods": "形成性调研、行为闭环设计、信息架构与移动端原型",
        "evidence": "57 人形成性问卷；89.47% 经常或偶尔不知道吃什么，71.93% 认为选择太多会增加决策难度。",
        "feature": "别忘了那家、那一碗、那个想再吃的味道",
        "description": "一款记录吃过什么和当时感觉，并在“好久没吃了”的时刻提醒用户想起旧味道的微信小程序。",
        "question": "选餐困难不一定是缺少推荐，也可能是用户想不起自己过去喜欢过什么。",
        "process": [("重新界定问题", "不再增加食物选择，而是关注选择过载与“想起来却没有行动”的断点。"), ("设计规律闭环", "把吃过什么、多久没吃、喜欢程度和嘴馋时刻连接起来。"), ("实现核心流程", "完成从首次理解和记录，到查找旧味道与再次品尝的可运行小程序。")],
        "outcomes": ["首页先问感觉，再从个人记录里给出少量候选，避免变成另一个外卖列表。", "“好久没吃”不是催促，而是带理由、可拒绝的回忆提示。", "当前 MVP 已完成核心流程，下一步看它是否真的带来一次再吃。"],
        "image": "/works/portfolio/haojiu-meichi-cover.png",
    },
    {
        "title": "冰箱日期提示系统",
        "type": "产品系统 / 食材管理",
        "category": "产品系统",
        "year": "2023",
        "status": "大学毕业设计",
        "role": "产品服务系统、硬件交互、行为设计",
        "methods": "用户旅程、硬件场景、灯光引导交互",
        "evidence": "2023 年本科毕业设计，已完成产品服务系统、硬件交互场景和界面流程方案。",
        "feature": "让用户在放入食材时就开始管理日期",
        "description": "把食材放入、保存、提醒和料理计划连成一套流程，让用户在放进去的时候就开始管理日期。",
        "question": "食材过期常常不是因为用户不知道日期，而是日期信息没有在存放和取用时出现。",
        "process": [("放入前", "用磁吸摄像头扫描食材，记录类别、购买日期和预期保存期限。"), ("放入时", "根据类型和期限推荐存放区域，并用灯光提示具体位置。"), ("料理时", "通过手机、冰箱屏幕和内部灯光找到食材，并围绕临期食材规划料理。")],
        "outcomes": ["设计重点从“提醒过期”前移到“放入时就建立记录”。", "手机 UI、冰箱屏幕和内部灯光分别承担远程提醒、查看和定位。", "毕业设计完成了产品服务系统概念，硬件实现仍需要进一步工程验证。"],
        "image": "/works/portfolio/6op.PNG",
        "detail": "/works/portfolio/6cn.PNG",
    },
]


ST = {}

TARGET_PROFILES = [
    {
        "slug": "hmi",
        "output": ROOT / "output/pdf/kong-weipeng-portfolio-xiaomi-hmi-cn.pdf",
        "cover_title": "面向自动驾驶 HMI 与体验产品的作品集",
        "cover_lead": "我关注智驾系统怎样把风险、注意力和用户判断讲清楚。界面不是堆数据，而是在关键时刻告诉驾驶者：系统看见了什么、为什么重要、现在要不要介入。",
        "chips": ["汽车 HMI", "体验洞察", "交互原型"],
        "map_title": "先看智驾注意力，再看 AI 分担判断",
        "map_body": "这版用于汽车部体验产品经理实习：重点放在 HMI 信息取舍、竞品可拆解的体验点、用户反馈如何转成 UE/UI 可执行需求。",
        "fit": "自动驾驶 HMI、体验走查、竞品分析、用户反馈、UE/UI 协作。",
        "work_titles": ["智驾注意力 AR-HUD", "人-AI 分担共创界面", "好久没吃 微信小程序", "FrameTrace 跨时间摄影引导", "冰箱日期提示系统"],
    },
    {
        "slug": "ai-innovation",
        "output": ROOT / "output/pdf/kong-weipeng-portfolio-xiaomi-ai-innovation-cn.pdf",
        "cover_title": "面向 AI 创新产品与场景定义的作品集",
        "cover_lead": "我擅长把复杂技术翻译成普通人能理解、愿意使用的场景：先找到用户为什么需要它，再把功能、交互和故事讲成一条可验证的产品路径。",
        "chips": ["AI 产品", "场景定义", "产品叙事"],
        "map_title": "先看 AI 共创，再看日常场景产品化",
        "map_body": "这版用于集团技术委员会 AI 创新产品实习：重点放在场景挖掘、产品 sense、人话表达、硬件/消费电子体验中的真实使用理由。",
        "fit": "AI 产品体验、场景分析、产品 Brief、竞品拆解、内容脚本。",
        "work_titles": ["人-AI 分担共创界面", "好久没吃 微信小程序", "FrameTrace 跨时间摄影引导", "智驾注意力 AR-HUD", "冰箱日期提示系统"],
    },
    {
        "slug": "ai-vehicle-service",
        "output": ROOT / "output/pdf/kong-weipeng-portfolio-xiaomi-ai-vehicle-service-cn.pdf",
        "cover_title": "面向车载语音与生活服务 AI 的作品集",
        "cover_lead": "我把车内体验看成移动中的生活场景：用户不只是发出指令，也会分心、犹豫、想不起目标。产品需要帮他把需求说出来，并用最少的信息完成下一步。",
        "chips": ["车载语音", "生活服务", "需求挖掘"],
        "map_title": "先看车内注意力，再看生活服务需求",
        "map_body": "这版用于车载生活服务 AI 产品实习：重点放在语音/轻交互场景、用户需求挖掘、功能策划和从日常行为生成产品机会。",
        "fit": "车载生活服务、语音交互、需求挖掘、功能策划、交互设计。",
        "work_titles": ["智驾注意力 AR-HUD", "好久没吃 微信小程序", "人-AI 分担共创界面", "冰箱日期提示系统", "FrameTrace 跨时间摄影引导"],
    },
]


def build_styles():
    ST.update(
        {
            "cover_name": ParagraphStyle("cover_name", fontName="PortfolioSans", fontSize=34, leading=38, textColor=INK, alignment=TA_LEFT),
            "cover_title": ParagraphStyle("cover_title", fontName="PortfolioSans", fontSize=20, leading=26, textColor=INK, alignment=TA_LEFT),
            "h1": ParagraphStyle("h1", fontName="PortfolioSans", fontSize=24, leading=30, textColor=INK, alignment=TA_LEFT),
            "lead": ParagraphStyle("lead", fontName="PortfolioSans", fontSize=12.5, leading=20, textColor=INK, alignment=TA_LEFT),
            "body": ParagraphStyle("body", fontName="PortfolioSans", fontSize=10.2, leading=16, textColor=INK, alignment=TA_LEFT),
            "quote": ParagraphStyle("quote", fontName="PortfolioSans", fontSize=12, leading=18, textColor=INK, alignment=TA_LEFT),
            "point": ParagraphStyle("point", fontName="PortfolioSans", fontSize=14, leading=20, textColor=INK, alignment=TA_LEFT),
            "small": ParagraphStyle("small", fontName="PortfolioSans", fontSize=8.3, leading=12.6, textColor=MUTED, alignment=TA_LEFT),
            "tiny": ParagraphStyle("tiny", fontName="PortfolioSans", fontSize=7.3, leading=10.5, textColor=MUTED, alignment=TA_LEFT),
            "card_title": ParagraphStyle("card_title", fontName="PortfolioSans", fontSize=11, leading=15, textColor=INK, alignment=TA_LEFT),
            "center": ParagraphStyle("center", fontName="PortfolioSans", fontSize=9, leading=13, textColor=MUTED, alignment=TA_CENTER),
        }
    )


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    register_fonts()
    build_styles()
    c = canvas.Canvas(str(OUTPUT), pagesize=landscape(A4), pageCompression=1)
    c.setTitle("KONG WEIPENG Product Design Portfolio")
    c.setAuthor("KONG WEIPENG")

    portfolio_works = [work for work in works if work["title"] != "日语试读辅助界面"]

    cover(c)
    c.showPage()

    project_index(c, portfolio_works)
    c.showPage()

    page = 3
    accents = [GREEN, BLUE, CORAL, BRAND, GREEN, BLUE]
    for work, accent in zip(portfolio_works, accents):
        if work["title"].startswith("人-AI"):
            ai_flow_page(c, page, work)
        elif work["title"].startswith("智驾"):
            hmi_concept_page(c, page, work)
        else:
            section_page(c, page, work, work.get("image"), work.get("detail"), accent)
        c.showPage()
        page += 1
        if work["title"].startswith("FrameTrace"):
            frametrace_detail(c, page)
            c.showPage()
            page += 1
        if work["title"].startswith("好久没吃"):
            taste_detail(c, page)
            c.showPage()
            page += 1

    method_page(c, page)
    c.showPage()
    page += 1

    closing(c, page)
    c.save()
    print(OUTPUT)


def build_target(profile):
    profile["output"].parent.mkdir(parents=True, exist_ok=True)
    by_title = {work["title"]: work for work in works}
    selected = [by_title[title] for title in profile["work_titles"]]
    c = canvas.Canvas(str(profile["output"]), pagesize=landscape(A4), pageCompression=1)
    c.setTitle(f"KONG WEIPENG Portfolio - {profile['slug']}")
    c.setAuthor("KONG WEIPENG")

    cover(c, profile)
    c.showPage()

    project_index(c, selected, profile)
    c.showPage()

    page = 3
    accents = [GREEN, BLUE, CORAL, BRAND, GREEN]
    for work, accent in zip(selected, accents):
        if work["title"].startswith("人-AI"):
            ai_flow_page(c, page, work)
        elif work["title"].startswith("智驾"):
            hmi_concept_page(c, page, work)
        else:
            section_page(c, page, work, work.get("image"), work.get("detail"), accent)
        c.showPage()
        page += 1
        if work["title"].startswith("FrameTrace"):
            frametrace_detail(c, page)
            c.showPage()
            page += 1
        if work["title"].startswith("好久没吃"):
            taste_detail(c, page)
            c.showPage()
            page += 1

    method_page(c, page)
    c.showPage()
    page += 1

    closing(c, page)
    c.save()
    print(profile["output"])


if __name__ == "__main__":
    build()
    for profile in TARGET_PROFILES:
        build_target(profile)
