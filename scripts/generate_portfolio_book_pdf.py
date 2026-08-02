from pathlib import Path

from PIL import Image
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
FONT = "/Library/Fonts/Arial Unicode.ttf"
PORTFOLIO_URL = "https://lkdesigner.top"
CACHE_DIR = ROOT / "tmp/pdfs/book-image-cache"
OUT_DIR = ROOT / "output/pdf"

W, H = A4
M = 17 * mm

INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#5A544B")
PAPER = colors.HexColor("#FFFAF0")
CREAM = colors.HexColor("#FFF3D4")
LINE = colors.HexColor("#E4B84A")
GOLD = colors.HexColor("#B57900")
TEAL = colors.HexColor("#1E7770")
CORAL = colors.HexColor("#E6674A")
BLUE = colors.HexColor("#3869A6")
BLACK = colors.HexColor("#1E1F20")


def register_fonts():
    pdfmetrics.registerFont(TTFont("BookSans", FONT))


def asset(path):
    return ROOT / "public" / path.lstrip("/")


def optimized(path, max_side=1800):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    out = CACHE_DIR / f"{path.stem}-{max_side}.jpg"
    if out.exists() and out.stat().st_mtime >= path.stat().st_mtime:
        return out
    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((max_side, max_side), Image.LANCZOS)
        im.save(out, "JPEG", quality=86, optimize=True, progressive=True)
    return out


