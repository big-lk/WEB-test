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
        "title": "驾驶关注价值界面",
        "meta": "智能驾驶 / 关注价值 HMI / 2025-2026",
        "desc": "智驾越稳定，人越容易把驾驶交出去；界面不堆行车参数，而是明示 AI 正在关注哪些可能造成问题的对象。",
        "feature": "特点：用表情和短句提示小朋友可能闯出、旁车可能靠近等高危情境，按危险程度控制提示强度。",
    },
    {
        "title": "个人判断价值提升界面",
        "meta": "毕业设计 / AI 产品体验 / Human-AI Interaction",
        "desc": "AI 共创的问题不只是回答质量，而是用户的判断很容易被输出结果盖过去；界面先让用户判断这一步谁负责，再让 AI 调整回答。",
        "feature": "特点：把 AI 代行、AI 商谈、用户决定变成显性分担行为，并通过确认与再调整沉淀个人判断偏好。",
    },
    {
        "title": "好久没吃",
        "meta": "微信小程序 / 饮食记忆 / 2025-2026",
        "desc": "吃什么不总是搜索问题；很多时候只是突然想起那一碗好久没吃了。",
        "feature": "特点：从个人饮食周期、味道线索和再会提醒进入选择，而不是把用户推向更大的推荐列表。",
    },
    {
        "title": "FrameTrace",
        "meta": "MR 眼镜 / 跨时间摄影 / 2025-2026",
        "desc": "看到一张经典照片时，人会想知道它当时站在哪里、用什么角度拍出来；FrameTrace 把这个问题变成可行走、可对齐的摄影体验。",
        "feature": "特点：用机位、焦距、构图和拍摄姿态提示，让用户像和另一个时间的人在同一机位共拍。",
    },
    {
        "title": "FRIDGE TIMELINE SYSTEM",
        "meta": "大学毕业设计 / 食材日期管理 / 2023",
        "desc": "让临期食材被看见、被注意，而不是在冰箱深处慢慢被忘掉。",
        "feature": "特点：通过临期可见、灯光注意触发和手机联动，把日期管理习惯拆进日常开门和取用动作。",
    },
]

story = []

