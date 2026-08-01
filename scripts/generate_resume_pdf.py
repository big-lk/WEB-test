from reportlab.graphics import renderPDF
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = "output/pdf/kong-weipeng-resume-xiaomi-cn.pdf"
FONT = "/Library/Fonts/Arial Unicode.ttf"
PORTFOLIO_URL = "https://lkdesigner.top"


def register_fonts():
    pdfmetrics.registerFont(TTFont("ResumeSans", FONT))


class QRFlowable(Flowable):
    def __init__(self, value, size=23 * mm):
        super().__init__()
        self.value = value
        self.width = size
        self.height = size

    def draw(self):
        qr = QrCodeWidget(self.value)
        bounds = qr.getBounds()
        width = bounds[2] - bounds[0]
        height = bounds[3] - bounds[1]
        drawing = Drawing(self.width, self.height, transform=[self.width / width, 0, 0, self.height / height, 0, 0])
        drawing.add(qr)
        renderPDF.draw(drawing, self.canv, 0, 0)


def p(text, style):
    return Paragraph(text, style)


def section(title, body):
    return [p(title, STYLES["section"]), Spacer(1, 2.5 * mm), *body]


def label_value(label, value):
    return p(f"<b>{label}</b> {value}", STYLES["small"])


def bullet(text):
    return p(f"- {text}", STYLES["small"])


def pill_table(items, columns=3, col_width=48 * mm):
    rows = []
    for index in range(0, len(items), columns):
        row = [p(item, STYLES["pill"]) for item in items[index : index + columns]]
        row += [""] * (columns - len(row))
        rows.append(row)

    table = Table(rows, colWidths=[col_width] * columns, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "ResumeSans"),
                ("FONTSIZE", (0, 0), (-1, -1), 8.4),
                ("TEXTCOLOR", (0, 0), (-1, -1), INK),
                ("BACKGROUND", (0, 0), (-1, -1), SOFT_YELLOW),
                ("BOX", (0, 0), (-1, -1), 0.4, LINE_YELLOW),
                ("INNERGRID", (0, 0), (-1, -1), 2.0, colors.white),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    return table


def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE_YELLOW)
    canvas.setLineWidth(0.7)
    canvas.line(18 * mm, 16 * mm, 192 * mm, 16 * mm)
    canvas.setFont("ResumeSans", 7.4)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 10 * mm, "KONG WEIPENG / 孔维鹏 - Enterprise Resume")
    canvas.drawRightString(192 * mm, 10 * mm, f"Page {doc.page}")
    canvas.restoreState()


INK = colors.HexColor("#171717")
MUTED = colors.HexColor("#555555")
BRAND = colors.HexColor("#B57900")
SOFT_YELLOW = colors.HexColor("#FFF4CF")
PAPER = colors.HexColor("#FFFAF0")
LINE_YELLOW = colors.HexColor("#E7BC43")

register_fonts()

base = getSampleStyleSheet()
STYLES = {
    "name": ParagraphStyle(
        "name",
        parent=base["Title"],
        fontName="ResumeSans",
        fontSize=25,
        leading=29,
        textColor=INK,
        spaceAfter=3,
        alignment=TA_LEFT,
    ),
    "headline": ParagraphStyle(
        "headline",
        parent=base["Normal"],
        fontName="ResumeSans",
        fontSize=10.3,
        leading=14,
        textColor=BRAND,
        spaceAfter=7,
    ),
    "body": ParagraphStyle(
        "body",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=8.8,
        leading=13.5,
        textColor=INK,
        wordWrap="CJK",
    ),
    "small": ParagraphStyle(
        "small",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=8.05,
        leading=12.2,
        textColor=MUTED,
        wordWrap="CJK",
    ),
    "section": ParagraphStyle(
        "section",
        parent=base["Heading2"],
        fontName="ResumeSans",
        fontSize=11.5,
        leading=14,
        textColor=INK,
        spaceBefore=5,
        spaceAfter=1,
    ),
    "projectTitle": ParagraphStyle(
        "projectTitle",
        parent=base["Heading3"],
        fontName="ResumeSans",
        fontSize=10.5,
        leading=13,
        textColor=INK,
        spaceAfter=2,
    ),
    "meta": ParagraphStyle(
        "meta",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=7.5,
        leading=9.5,
        textColor=BRAND,
        wordWrap="CJK",
    ),
    "pill": ParagraphStyle(
        "pill",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=7.9,
        leading=10.5,
        textColor=INK,
        alignment=TA_LEFT,
    ),
}