def crop_image(c, image_path, x, y, w, h):
    path = asset(image_path) if str(image_path).startswith("/") else ROOT / image_path
    if not path.exists():
        c.setFillColor(CREAM)
        c.rect(x, y, w, h, fill=1, stroke=0)
        return
    path = optimized(path)
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    c.rect(x, y, w, h, fill=0, stroke=0)
    c.clipPath(c.beginPath(), stroke=0, fill=0)
    c.drawImage(reader, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")
    c.restoreState()


def fit_image(c, image_path, x, y, w, h):
    path = asset(image_path) if str(image_path).startswith("/") else ROOT / image_path
    if not path.exists():
        c.setFillColor(CREAM)
        c.rect(x, y, w, h, fill=1, stroke=0)
        return
    path = optimized(path)
    reader = ImageReader(str(path))
    iw, ih = reader.getSize()
    scale = min(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.setFillColor(colors.white)
    c.rect(x, y, w, h, fill=1, stroke=0)
    c.drawImage(reader, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh, mask="auto")


def para(c, text, x, top, width, style, max_height=999 * mm):
    p = Paragraph(text, style)
    _, h = p.wrap(width, max_height)
    p.drawOn(c, x, top - h)
    return top - h


def qr(c, value, x, y, size):
    q = QrCodeWidget(value)
    b = q.getBounds()
    drawing = Drawing(size, size, transform=[size / (b[2] - b[0]), 0, 0, size / (b[3] - b[1]), 0, 0])
    drawing.add(q)
    renderPDF.draw(drawing, c, x, y)


def page_base(c, page, section):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.65)
    c.line(M, H - 12 * mm, W - M, H - 12 * mm)
    c.setFillColor(MUTED)
    c.setFont("BookSans", 7.2)
    c.drawString(M, H - 8 * mm, section)
    c.drawRightString(W - M, H - 8 * mm, f"{page:02d}")
    c.drawString(M, 9 * mm, "KONG WEIPENG / 孔维鹏")
    c.drawRightString(W - M, 9 * mm, "lkdesigner.top")


def pill(c, text, x, y, color):
    c.setFillColor(CREAM)
    c.roundRect(x, y, 40 * mm, 8 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(color)
    c.setFont("BookSans", 7.3)
    c.drawString(x + 3 * mm, y + 2.4 * mm, text)


def note(c, label, body, x, y, w, color):
    c.setStrokeColor(color)
    c.setLineWidth(0.9)
    c.line(x, y + 24 * mm, x, y)
    c.setFillColor(color)
    c.setFont("BookSans", 8.6)
    c.drawString(x + 4 * mm, y + 20 * mm, label)
    para(c, body, x + 4 * mm, y + 15 * mm, w - 4 * mm, ST["small"])


def cover(c, profile):
    c.setFillColor(BLACK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    crop_image(c, profile["hero"], 0, H * 0.43, W, H * 0.57)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.42))
    c.rect(0, H * 0.43, W, H * 0.57, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont("BookSans", 9)
    c.drawString(M, H - 33 * mm, "PRODUCT DESIGN PORTFOLIO / 2026")
    para(c, "孔维鹏", M, H - 49 * mm, 110 * mm, ST["cover_name"])
    para(c, profile["title"], M, H - 70 * mm, 125 * mm, ST["cover_title_light"])
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H * 0.43, fill=1, stroke=0)
    para(c, profile["lead"], M, H * 0.37, W - 2 * M, ST["lead"])
    for i, item in enumerate(profile["chips"]):
        pill(c, item, M + i * 44 * mm, 42 * mm, [TEAL, BLUE, CORAL][i])
    c.setFillColor(MUTED)
    c.setFont("BookSans", 8.2)
    c.drawString(M, 28 * mm, "littlekeen@outlook.com")
    qr(c, PORTFOLIO_URL, W - M - 22 * mm, 24 * mm, 22 * mm)


def standpoint(c, profile, page):
    page_base(c, page, "DESIGN STANDPOINT")
    para(c, "我想传达的不是“会做很多界面”", M, H - 35 * mm, W - 2 * M, ST["h1"])
    y = para(
        c,
        "我更在意的是：用户在某一刻为什么停住，为什么分心，为什么不确定自己该不该相信系统，或者为什么明明喜欢过一个东西却想不起来。我的设计从这些很具体的人类状态进入，再把它们变成可以被界面承接的结构。",
        M,
        H - 65 * mm,
        W - 2 * M,
        ST["body_big"],
    )
    y = para(
        c,
        "所以这些项目不是按媒介分类，而是按同一个问题展开：技术进入生活之后，怎样继续发展用户自己的判断、注意力和记忆，而不是让系统把人的价值完全代替掉。",
        M,
        y - 8 * mm,
        W - 2 * M,
        ST["body_big"],
    )
    note(c, "方法", "从自由访谈、问卷、故事模拟和比较 UI 开始，先找到体验变量。", M, 92 * mm, 52 * mm, TEAL)
    note(c, "原型", "用 Figma、Blender、After Effects、微信小程序和 AI 工具把概念做成可讨论的形态。", M + 61 * mm, 92 * mm, 52 * mm, BLUE)
    note(c, "验证", "眼动、主观体验测试和任务比较不是装饰，而是为了看用户的注意与判断有没有变化。", M + 122 * mm, 92 * mm, 52 * mm, CORAL)
    para(c, profile["match"], M, 55 * mm, W - 2 * M, ST["quote"])


def project_group(c, profile, page):
    page_base(c, page, "PROJECT GROUP")
    para(c, profile["group_title"], M, H - 35 * mm, W - 2 * M, ST["h1"])
    y = H - 63 * mm
    for i, item in enumerate(profile["projects"], 1):
        project = PROJECTS[item]
        c.setFillColor([TEAL, BLUE, CORAL, GOLD, TEAL][i - 1])
        c.setFont("BookSans", 8.6)
        c.drawString(M, y, f"{i:02d}")
        y = para(c, project["title"], M + 13 * mm, y + 3 * mm, W - 2 * M - 13 * mm, ST["project_title"])
        y = para(c, project["one"], M + 13 * mm, y - 1 * mm, W - 2 * M - 13 * mm, ST["small"])
        c.setStrokeColor(LINE)
        c.line(M + 13 * mm, y - 6 * mm, W - M, y - 6 * mm)
        y -= 17 * mm


def case_hero(c, project, page):
    page_base(c, page, project["section"])
    crop_image(c, project["hero"], M, H - 137 * mm, W - 2 * M, 104 * mm)
    c.setFillColor(colors.Color(0, 0, 0, alpha=0.32))
    c.rect(M, H - 137 * mm, W - 2 * M, 104 * mm, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont("BookSans", 8.4)
    c.drawString(M + 7 * mm, H - 49 * mm, project["category"])
    para(c, project["title"], M + 7 * mm, H - 60 * mm, W - 2 * M - 14 * mm, ST["case_title_light"])
    para(c, project["one"], M + 7 * mm, H - 92 * mm, W - 2 * M - 14 * mm, ST["case_lead_light"])
    y = H - 155 * mm
    para(c, "问题不是缺少功能，而是缺少用户还能怎样参与的结构。", M, y, W - 2 * M, ST["quote"])
    c.setStrokeColor(LINE)
    c.line(M, y - 21 * mm, W - M, y - 21 * mm)
    para(c, project["opening"], M, y - 35 * mm, W - 2 * M, ST["body_big"])


def ai_structure(c, page):
    page_base(c, page, "CASE / HUMAN-AI CO-CREATION")
    para(c, "把“共创”拆成谁来承担这一步", M, H - 35 * mm, W - 2 * M, ST["h1"])
    para(c, PROJECTS["ai"]["story"], M, H - 62 * mm, W - 2 * M, ST["body"])
    labels = [("AI 代行", "系统先处理低风险或重复步骤"), ("AI 商谈", "用户还没想清时一起讨论"), ("用户决定", "收束方向与责任留给用户")]
    x = M
    y = 112 * mm
    for i, (a, b) in enumerate(labels):
        c.setStrokeColor([BLUE, GOLD, TEAL][i])
        c.setLineWidth(1.0)
        c.roundRect(x + i * 60 * mm, y, 53 * mm, 38 * mm, 2 * mm, fill=0, stroke=1)
        c.setFillColor([BLUE, GOLD, TEAL][i])
        c.setFont("BookSans", 13)
        c.drawString(x + i * 60 * mm + 5 * mm, y + 24 * mm, a)
        para(c, b, x + i * 60 * mm + 5 * mm, y + 18 * mm, 42 * mm, ST["small"])
    note(c, "研究路径", "自由聊天调查 -> 固定故事模拟 -> 三版 UI 比较 -> 眼动任务。这里的价值不是证明 AI 更强，而是看提示是否改变用户注意和判断。", M, 53 * mm, W - 2 * M, CORAL)


def hmi_structure(c, page):
    page_base(c, page, "CASE / ATTENTION HMI")
    para(c, "不做普通距离提示，而是说清危险会怎么发生", M, H - 35 * mm, W - 2 * M, ST["h1"])
    para(c, PROJECTS["hmi"]["story"], M, H - 63 * mm, W - 2 * M, ST["body"])
    note(c, "高危对象", "系统先告诉用户它正在看谁：右侧小朋友、准备并线的车、被遮挡的路口。", M, 105 * mm, 52 * mm, TEAL)
    note(c, "短句提示", "不是“距离 12m”，而是“小朋友可能突然冲出”“你不要过来啊”这种能快速唤回注意的短句。", M + 61 * mm, 105 * mm, 52 * mm, GOLD)
    note(c, "安全边界", "轻度情绪化只用于低到中风险；高风险时清空装饰内容，只保留关键警示。", M + 122 * mm, 105 * mm, 52 * mm, CORAL)
    para(c, "这个项目适合汽车体验产品岗位，因为它不是只展示漂亮 HUD，而是在讨论信息规范、风险分层、用户反馈和 UE/UI 走查时真正会遇到的取舍。", M, 55 * mm, W - 2 * M, ST["quote"])


def text_case(c, project, page):
    page_base(c, page, project["section"])
    para(c, project["text_title"], M, H - 35 * mm, W - 2 * M, ST["h1"])
    y = para(c, project["story"], M, H - 64 * mm, W - 2 * M, ST["body"])
    if project.get("detail"):
        fit_image(c, project["detail"], M, 36 * mm, W - 2 * M, 83 * mm)
    else:
        note(c, "设计判断", project["judgement"], M, 88 * mm, 80 * mm, TEAL)
        note(c, "岗位价值", project["job_value"], M + 94 * mm, 88 * mm, 80 * mm, CORAL)
    if project.get("detail_caption"):
        para(c, project["detail_caption"], M, 29 * mm, W - 2 * M, ST["caption"])


def close(c, profile, page):
    page_base(c, page, "CONTACT")
    para(c, "投递时我希望被看见的部分", M, H - 35 * mm, W - 2 * M, ST["h1"])
    para(c, profile["closing"], M, H - 68 * mm, W - 2 * M, ST["body_big"])
    note(c, "时间", "2026.09-2026.11 可全职实习，约 3 个月；2027.05 后可考虑正式入职。", M, 95 * mm, 80 * mm, TEAL)
    note(c, "背景", "哈尔滨理工大学工业设计系本科；札幌市立大学人间情报设计修士前期课程；日语 JLPT N1。", M + 94 * mm, 95 * mm, 80 * mm, BLUE)
    qr(c, PORTFOLIO_URL, W / 2 - 16 * mm, 43 * mm, 32 * mm)
    c.setFillColor(INK)
    c.setFont("BookSans", 12)
    c.drawCentredString(W / 2, 33 * mm, "lkdesigner.top")
    c.setFillColor(MUTED)
    c.setFont("BookSans", 8.8)
    c.drawCentredString(W / 2, 25 * mm, "littlekeen@outlook.com")


PROJECTS = {
    "ai": {
        "title": "人-AI 分担共创界面",
        "section": "CASE / HUMAN-AI CO-CREATION",
        "category": "AI 产品体验 / 毕业设计",
        "hero": "/works/portfolio/generated/ai-cocreation-hero.png",
        "one": "这个项目不是让 AI 更会生成，而是让用户在共创中知道：这一刻该由 AI 代行、一起商谈，还是回到自己决定。",
        "opening": "很多 AI 共创界面把用户放在等待输出的位置。我的问题是：如果用户不知道自己应该在哪一步参与，他就很容易把判断也交出去。这个界面把参与方式前置，让用户先判断分担关系，再进入生成。",
        "text_title": "让 AI 帮忙，但不替用户完成判断",
        "story": "我把共创过程拆成三个状态：AI 代行、AI 商谈、用户决定。AI 代行适合重复、低风险、可撤回的处理；AI 商谈适合用户还没想清方向，需要展开可能性；用户决定则用于收束目标、确认价值和承担最终选择。研究路径从自由聊天调查开始，再进入固定故事模拟、三版 UI 比较和眼动任务。这里的眼动不是为了制造学术感，而是为了看界面提示是否真的改变了用户看哪里、想多久、最后怎样选。",
        "judgement": "AI 产品体验的价值，不只在输出质量，也在用户是否还能发展自己的判断。",
        "job_value": "适合 AI 创新产品岗位中的场景定义、功能 Brief、产品叙事和用户研究。",
    },
    "hmi": {
        "title": "智驾注意力 HMI",
        "section": "CASE / INTELLIGENT DRIVING HMI",
        "category": "汽车 HMI / 注意力提示",
        "hero": "/works/portfolio/generated/hmi-attention-hero.png",
        "one": "我不想再做一张普通状态 HUD。这个项目讨论的是：智驾系统怎样把它正在关注的高危对象，用最少的信息还给驾驶者。",
        "opening": "智能驾驶越强，用户越容易变成旁观者。普通距离、速度和状态信息不能解释系统为什么紧张，也不能把人的注意力拉回道路。我的方向是让系统说清它正在看什么：右侧小朋友、准备并线的车、被遮挡路口，以及这些对象可能怎样变成风险。",
        "text_title": "把危险说成人能立刻理解的短句",
        "story": "这个项目的关键词不是“防黑箱”，而是关注价值。驾驶者需要知道系统正在关注什么，但又不能被大量解释干扰。所以我把提示拆成三层：高危对象、可能动作、提示语气。低到中风险时，可以用更像人话的短句唤回注意，例如“小朋友可能突然冲出”“你不要过来啊”；进入高风险时，界面就必须收敛，只保留关键警示和可执行动作。它适合做 HMI 规范和体验走查，因为每个提示都要回答：此刻为什么出现、应该多强、会不会分心、UE/UI 和研发怎样落地。",
        "judgement": "智驾 HMI 不只是让系统显得聪明，而是让驾驶者重新理解自己还需要关注什么。",
        "job_value": "适合汽车部体验产品岗位中的 HMI 细节走查、竞品分析、用户反馈和产品需求沟通。",
    },
    "taste": {
        "title": "好久没吃 微信小程序",
        "section": "CASE / MINI PROGRAM MVP",
        "category": "微信小程序 / 日常生活服务",
        "hero": "/works/portfolio/generated/taste-memory-hero.png",
        "one": "它不是再给用户推荐更多餐厅，而是把“那家、那一碗、那个想再吃的味道”从个人记忆里带回来。",
        "opening": "选餐困难不一定是缺少推荐。有时候用户只是想不起自己过去喜欢过什么，或者想起来了但没有形成行动。好久没吃从个人饮食记忆进入，记录吃过什么、什么时候吃、当时感觉如何，再在合适时刻提醒用户重新想起旧味道。",
        "text_title": "少给选择，多唤回一个具体记忆",
        "story": "这个小程序的设计判断是：不要把用户推向更大的推荐列表，而是把选择变小、变具体。首页先从此刻感觉进入，再给出少量来自个人记录的候选。记录不是为了做社交内容，而是为了形成时间线：多久没吃、当时喜不喜欢、在哪一家、为什么想再吃。对 AI 产品和生活服务岗位来说，它展示的是从日常行为里挖掘产品机会，以及把一个模糊感受做成可运行 MVP 的能力。",
        "judgement": "嘴馋不是随机需求，它和时间、地点、记忆、习惯有关。",
        "job_value": "适合 AI 创新产品和车载生活服务方向，作为场景挖掘、轻交互和 MVP 能力的证明。",
        "detail": "/works/haojiu-meichi/ui/home.jpg",
        "detail_caption": "详细 UI 可以在网页作品集查看；PDF 中只保留核心流程，避免像说明书一样堆界面。",
    },
    "frametrace": {
        "title": "FrameTrace 跨时间摄影引导",
        "section": "CASE / MR EXPERIENCE",
        "category": "MR 眼镜 / 空间摄影体验",
        "hero": "/works/portfolio/generated/frametrace-hero-generated.png",
        "one": "这个项目把过去照片里的机位、视线和构图关系，变成用户可以在同一真实地点重新进入的空间线索。",
        "opening": "用户想复现一张照片时，缺少的往往不是照片本身，而是拍摄者当时站在哪里、看向哪里、为什么这样构图。FrameTrace 用 MR 眼镜把旧照片里的空间关系拆出来，让另一个时间的人可以在同一地点共同完成一次摄影。",
        "text_title": "和另一个时间的人在同一空间共同摄影",
        "story": "FrameTrace 的价值不在于把旧照片贴到现实里，而是把机位、视线、构图和授权关系变成可行走、可对齐、可解释的体验。形成性问卷用于判断方向：公共机位复现更适合作为主流程，私人旧照回访更适合作为个人记忆支线。下一步验证会放在 Quest 3 中，观察用户寻找、行走、对齐时的完成时间、构图误差、疲劳和隐私顾虑。",
        "judgement": "MR 不只是叠加信息，而是让用户重新进入一个曾经发生过的空间关系。",
        "job_value": "适合作为人机交互、空间 UX、AI 硬件体验和概念验证能力的辅助项目。",
    },
    "fridge": {
        "title": "冰箱日期提示系统",
        "section": "CASE / PRODUCT SYSTEM",
        "category": "工业设计 / 食材管理系统",
        "hero": "/works/portfolio/6op.PNG",
        "one": "这个本科毕业设计把过期提醒前移到放入食材的一刻，让用户从存放开始就建立日期管理意识。",
        "opening": "食材过期常常不是因为用户不知道日期，而是日期信息没有在存放和取用时出现。系统用扫描、存放引导、灯光提示和手机联动，把“记住日期”这件事拆进日常动作。",
        "text_title": "把提醒前移到用户还来得及行动的时候",
        "story": "冰箱日期提示系统把手机、冰箱屏幕和内部灯光分工：手机负责远程提醒和料理计划，冰箱屏幕负责查看临期信息，内部灯光负责定位食材。它更像一个服务系统，而不是单个硬件造型。这个项目适合作为工业设计背景的证明：我不是只做界面，也能把产品、行为和硬件提示关系放在一起思考。",
        "judgement": "提醒不是越晚越强，而是越早进入用户动作越有效。",
        "job_value": "适合补充说明工业设计和产品系统能力，但不作为小米 AI/HMI 投递的第一主项目。",
        "detail": "/works/portfolio/6cn.PNG",
    },
}


PROFILES = [
    {
        "output": OUT_DIR / "kong-weipeng-portfolio-xiaomi-hmi-cn.pdf",
        "title": "面向自动驾驶 HMI 与体验产品的作品集",
        "hero": PROJECTS["hmi"]["hero"],
        "lead": "这版作品集只围绕一个问题展开：智能系统越强时，界面怎样继续保留人的注意力、判断和行动价值。",
        "chips": ["汽车 HMI", "体验产品", "用户研究"],
        "match": "对应汽车部体验产品经理实习，我会把重点放在 HMI 规范、体验走查、竞品分析、用户反馈和 UE/UI 需求沟通，而不是把项目包装成泛泛的设计展示。",
        "group_title": "项目组逻辑：先证明车内注意力，再补足 AI 判断与生活服务",
        "projects": ["hmi", "ai", "taste", "frametrace", "fridge"],
        "closing": "我最适合切入的是体验产品与 HMI 之间的位置：能看懂用户为什么分心或不理解，也能把这个问题翻译成界面层级、提示语气、原型任务和可以走查的设计细节。",
    },
    {
        "output": OUT_DIR / "kong-weipeng-portfolio-xiaomi-ai-innovation-cn.pdf",
        "title": "面向 AI 创新产品与场景定义的作品集",
        "hero": PROJECTS["ai"]["hero"],
        "lead": "这版作品集强调 AI 产品不是把能力堆给用户，而是找到普通人为什么需要它、怎样理解它、在哪一步还想保留自己的判断。",
        "chips": ["AI 产品", "场景定义", "产品叙事"],
        "match": "对应集团技术委员会 AI 创新产品实习，我会突出场景挖掘、产品 Brief、人话表达、竞品拆解和从日常需求做出原型的能力。",
        "group_title": "项目组逻辑：先讲 AI 共创，再讲生活场景怎样变成产品",
        "projects": ["ai", "taste", "frametrace", "hmi", "fridge"],
        "closing": "我能提供的不是单纯写论文式的分析，而是把复杂技术讲成普通人能懂的产品故事，并把它继续推进到交互原型、功能入口和验证任务。",
    },
    {
        "output": OUT_DIR / "kong-weipeng-portfolio-xiaomi-ai-vehicle-service-cn.pdf",
        "title": "面向车载语音与生活服务 AI 的作品集",
        "hero": PROJECTS["hmi"]["hero"],
        "lead": "这版作品集把车内体验看成移动中的生活服务：用户会分心、犹豫、想不起目标，产品需要帮他把需求说出来并完成下一步。",
        "chips": ["车载语音", "生活服务", "需求挖掘"],
        "match": "对应车载生活服务 AI 产品实习，我会突出语音/轻交互场景、用户需求挖掘、功能策划和从日常行为生成产品机会。",
        "group_title": "项目组逻辑：先看车内注意力，再看日常服务怎样被 AI 承接",
        "projects": ["hmi", "taste", "ai", "fridge", "frametrace"],
        "closing": "我适合做车载生活服务方向的原因，是我会从人真实的犹豫、分心和记忆断点切入，而不是直接堆功能。语音和 AI 的价值应该是帮用户更快说清需求、更少被打扰地完成行动。",
    },
]


ST = {
    "cover_name": ParagraphStyle("cover_name", fontName="BookSans", fontSize=31, leading=36, textColor=PAPER, alignment=TA_LEFT),
    "cover_title_light": ParagraphStyle("cover_title_light", fontName="BookSans", fontSize=19, leading=25, textColor=PAPER, alignment=TA_LEFT),
    "case_title_light": ParagraphStyle("case_title_light", fontName="BookSans", fontSize=24, leading=31, textColor=PAPER, alignment=TA_LEFT),
    "case_lead_light": ParagraphStyle("case_lead_light", fontName="BookSans", fontSize=11.2, leading=17, textColor=PAPER, alignment=TA_LEFT),
    "h1": ParagraphStyle("h1", fontName="BookSans", fontSize=22, leading=29, textColor=INK, alignment=TA_LEFT),
    "lead": ParagraphStyle("lead", fontName="BookSans", fontSize=13.2, leading=22, textColor=INK, alignment=TA_LEFT),
    "body_big": ParagraphStyle("body_big", fontName="BookSans", fontSize=11.7, leading=20, textColor=INK, alignment=TA_LEFT),
    "body": ParagraphStyle("body", fontName="BookSans", fontSize=10.4, leading=18, textColor=INK, alignment=TA_LEFT),
    "small": ParagraphStyle("small", fontName="BookSans", fontSize=8.3, leading=13, textColor=MUTED, alignment=TA_LEFT),
    "quote": ParagraphStyle("quote", fontName="BookSans", fontSize=13.5, leading=21, textColor=INK, alignment=TA_LEFT),
    "project_title": ParagraphStyle("project_title", fontName="BookSans", fontSize=14.5, leading=19, textColor=INK, alignment=TA_LEFT),
    "caption": ParagraphStyle("caption", fontName="BookSans", fontSize=7.7, leading=11, textColor=MUTED, alignment=TA_LEFT),
}


def build(profile):
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(profile["output"]), pagesize=A4, pageCompression=1)
    c.setTitle(profile["title"])
    c.setAuthor("KONG WEIPENG")

    page = 1
    cover(c, profile)
    c.showPage()
    page += 1

    standpoint(c, profile, page)
    c.showPage()
    page += 1

    project_group(c, profile, page)
    c.showPage()
    page += 1

    for key in profile["projects"]:
        project = PROJECTS[key]
        case_hero(c, project, page)
        c.showPage()
        page += 1
        if key == "ai":
            ai_structure(c, page)
        elif key == "hmi":
            hmi_structure(c, page)
        else:
            text_case(c, project, page)
        c.showPage()
        page += 1

    close(c, profile, page)
    c.save()
    print(profile["output"])


if __name__ == "__main__":
    register_fonts()
    for profile in PROFILES:
        build(profile)
