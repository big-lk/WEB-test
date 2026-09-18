from pathlib import Path

from PIL import Image
from reportlab.lib.pagesizes import landscape, A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
SCREENSHOT_DIR = ROOT / 'tmp' / 'pdfs' / 'web-screenshots'
OUTPUT_DIR = ROOT / 'output' / 'pdf'
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

PAGE_W, PAGE_H = landscape(A4)
MARGIN = 12
CONTENT_W = PAGE_W - MARGIN * 2
CONTENT_H = PAGE_H - MARGIN * 2

names = [
    'home',
    'resume',
    'works',
    'ai-co-creation',
    'driving-hmi',
    'frametrace',
    'taste-again',
    'fridge-timeline',
]


def make_pdf(name: str) -> Path:
    source_path = SCREENSHOT_DIR / f'{name}.png'
    output_path = OUTPUT_DIR / f'kong-weipeng-web-{name}-cn.pdf'

    with Image.open(source_path) as source:
        image = source.convert('RGB')
        source_w, source_h = image.size
        slice_h = max(1, int(source_w * CONTENT_H / CONTENT_W))
        overlap = 42
        top = 0
        pdf = canvas.Canvas(str(output_path), pagesize=landscape(A4), pageCompression=1)

        while top < source_h:
            bottom = min(source_h, top + slice_h)
            crop = image.crop((0, top, source_w, bottom))
            draw_w = CONTENT_W
            draw_h = draw_w * crop.height / crop.width
            pdf.drawInlineImage(crop, MARGIN, PAGE_H - MARGIN - draw_h, width=draw_w, height=draw_h)
            pdf.showPage()
            if bottom == source_h:
                break
            top = max(top + 1, bottom - overlap)

        pdf.save()
        image.close()

    return output_path


for page_name in names:
    output = make_pdf(page_name)
    print(output)