projects = [
    {
        "title": "人-AI 分担共创界面",
        "meta": "毕业设计 / AI 产品体验 / Human-AI Interaction",
        "desc": "把共创过程拆成 AI 代行、AI 商谈和用户决定三种状态，让用户看见自己在哪一步还需要参与判断。",
        "role": "交互概念、UI 架构、比较任务与验证流程",
        "methods": "聊天调查、故事流程模拟、比较 UI、眼动追踪",
        "value": "当前重点不是解释 AI 有多强，而是比较不同提示是否改变用户的视线分配和最终选择。",
    },
    {
        "title": "智驾注意力 AR-HUD",
        "meta": "汽车 HMI / 智驾注意力 / 2025-2026",
        "desc": "把智驾系统正在关注的风险位置、原因和紧急程度表达出来，避免界面只堆叠速度、距离和状态信息。",
        "role": "HMI 研究、注意力设计、安全边界与感性评价计划",
        "methods": "场景设计、AR-HUD 概念、人因工程梳理、感性评价设计",
        "value": "先界定哪些信息可能帮助驾驶者理解系统关注点，后续用视频刺激比较提示强度和分心风险。",
    },
    {
        "title": "日语试读辅助界面",
        "meta": "学习 UX / AI 陪伴 / 2025-2026",
        "desc": "从学习者自己的文稿出发，在试读卡顿时给出分级帮助，而不是一开始就替用户改完整段。",
        "role": "学习体验、适当支援模型、UI 叙事",
        "methods": "试读流程、卡顿支援、成长痕迹地图、反馈界面",
        "value": "控制 AI 介入的时机，把卡顿从失败感转成可继续练习和回看的线索。",
    },
    {
        "title": "FrameTrace 跨时间摄影引导",
        "meta": "MR 眼镜 / 跨时间摄影 / 2025-2026",
        "desc": "通过 MR 眼镜提示过去照片的机位、方向和构图关系，让用户在真实地点重新完成拍摄。",
        "role": "MR 交互、手势构图、空间记忆系统",
        "methods": "手势场景、空间 UX、服务蓝图",
        "value": "106 份形成性问卷用于确定下一版优先级；公共机位复现、隐私解释和行走安全仍需行为验证。",
    },
    {
        "title": "好久没吃 微信小程序",
        "meta": "微信小程序 / 饮食记忆提醒 / 2025-2026",
        "desc": "记录吃过什么和当时感觉，在“好久没吃了”的时刻用个人饮食记忆提示旧味道。",
        "role": "产品概念、饮食记忆模型、移动端 UX",
        "methods": "决策旅程、时间轴模型、提醒设计",
        "value": "首页先问感觉，再从个人记录里给出少量候选；当前 MVP 已完成核心流程，下一步看是否带来再吃行为。",
    },
    {
        "title": "冰箱日期提示系统",
        "meta": "产品系统 / 食材管理 / 2023",
        "desc": "把食材放入、保存、提醒和料理计划连成一套流程，让用户在放进去的时候就开始管理日期。",
        "role": "产品服务系统、硬件交互、行为设计",
        "methods": "用户旅程、硬件场景、灯光引导交互",
        "value": "手机 UI、冰箱屏幕和内部灯光分别承担远程提醒、查看和定位；硬件实现仍需要进一步工程验证。",
    },
]

story = []

header = Table(
    [
        [
            [
                p("孔维鹏", STYLES["name"]),
                p("求职方向：用户研究 / AI 产品体验 / 车载 HMI 实习", STYLES["headline"]),
                p(
                    "工业设计与人间情报设计背景。做项目时会先看用户在哪一刻犹豫、分心、忘记或没把握，再把问题转成界面结构、原型任务和可比较的设计判断。关注 AI 产品体验、车载 HMI、学习与日常行为系统。",
                    STYLES["body"],
                ),
            ],
            [
                p("<b>地点</b> 日本札幌 / 意向中国大陆", STYLES["small"]),
                p("<b>邮箱</b> littlekeen@outlook.com", STYLES["small"]),
                p("<b>网站</b> lkdesigner.top", STYLES["small"]),
                Spacer(1, 2 * mm),
                QRFlowable(PORTFOLIO_URL, 22 * mm),
                p("扫码查看详细作品集", STYLES["small"]),
            ],
        ]
    ],
    colWidths=[119 * mm, 47 * mm],
)
header.setStyle(
    TableStyle(
        [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("BACKGROUND", (0, 0), (-1, -1), PAPER),
            ("BOX", (0, 0), (-1, -1), 0.65, LINE_YELLOW),
            ("LEFTPADDING", (0, 0), (-1, -1), 10),
            ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ("TOPPADDING", (0, 0), (-1, -1), 9),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ]
    )
)
story += [header, Spacer(1, 5.5 * mm)]