header = Table(
    [
        [
            [
                p("孔维鹏", STYLES["name"]),
                p("求职方向：用户研究 / AI 产品体验实习", STYLES["headline"]),
                p(
                    "工业设计与人间情报设计背景。做项目时会先看用户在哪一刻犹豫、分心、忘记或没把握，再把问题转成界面结构、原型任务和可比较的设计结论。关注 AI 产品体验、用户研究、学习与日常行为系统。",
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
        bullet("实习时间：2026.09-2026.11 可全职实习，预计约 3 个月。"),
        bullet("正式入职：修士前期课程毕业后，可考虑 2027.05 以后入职。"),
        bullet("日语：JLPT N1，可进行日常沟通与设计讨论。"),
        bullet("求职地：以中国大陆岗位为主，可接受北京/南京等岗位所在地实习。"),
    ],
)
left += [Spacer(1, 3 * mm)]
left += section(
    "工具能力",
    [
        pill_table(["Figma", "Photoshop", "Illustrator", "Blender", "After Effects"], columns=2, col_width=38 * mm),
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
                "主观体验测试",
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
    "研究与设计方法",
    [
        bullet("用用户主观体验测试理解感受差异，并把它转化为可比较的界面版本。"),
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
        p(project["feature"], STYLES["small"]),
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


TARGET_RESUMES = [
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-hmi-cn.pdf",
        "headline": "求职方向：体验产品经理实习生 / 自动驾驶 HMI",
        "summary": "工业设计与人间情报设计背景。关注智驾越稳定时，人如何继续参与路面判断，能把竞品体验、用户反馈和 HMI 细节转成可沟通的交互原型与产品需求。",
        "keywords": ["汽车 HMI", "体验走查", "竞品分析", "用户反馈", "交互原型", "可用性测试"],
        "methods": [
            "拆解驾驶场景中的注意力、信任和接管前信息需求。",
            "把体验问题转成 HMI 信息层级、提示强度和 UE/UI 可执行需求。",
            "用用户主观体验测试、比较 UI 和眼动任务辅助判断界面取舍。",
            "能以产品视角说明设计细节为什么影响理解、分心或行动。",
        ],
        "projects": ["驾驶关注价值界面", "个人判断价值提升界面", "好久没吃", "FrameTrace", "FRIDGE TIMELINE SYSTEM"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-ai-innovation-cn.pdf",
        "headline": "求职方向：AI 创新产品实习生 / 场景定义与产品叙事",
        "summary": "关注 AI 技术进入真实生活时，用户为什么需要它、怎样理解它、在哪一步还想保留自己的判断。能把复杂功能说成人话，并把场景、交互和故事整理成产品 Brief。",
        "keywords": ["AI 产品体验", "场景挖掘", "产品 Brief", "用户画像", "竞品拆解", "内容脚本"],
        "methods": [
            "从用户评论、日常行为和使用卡点中提炼真实场景，而不是先套功能。",
            "把 AI 能力翻译成普通人能理解的使用理由、界面提示和产品文案。",
            "用 Figma、Blender、After Effects 和 AI 工具快速做可沟通原型。",
            "能说明一个新产品好在哪、差在哪，以及我会怎样调整入口和反馈。",
        ],
        "projects": ["个人判断价值提升界面", "好久没吃", "FrameTrace", "驾驶关注价值界面", "FRIDGE TIMELINE SYSTEM"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-ai-vehicle-service-cn.pdf",
        "headline": "求职方向：AI 产品实习生 / 车载语音与生活服务",
        "summary": "把车内体验理解为移动中的生活服务场景：用户会分心、犹豫、想不起目的，也可能过度依赖系统。我的项目更关注语音/轻交互怎样帮助用户说清需求，并用最少信息完成下一步。",
        "keywords": ["车载生活服务", "语音交互", "需求挖掘", "功能策划", "交互设计", "AI 场景"],
        "methods": [
            "从车内注意力、即时需求和生活习惯切入功能策划。",
            "把用户说不清的需求拆成场景入口、反馈语气和可继续的行动。",
            "用小程序 MVP、比较 UI 和情境模拟验证产品概念是否容易理解。",
            "关注 AI 介入时机：什么时候代行、什么时候商谈、什么时候交回用户决定。",
        ],
        "projects": ["驾驶关注价值界面", "好久没吃", "个人判断价值提升界面", "FRIDGE TIMELINE SYSTEM", "FrameTrace"],
    },
]


def build_target_resume(profile):
    by_title = {project["title"]: project for project in projects}
    target_story = []
    header = Table(
        [
            [
                [
                    p("孔维鹏", STYLES["name"]),
                    p(profile["headline"], STYLES["headline"]),
                    p(profile["summary"], STYLES["body"]),
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
    target_story += [header, Spacer(1, 5.5 * mm)]

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
            bullet("实习时间：2026.09-2026.11 可全职实习，预计约 3 个月。"),
            bullet("正式入职：修士前期课程毕业后，可考虑 2027.05 以后入职。"),
            bullet("日语：JLPT N1，可进行日常沟通与设计讨论。"),
            bullet("求职地：以中国大陆岗位为主，可接受北京等岗位所在地实习。"),
        ],
    )
    left += [Spacer(1, 3 * mm)]
    left += section("工具能力", [pill_table(["Figma", "Photoshop", "Illustrator", "Blender", "After Effects", "AI 工具辅助原型"], columns=2, col_width=38 * mm)])

    right = []
    right += section("岗位匹配关键词", [pill_table(profile["keywords"], columns=2, col_width=42 * mm)])
    right += [Spacer(1, 3 * mm)]
    right += section("研究与设计方法", [bullet(item) for item in profile["methods"]])
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
    target_story += [intro, Spacer(1, 5 * mm), p("代表项目", STYLES["section"]), Spacer(1, 2 * mm)]

    for title in profile["projects"]:
        project = by_title[title]
        block = [
            p(project["meta"], STYLES["meta"]),
            p(project["title"], STYLES["projectTitle"]),
            p(project["desc"], STYLES["small"]),
            p(project["feature"], STYLES["small"]),
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
        target_story += [KeepTogether([card]), Spacer(1, 2.2 * mm)]

    target_doc = SimpleDocTemplate(
        profile["output"],
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=17 * mm,
        bottomMargin=20 * mm,
        title=f"KONG WEIPENG Resume - {profile['headline']}",
        author="KONG WEIPENG",
    )
    target_doc.build(target_story, onFirstPage=draw_page, onLaterPages=draw_page)
    print(profile["output"])


for target in TARGET_RESUMES:
    build_target_resume(target)
