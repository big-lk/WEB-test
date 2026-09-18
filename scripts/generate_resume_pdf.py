from shutil import copyfile
from pathlib import Path

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
PROFILE_SUMMARY = {
    "research": "感性工学与工业设计背景，结合用户主观评价、心率和眼动等生理与行为数据分析体验差异，为设计判断提供依据。",
    "technology": "从原理和使用场景分析新技术产品。使用 Codex 等 AI 工具搭建原型开发工作流，借助 AI 开发微信小程序，探索 VR/MR 在实验与日常场景中的应用。",
    "collaboration": "能向工程、产品、设计与内容人员解释技术原理和研究结果，将调研发现与用户反馈整理成交互流程和设计说明。",
}


def profile_summary(*priorities):
    return "<br/>".join(PROFILE_SUMMARY[key] for key in priorities)


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
    "target": ParagraphStyle(
        "target",
        parent=base["Heading2"],
        fontName="ResumeSans",
        fontSize=13.2,
        leading=17,
        textColor=INK,
        spaceAfter=5,
    ),
    "headerMeta": ParagraphStyle(
        "headerMeta",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=8.8,
        leading=12.5,
        textColor=MUTED,
        wordWrap="CJK",
    ),
    "utilityLabel": ParagraphStyle(
        "utilityLabel",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=7.2,
        leading=9,
        textColor=BRAND,
        spaceAfter=2,
    ),
    "utilityValue": ParagraphStyle(
        "utilityValue",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=8.5,
        leading=11.5,
        textColor=INK,
        wordWrap="CJK",
    ),
    "portfolioUrl": ParagraphStyle(
        "portfolioUrl",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=10,
        leading=13,
        textColor=INK,
        spaceAfter=2,
    ),
    "utilityNote": ParagraphStyle(
        "utilityNote",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=7.1,
        leading=9.2,
        textColor=MUTED,
        wordWrap="CJK",
    ),
    "body": ParagraphStyle(
        "body",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=9.4,
        leading=13.6,
        textColor=INK,
        wordWrap="CJK",
    ),
    "small": ParagraphStyle(
        "small",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=9,
        leading=12.3,
        spaceBefore=2,
        textColor=MUTED,
        wordWrap="CJK",
    ),
    "compact": ParagraphStyle(
        "compact",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=8.3,
        leading=11.1,
        textColor=MUTED,
        wordWrap="CJK",
    ),
    "section": ParagraphStyle(
        "section",
        parent=base["Heading2"],
        fontName="ResumeSans",
        fontSize=10.8,
        leading=13.2,
        textColor=BRAND,
        spaceBefore=5,
        spaceAfter=2,
    ),
    "projectTitle": ParagraphStyle(
        "projectTitle",
        parent=base["Heading3"],
        fontName="ResumeSans",
        fontSize=10.8,
        leading=13.2,
        textColor=INK,
        spaceAfter=2,
    ),
    "meta": ParagraphStyle(
        "meta",
        parent=base["BodyText"],
        fontName="ResumeSans",
        fontSize=7.5,
        leading=9.5,
        spaceBefore=2,
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
        "title": "维持路面关注与驾驶价值的智能驾驶 HMI",
        "meta": "智能驾驶 / HMI 概念 / 2025-2026",
        "desc": "情景：自动驾驶可能让驾驶者注意力下降，也削弱亲自驾驶的价值感；如果系统不说明正在关注什么，驾驶者甚至可能不知道道路上存在风险。",
        "feature": "方案：在符合法规与人因设计原则的前提下，只对可能造成威胁的车辆和突然进入道路的行人进行适度可视化，提升对路面与危险的专注和意识。",
        "validation": "验证：使用概念模拟示意图开展问卷调查，分析风险提示对理解、注意感受与驾驶意愿的影响。",
    },
    {
        "title": "引导个人判断参与的 AI 共创界面设计",
        "meta": "硕士研究 / AI 交互 / 2025-2026",
        "desc": "情景：用户想与 AI 共创有个人特色的作品，但“高级感”等模糊输入容易被按常见含义理解，遗漏个人的价值判断，让结果趋于普通。",
        "feature": "方案：在 AI 对模糊词的解释旁设置确认、调整按钮，引导用户判断“这是不是我的意思”，并补充自己对这个词的理解。",
        "validation": "验证：前期结合 AI 对话文本与用户主观评价，分析理解分歧及原因；后期计划比较界面方案，用眼动仪观察输入时关注的文本与提示区域。",
    },
    {
        "title": "好久没吃：个人饮食周期规划",
        "meta": "微信小程序 / 饮食周期 / 2025-2026",
        "desc": "情景：喜欢的味道有自己的周期，有些适合每周吃一次，也有人每天都想喝一杯。当用户想“吃点好久没吃的”时，很难立即判断吃什么、多久没吃，以及现在是否值得再吃。",
        "feature": "方案：以距上次食用的天数为基础，记录用户为不同食物设定的参考周期，形成个人饮食周期表，帮助判断哪些味道到了再次选择的时间。",
        "validation": "验证：前期通过 57 人形成性问卷开展概念调研；随后借助 AI 开发工具搭建真实可用的微信小程序，并完成上线。",
    },
    {
        "title": "FrameTrace：MR 场景摄影引导体验",
        "meta": "MR 眼镜 / 场景摄影 / 2025-2026",
        "desc": "情景：来到一个值得拍摄的场景，人们常在入口大致拍一张全景，很少继续寻找角度、构图和焦段，手机的影像能力与场景特点都没有被充分利用。",
        "feature": "方案：在 MR 中显示其他拍摄者的机位、镜头方向与姿势虚影，并串联为拍摄顺序；用户用手势框选画面，系统据此推荐镜头焦距。",
        "validation": "验证：前期使用概念模拟示意图收集 106 份问卷，排除高风险回答后的主分析为 N=82，用于分析第一印象、理解与使用顾虑；后续计划用 Quest 3 原型观察实际操作。",
    },
    {
        "title": "FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理",
        "meta": "大学毕业设计 / 概念设计 / 2022-2023",
        "desc": "情景：大学阶段关注家庭冰箱内物品的日期管理与快速找寻问题。食材放入后容易忘记保存时间和具体位置，查找时又需要反复翻动。",
        "feature": "方案：设计可磁吸移动的中央摄像与触控管理终端，配合冰箱外部灯条提示和内部区域灯光定位，统一记录物品日期并指明存放区域。",
        "validation": "方法：使用 Blender 构建产品生活场景示例图并制作视频模拟操作步骤，开展概念调研；最终制作带电控模拟系统的 1/4 冰箱模型，验证造型、灯光指引与操作流程。",
    },
]