left = []
left += section(
    "教育经历",
    [
        p("<b>札幌市立大学</b> · 人间情报设计专业", STYLES["body"]),
        p("修士前期课程（相当于研究生）· 2025.04 入学 - 预计 2027.04 毕业", STYLES["small"]),
        p("<b>哈尔滨理工大学</b> · 工业设计系", STYLES["body"]),
        p("大学本科 · 2023.07 毕业", STYLES["small"]),
    ],
)
left += [Spacer(1, 3 * mm)]
left += section(
    "时间与语言",
    [
        bullet("实习时间：预计 2026 年 9-10 月可全时间投入。"),
        bullet("入职时间：可考虑 2027 年 5 月后。"),
        bullet("日语：JLPT N1，可进行日常沟通与设计讨论。"),
        bullet("求职地：以中国大陆岗位为主，可接受北京/南京等岗位所在地实习。"),
    ],
)
left += [Spacer(1, 3 * mm)]
left += section(
    "工具能力",
    [
        pill_table(["Figma", "Photoshop", "Illustrator", "Blender", "After Effects"], columns=2, col_width=38 * mm),
        Spacer(1, 2 * mm),
        p("工具主要服务于 UX 实验模拟、概念原型、视频刺激和体验验证，并非单纯的软件执行岗定位。", STYLES["small"]),
    ],
)

right = []
right += section(
    "岗位匹配关键词",
    [
        pill_table(
            [
                "用户研究",
                "AI 产品体验",
                "车载 HMI",
                "感性评价",
                "眼动追踪",
                "UI/UX 原型",
            ],
            columns=2,
            col_width=42 * mm,
        )
    ],
)
right += [Spacer(1, 3 * mm)]
right += section(
    "方法优势",
    [
        bullet("用感性评价理解主观体验，并把它转化为可比较的界面版本。"),
        bullet("先拆清用户卡在哪一步，再决定提示、记录、解释或让用户自己判断。"),
        bullet("结合眼动追踪、选择任务与比较 UI，让注意路径和判断过程成为设计依据。"),
        bullet("能把用户行为、系统逻辑和商业/产品目标整理成可沟通的设计方案。"),
    ],
)
right += [Spacer(1, 3 * mm)]
right += section(
    "奖项与外部协作",
    [
        bullet("札幌市路面电车新电车设计方案征集奖。"),
        bullet("札幌市交通振兴局地域连携广告振兴项目。"),
    ],
)

intro = Table([[left, right]], colWidths=[78 * mm, 86 * mm])
intro.setStyle(
    TableStyle(
        [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]
    )
)
story += [intro, Spacer(1, 5 * mm)]

story += [p("代表项目", STYLES["section"]), Spacer(1, 2 * mm)]

for project in projects:
    block = [
        p(project["meta"], STYLES["meta"]),
        p(project["title"], STYLES["projectTitle"]),
        p(project["desc"], STYLES["small"]),
        label_value("负责内容", project["role"]),
        label_value("方法", project["methods"]),
        label_value("形成的判断", project["value"]),
    ]
    card = Table([[block]], colWidths=[166 * mm])
    card.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BACKGROUND", (0, 0), (-1, -1), colors.white),
                ("LINEABOVE", (0, 0), (-1, 0), 0.55, LINE_YELLOW),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 4.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
            ]
        )
    )
    story += [KeepTogether([card]), Spacer(1, 2.2 * mm)]


doc = SimpleDocTemplate(
    OUTPUT,
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=17 * mm,
    bottomMargin=20 * mm,
    title="KONG WEIPENG Enterprise Resume",
    author="KONG WEIPENG",
)

doc.build(story, onFirstPage=draw_page, onLaterPages=draw_page)
print(OUTPUT)
