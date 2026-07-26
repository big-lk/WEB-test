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
        "title": "共创特化 AI 训练界面",
        "meta": "毕业设计 / AI 产品体验 / Human-AI Interaction",
        "desc": "通过显性 UI 让用户的意图、修正和判断进入 AI 训练过程，形成可解释、可控的共创训练逻辑。",
        "role": "交互概念、UI 架构、训练数据流程、用户主导权映射",
        "methods": "AI 工作流设计、界面原型、眼动追踪、UI 判断选择实验",
        "value": "用眼动与选择判断补充感性评价，观察人的注意路径和感觉增益，适配 AI 产品、体验产品经理与用户研究方向。",
    },
    {
        "title": "智能驾驶防黑箱 AR-HUD",
        "meta": "汽车 HMI / 自动驾驶解释界面 / 2025-2026",
        "desc": "面向自动驾驶接管与信任建立，构建 AR-HUD 信息层级，显示车辆关系、不确定性与 AI 驾驶意图。",
        "role": "HMI 研究、安全边界、感性评价计划、视频刺激方案",
        "methods": "场景设计、AR-HUD 概念、人因工程梳理、感性评价设计",
        "value": "把信任、注意力、接管安全和法规边界放在同一个 HMI 设计叙事里，适配汽车/自动驾驶产品岗位。",
    },
    {
        "title": "有回声的日语练习",
        "meta": "学习 UX / AI 陪伴 / 2025-2026",
        "desc": "一个把停顿、重读、犹豫和进步保存为成长证据的日语学习 App。",
        "role": "学习体验、反馈模型、UI 叙事",
        "methods": "练习流程、成长痕迹地图、反馈界面",
        "value": "将 AI 反馈从即时纠错转向学习证据呈现，可迁移到用户成长、可穿戴健康和长期行为追踪场景。",
    },
    {
        "title": "FrameTrace",
        "meta": "AR 眼镜 / 旅游摄影 / 2025-2026",
        "desc": "用双手取景框触发 AR 构图指导，推荐焦距、站位、角度和人物姿势的旅游摄影系统。",
        "role": "AR 交互、手势构图、空间记忆系统",
        "methods": "手势场景、空间 UX、服务蓝图",
        "value": "把摄影经验转译为现场空间指导，适配影像产品、可穿戴设备和空间交互方向。",
    },
    {
        "title": "料理再会",
        "meta": "料理记忆 / 计划 App / 2025-2026",
        "desc": "帮助用户在合适时间重新想起过去喜欢料理的饮食记忆 App。",
        "role": "产品概念、料理记忆模型、移动端 UX",
        "methods": "决策旅程、时间轴模型、提醒设计",
        "value": "减少每天选择吃什么的压力，建立个人料理记忆数据库，适配长期行为追踪和推荐体验方向。",
    },
    {
        "title": "Fridge Timeline System",
        "meta": "产品系统 / 食材管理 / 2023",
        "desc": "通过扫描、存放引导和灯光提示，让冰箱里的食材位置与期限都被看见的系统。",
        "role": "产品服务系统、硬件交互、行为设计",
        "methods": "用户旅程、硬件场景、灯光引导交互",
        "value": "把冰箱从储物空间转化为食材时间管理界面，体现硬件、UI 和日常行为系统的整合能力。",
    },
]

story = []

header = Table(
    [
        [
            [
                p("孔维鹏", STYLES["name"]),
                p("求职方向：体验产品 / 用户研究 / AI 产品体验 / 车载 HMI / UIUX 实习", STYLES["headline"]),
                p(
                    "工业设计与人机交互背景，研究方向集中在 AI 界面、HMI、感性评价与眼动等行为数据结合的体验验证。擅长从用户场景、界面原型、实验模拟到设计判断，推进概念是否有效的验证。",
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
        p("<b>哈尔滨理工大学</b> · 工业设计", STYLES["body"]),
        p("大学本科 · 2023.07 毕业", STYLES["small"]),
    ],
)
left += [Spacer(1, 3 * mm)]
left += section(
    "时间与语言",
    [
        bullet("实习时间：预计 2026 年 9-10 月可全时间投入。"),
        bullet("入职时间：可考虑 2027 年 5 月后。"),
        bullet("日语：JLPT N1，正常沟通水平。"),
        bullet("求职地：以中国大陆岗位为主，暂无留日实习计划。"),
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
                "体验产品经理",
                "用户研究",
                "AI 产品",
                "UI 设计",
                "影像产品",
                "汽车 HMI",
                "自动驾驶",
                "可穿戴体验",
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
        bullet("用感性评价理解主观体验，但不止停留在形容词层面。"),
        bullet("结合眼动追踪、选择任务与 UI 原型，让注意路径和判断过程成为设计依据。"),
        bullet("通过视频刺激、界面板和 UX 实验模拟验证 AI/HMI 概念是否有效。"),
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
        label_value("岗位价值", project["value"]),
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