GENERAL_RESUME = {
    "output": "output/pdf/kong-weipeng-resume-cn.pdf",
    "headline": "专业方向：人机交互与产品体验设计",
    "summary": profile_summary("research", "technology", "collaboration"),
    "keywords": ["用户研究", "AI 产品体验", "车载 HMI", "主观体验测试", "眼动追踪", "UI/UX 原型"],
    "methods": [
        "主观体验评价、心率与眼动数据分析。",
        "场景分析、交互流程与比较原型设计。",
        "Codex 原型开发工作流、微信小程序与 VR/MR 原型。",
        "将调研结果整理成交互流程和设计说明。",
    ],
    "projects": ["引导个人判断参与的 AI 共创界面设计", "FrameTrace：MR 场景摄影引导体验", "好久没吃：个人饮食周期规划"],
}


TARGET_RESUMES = [
    {
        "output": "output/pdf/kong-weipeng-resume-shenzhen-smart-hardware-cn.pdf",
        "headline": "专业方向：智能硬件与产品体验",
        "summary": profile_summary("research", "technology", "collaboration"),
        "keywords": ["智能硬件体验", "跨设备交互", "AI 产品体验", "用户研究", "交互原型", "概念验证"],
        "methods": [
            "分析实体产品在生活场景中的使用问题。",
            "设计设备、灯光与界面之间的协同反馈。",
            "使用 Blender、Figma 与电控模型模拟产品体验。",
            "结合问卷和主观评价验证产品概念。",
        ],
        "projects": ["FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理", "引导个人判断参与的 AI 共创界面设计", "FrameTrace：MR 场景摄影引导体验"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-shenzhen-automotive-hmi-cn.pdf",
        "headline": "专业方向：智能汽车 HMI 与产品体验",
        "summary": profile_summary("research", "collaboration", "technology"),
        "keywords": ["智能汽车 HMI", "驾驶场景", "注意维持", "风险表达", "交互原型", "体验验证"],
        "methods": [
            "分析自动驾驶场景中的信息需求与注意负担。",
            "设计风险提示的信息层级、强度与表达方式。",
            "使用概念模拟示意图呈现驾驶交互方案。",
            "结合问卷、主观评价和眼动方法验证概念。",
        ],
        "projects": ["维持路面关注与驾驶价值的智能驾驶 HMI", "引导个人判断参与的 AI 共创界面设计", "FrameTrace：MR 场景摄影引导体验"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-hmi-cn.pdf",
        "headline": "求职方向：体验产品经理 / 智能汽车 HMI",
        "summary": profile_summary("research", "collaboration", "technology"),
        "keywords": ["汽车 HMI", "场景分析", "信息层级", "交互原型", "主观体验评价", "用户反馈"],
        "methods": [
            "分析驾驶场景中的信息需求与注意负担。",
            "设计 HMI 信息层级、提示强度与交互原型。",
            "设计主观体验评价与眼动比较任务。",
            "用交互流程与界面说明解释设计取舍。",
        ],
        "projects": ["维持路面关注与驾驶价值的智能驾驶 HMI", "引导个人判断参与的 AI 共创界面设计", "好久没吃：个人饮食周期规划", "FrameTrace：MR 场景摄影引导体验", "FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-ai-innovation-cn.pdf",
        "headline": "求职方向：AI 产品经理",
        "summary": profile_summary("technology", "research", "collaboration"),
        "keywords": ["场景分析", "功能定义", "交互原型", "小程序开发", "用户研究", "产品文案"],
        "methods": [
            "从用户调研与日常行为分析使用场景。",
            "定义功能入口、交互流程与产品文案。",
            "借助 Codex 开发微信小程序与交互原型。",
            "用场景故事、交互流程和原型解释产品方案。",
        ],
        "projects": ["引导个人判断参与的 AI 共创界面设计", "好久没吃：个人饮食周期规划", "FrameTrace：MR 场景摄影引导体验", "维持路面关注与驾驶价值的智能驾驶 HMI", "FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理"],
    },
    {
        "output": "output/pdf/kong-weipeng-resume-xiaomi-ai-vehicle-service-cn.pdf",
        "headline": "求职方向：产品经理 / AI 与智能硬件",
        "summary": profile_summary("collaboration", "technology", "research"),
        "keywords": ["生活服务场景", "功能定义", "交互设计", "用户研究", "小程序开发", "AI 交互"],
        "methods": [
            "分析生活服务场景中的需求与注意限制。",
            "设计场景入口、反馈文案和后续操作。",
            "借助 AI 开发微信小程序，以情境模拟检查流程。",
            "分析 AI 对用户输入的理解，引导用户补充个人判断。",
        ],
        "projects": ["维持路面关注与驾驶价值的智能驾驶 HMI", "好久没吃：个人饮食周期规划", "引导个人判断参与的 AI 共创界面设计", "FRIDGE TIMELINE SYSTEM：冰箱物品日期与位置管理", "FrameTrace：MR 场景摄影引导体验"],
    },
]


def draw_fair_page(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE_YELLOW)
    canvas.line(14 * mm, 12 * mm, 196 * mm, 12 * mm)
    canvas.setFont("ResumeSans", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(14 * mm, 8 * mm, "孔维鹏 · 求职简历")
    canvas.drawRightString(196 * mm, 8 * mm, "PORTFOLIO  lkdesigner.top")
    canvas.restoreState()


def project_line(text):
    label, detail = text.split("：", 1)
    return p(f'<font color="#B57900"><b>{label}</b></font>  {detail}', STYLES["small"])


def build_target_resume(profile):
    by_title = {project["title"]: project for project in projects}
    width = 182 * mm
    header_label, target_role = profile["headline"].split("：", 1)
    contact = [
        p("CONTACT  联系方式", STYLES["utilityLabel"]),
        p("手机 / 微信（同号）  +86 18475264028", STYLES["utilityValue"]),
        p("littlekeen@outlook.com", STYLES["utilityValue"]),
    ]
    portfolio_text = [
        p("PORTFOLIO  作品集", STYLES["utilityLabel"]),
        p('<link href="https://lkdesigner.top"><b>lkdesigner.top</b></link>', STYLES["portfolioUrl"]),
        p("扫码查看完整项目与过程", STYLES["utilityNote"]),
    ]
    portfolio = Table([[portfolio_text, QRFlowable(PORTFOLIO_URL, 17 * mm)]], colWidths=[37 * mm, 18 * mm])
    portfolio.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    utility = Table([[contact], [portfolio]], colWidths=[59 * mm])
    utility.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SOFT_YELLOW),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, LINE_YELLOW),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    header = Table([[
        [
            p("孔维鹏", STYLES["name"]),
            p(header_label, STYLES["utilityLabel"]),
            p(target_role, STYLES["target"]),
            p("硕士研究生在读（日本） · 预计 2027.04 毕业", STYLES["headerMeta"]),
        ],
        utility,
    ]], colWidths=[119 * mm, 63 * mm])
    header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (0, 0), 0),
        ("RIGHTPADDING", (0, 0), (0, 0), 8),
        ("LEFTPADDING", (1, 0), (1, 0), 4),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    summary = Table([[
        p("个人简介", STYLES["section"]),
        p(profile["summary"], STYLES["body"]),
    ]], colWidths=[25 * mm, 157 * mm])
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("LINEBEFORE", (0, 0), (0, 0), 2.2, BRAND),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, 0), 6),
        ("RIGHTPADDING", (0, 0), (0, 0), 4),
        ("LEFTPADDING", (1, 0), (1, 0), 5),
        ("RIGHTPADDING", (1, 0), (1, 0), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    target_story = [
        header,
        Spacer(1, 2 * mm),
        summary,
    ]

    left = [
        p("教育经历", STYLES["section"]),
        p("<b>札幌市立大学（日本）</b>", STYLES["small"]),
        p("人间情报设计（人机交互 HCI 方向）", STYLES["small"]),
        p("硕士研究生在读 · 2025.04 - 预计 2027.04", STYLES["small"]),
        Spacer(1, 1.5 * mm),
        p("<b>哈尔滨理工大学</b>", STYLES["small"]),
        p("工业设计（工科） · 本科 · 2023.07 毕业", STYLES["small"]),
        p("语言与工具", STYLES["section"]),
        p("日语 JLPT N1", STYLES["small"]),
        p("Figma / Photoshop / Illustrator / Blender / After Effects / Codex", STYLES["small"]),
        p("奖项", STYLES["section"]),
        p("日本札幌市路面电车新车设计方案征集", STYLES["small"]),
        p("<b>二等奖</b> · 2025.12", STYLES["small"]),
    ]
    right = [
        p("能力与方法", STYLES["section"]),
        p(" / ".join(profile["keywords"]), STYLES["small"]),
        *[bullet(item) for item in profile["methods"]],
        p("校地合作 · AI 调研工作流", STYLES["section"]),
        p("<b>日本札幌市交通振兴局广告价值提升项目</b>：针对新旧电车并行与现代车辆广告限制，提出同一企业“过去 / 未来”双车联动广告。使用 Codex 建立可复现工作流，批量整理企业历史、未来形象与标志特征，制作符合车身广告限制的定制案例，并面向广告主开展概念调查。", STYLES["small"]),
    ]
    intro = Table([[left, right]], colWidths=[64 * mm, 118 * mm])
    intro.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (1, 0), (1, 0), 12),
        ("RIGHTPADDING", (0, 0), (0, 0), 12),
        ("RIGHTPADDING", (1, 0), (1, 0), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LINEBEFORE", (1, 0), (1, 0), 0.5, LINE_YELLOW),
    ]))
    target_story.extend([Spacer(1, 1.5 * mm), intro, p("代表项目", STYLES["section"])])
    for title in profile["projects"][:3]:
        project = by_title[title]
        block = [
            p(project["title"], STYLES["projectTitle"]),
            p(project["meta"], STYLES["meta"]),
            project_line(project["desc"]),
            project_line(project["feature"]),
            project_line(project["validation"]),
        ]
        card = Table([[block]], colWidths=[width])
        card.setStyle(TableStyle([
            ("LINEABOVE", (0, 0), (-1, 0), 0.4, LINE_YELLOW),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
        ]))
        target_story.append(KeepTogether([card]))

    target_doc = SimpleDocTemplate(
        profile["output"], pagesize=A4,
        rightMargin=14 * mm, leftMargin=14 * mm,
        topMargin=12 * mm, bottomMargin=17 * mm,
        title=f"孔维鹏 - {profile['headline']}", author="孔维鹏",
    )
    target_doc.build(target_story, onFirstPage=draw_fair_page, onLaterPages=draw_fair_page)
    download_dir = Path("public/resume")
    download_dir.mkdir(parents=True, exist_ok=True)
    copyfile(profile["output"], download_dir / Path(profile["output"]).name)
    print(profile["output"])


build_target_resume(GENERAL_RESUME)
copyfile(GENERAL_RESUME["output"], OUTPUT)
print(OUTPUT)
for target in TARGET_RESUMES:
    build_target_resume(target)
