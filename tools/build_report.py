"""Rebuild the Assignment 1 design note and schematic wireframes."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'submission'
WIRES = ROOT / 'docs' / 'wireframes'
OUT.mkdir(exist_ok=True)
WIRES.mkdir(parents=True, exist_ok=True)
FONT = Path('C:/Windows/Fonts')

def font(size, bold=False):
    return ImageFont.truetype(str(FONT / ('arialbd.ttf' if bold else 'arial.ttf')), size)

def text(draw, xy, value, size=22, bold=False, color='#222722'):
    draw.text(xy, value, font=font(size, bold), fill=color)

def pill(draw, xy, label, size=16, fill=None, outline='#d2cfc7', text_color='#0b0b0c', bold=True):
    draw.rounded_rectangle(xy, radius=(xy[3] - xy[1]) // 2, fill=fill, outline=outline, width=2)
    text(draw, (xy[0] + 16, xy[1] + max(4, (xy[3] - xy[1] - size) // 2 - 2)), label, size, bold, text_color)


def wire_card(draw, x, y, w, h, title, kind_pill='', media='Photo / Art', meta='Category · Age', foot='PKR amount'):
    draw.rounded_rectangle((x, y, x + w, y + h), radius=14, fill='#ffffff', outline='#dedad2', width=2)
    pad = 12
    mw = w - pad * 2
    if media:
        mh = max(84, int(h * 0.44))
        fill = '#16233b' if kind_pill == 'SERVICES' else '#efede7'
        fg = '#ffffff' if kind_pill == 'SERVICES' else '#6f6e68'
        draw.rounded_rectangle((x + pad, y + pad, x + w - pad, y + pad + mh), radius=10, fill=fill, outline='#d8d4cc', width=1)
        text(draw, (x + pad + 14, y + pad + mh // 2 - 10), media, 16, True, fg)
        if kind_pill:
            pill(draw, (x + pad + 10, y + pad + 10, x + pad + 105, y + pad + 34), kind_pill, 12, '#2a3750', '#607090', '#ffffff')
        cy = y + pad + mh + 12
    else:
        cy = y + pad + 6
    text(draw, (x + pad + 4, cy), meta, 14, False, '#6f6e68')
    text(draw, (x + pad + 4, cy + 22), title, 18, True, '#0b0b0c')
    if y + h - 46 - (cy + 54) >= 18:
        draw.line((x + pad + 4, cy + 54, x + w - pad - 24, cy + 54), fill='#c8c5bd', width=3)
    if y + h - 46 - (cy + 72) >= 18:
        draw.line((x + pad + 4, cy + 72, x + int(w * 0.72), cy + 72), fill='#d8d5ce', width=3)
    draw.line((x + pad + 4, y + h - 46, x + w - pad - 4, y + h - 46), fill='#e8e5dd', width=2)
    text(draw, (x + pad + 4, y + h - 34), foot, 16, True, '#0b0b0c')
    text(draw, (x + w - pad - 68, y + h - 34), 'View ->', 15, True, '#0b0b0c')


def make_wires():
    # 1. Desktop Browse Wireframe
    img = Image.new('RGB', (1600, 940), '#faf9f6')
    d = ImageDraw.Draw(img)
    text(d, (40, 18), 'Desktop Browse Wireframe — Monochrome Editorial Layout', 26, True, '#0b0b0c')

    # Sticky header bar
    d.rectangle((40, 62, 1560, 126), fill='#0b0b0c')
    text(d, (64, 82), '[=] Menu drawer', 16, False, '#ffffff')
    text(d, (680, 78), 'Student Marketplace', 26, True, '#ffffff')
    text(d, (1245, 84), '[Bookmark 0]', 15, False, '#d8d5ce')
    pill(d, (1355, 76, 1495, 112), 'Post a listing', 15, '#ffffff', '#ffffff', '#0b0b0c')
    d.ellipse((1508, 76, 1544, 112), outline='#777777', width=2)
    text(d, (1520, 84), 'A', 16, True, '#ffffff')

    # Hero strip + Filters drawer callout
    d.rounded_rectangle((40, 146, 1560, 250), radius=18, fill='#f5f4f0', outline='#e2dfd7', width=2)
    text(d, (72, 162), 'THE CAMPUS EDITION', 13, True, '#6f6e68')
    text(d, (72, 184), 'Good finds, right here on campus.', 26, True, '#0b0b0c')
    d.rounded_rectangle((740, 170, 1390, 224), radius=27, fill='#ffffff', outline='#dedad2', width=2)
    text(d, (764, 188), 'Search goods, services or wanted posts', 17, False, '#88867f')
    pill(d, (1282, 176, 1384, 218), 'Search', 15, '#0b0b0c', '#0b0b0c', '#ffffff')
    pill(d, (1402, 170, 1532, 224), 'Filters', 16, '#ffffff', '#d2cfc7', '#0b0b0c')
    text(d, (740, 232), 'Clicking Filters toggles drawer: Type tabs (All/Goods/Services/Wanted), Sort, Grid/List, Category, PKR range', 13, False, '#52514d')

    # Left 3-col Mosaic + Right Sticky Wanted Rail
    # Featured 2-col card
    d.rounded_rectangle((40, 274, 796, 488), radius=16, fill='#ffffff', outline='#dedad2', width=2)
    d.rounded_rectangle((54, 288, 424, 474), radius=12, fill='#efede7', outline='#d8d4cc', width=1)
    text(d, (168, 370), 'Product Photo', 17, True, '#6f6e68')
    pill(d, (68, 434, 140, 460), 'Good', 13, '#333333', '#333333', '#ffffff')
    pill(d, (446, 292, 540, 316), 'FEATURED', 12, '#0b0b0c', '#0b0b0c', '#ffffff')
    text(d, (552, 295), 'Electronics · 2 hours ago', 14, False, '#6f6e68')
    text(d, (446, 330), '14-inch laptop · 8 GB / 256 GB', 22, True, '#0b0b0c')
    d.line((446, 372, 765, 372), fill='#c8c5bd', width=3)
    d.line((446, 392, 710, 392), fill='#d8d5ce', width=3)
    text(d, (446, 444), 'PKR 62,000', 20, True, '#0b0b0c')
    text(d, (710, 448), 'View ->', 16, True, '#0b0b0c')

    wire_card(d, 818, 274, 366, 326, 'First-year textbooks', '', 'Illustration + Condition', 'Books & stationery', 'PKR 2,800')
    wire_card(d, 40, 508, 366, 232, 'LED desk lamp', '', 'Illustration', 'Room essentials', 'PKR 1,800')
    wire_card(d, 430, 508, 366, 232, 'Calculus tutoring', 'SERVICES', 'Skills & services', 'Tutoring · Yesterday', 'PKR 750 / hr')
    wire_card(d, 818, 616, 366, 124, 'Wireless headphones', '', '', 'Electronics · Yesterday', 'PKR 4,500')

    # Wanted sticky rail
    d.rounded_rectangle((1210, 274, 1560, 720), radius=18, fill='#f5f4f0', outline='#e2dfd7', width=2)
    text(d, (1234, 294), 'REQUESTS', 13, True, '#9a5b22')
    text(d, (1234, 314), 'Wanted', 26, True, '#0b0b0c')
    text(d, (1234, 346), 'What students are looking for', 14, False, '#6f6e68')
    wire_card(d, 1234, 376, 302, 238, 'Wanted: a study chair', '', '', 'Room essentials (no pill)', 'Budget flexible')
    pill(d, (1234, 646, 1536, 692), 'Place a wanted listing ->', 15, '#ffffff', '#d2cfc7', '#0b0b0c')

    # Endnote bar + morph annotation
    d.rounded_rectangle((40, 762, 1560, 868), radius=20, fill='#0b0b0c')
    text(d, (80, 784), 'STILL LOOKING?', 13, True, '#b5b3ac')
    text(d, (80, 808), "Can't find it? Ask the campus.", 26, True, '#ffffff')
    pill(d, (1310, 792, 1530, 838), 'Post a wanted listing ->', 15, '#ffffff', '#ffffff', '#0b0b0c')
    d.line((1395, 696, 1395, 790), fill='#9a5b22', width=3)
    text(d, (1222, 734), 'Morphs on scroll-end', 14, True, '#9a5b22')

    d.rectangle((40, 888, 1560, 926), fill='#0b0b0c')
    text(d, (64, 898), 'Student Marketplace   ·   Campus peer-to-peer exchange   ·   Footer with subtle skyline', 15, False, '#d8d5ce')
    img.save(WIRES / 'browse-desktop.png')

    # 2. Mobile Browse & Post/Edit Listing Form Wireframe
    img = Image.new('RGB', (1600, 980), '#faf9f6')
    d = ImageDraw.Draw(img)
    text(d, (36, 18), 'Mobile Browse & Listing Form Wireframes', 26, True, '#0b0b0c')

    # Mobile viewport (left)
    d.rounded_rectangle((36, 66, 486, 944), radius=20, fill='#faf9f6', outline='#8a968d', width=2)
    d.rectangle((38, 68, 484, 122), fill='#0b0b0c')
    text(d, (54, 86), '[=]   Student Marketplace', 18, True, '#ffffff')
    text(d, (360, 88), '[Post] [A]', 14, True, '#ffffff')
    d.rounded_rectangle((56, 140, 466, 224), radius=12, fill='#f5f4f0', outline='#dedad2', width=2)
    text(d, (72, 150), 'Good finds, right here on campus.', 17, True, '#0b0b0c')
    d.rounded_rectangle((72, 180, 354, 212), radius=16, fill='#ffffff', outline='#dedad2', width=1)
    text(d, (86, 188), 'Search listings...', 14, False, '#88867f')
    pill(d, (364, 180, 452, 212), 'Filters', 13, '#ffffff', '#d2cfc7', '#0b0b0c')
    wire_card(d, 56, 240, 410, 224, '14-inch laptop', '', 'Product photo / art', 'Electronics', 'PKR 62,000')
    wire_card(d, 56, 478, 410, 212, 'Calculus tutoring', 'SERVICES', 'Services art', 'Tutoring', 'PKR 750 / hr')
    d.rounded_rectangle((56, 704, 466, 830), radius=14, fill='#f5f4f0', outline='#dedad2', width=2)
    text(d, (74, 718), 'Wanted (stacked below <= 1120px)', 16, True, '#0b0b0c')
    text(d, (74, 748), 'Wanted: a study chair · Budget flexible', 15, False, '#52514d')
    pill(d, (74, 780, 316, 818), 'Place a wanted listing ->', 14, '#ffffff', '#d2cfc7', '#0b0b0c')
    d.rounded_rectangle((56, 844, 466, 924), radius=14, fill='#0b0b0c')
    text(d, (74, 858), "Can't find it? Ask the campus.", 15, True, '#ffffff')
    pill(d, (74, 884, 286, 914), 'Post a wanted listing ->', 13, '#ffffff', '#ffffff', '#0b0b0c')

    # Post / Edit Listing Form + Live Preview (right)
    d.rounded_rectangle((524, 66, 1564, 944), radius=20, fill='#ffffff', outline='#dedad2', width=2)
    text(d, (556, 88), 'Post a listing (#post) & Live Preview', 24, True, '#0b0b0c')
    for x, w, lbl, active in [(556, 172, 'Goods', True), (742, 172, 'Services', False), (928, 172, 'Wanted', False)]:
        d.rounded_rectangle((x, 140, x + w, 186), radius=10, fill='#0b0b0c' if active else '#faf9f6', outline='#0b0b0c' if active else '#d2cfc7', width=2)
        text(d, (x + 52, 154), lbl, 17, True, '#ffffff' if active else '#0b0b0c')

    for y, lbl, val in [(208, 'Listing title (5-80 chars, required)', 'Scientific calculator, like new'),
                        (298, 'Category (Custom accessible select menu)', 'Choose a category              v')]:
        text(d, (556, y), lbl, 16, True, '#0b0b0c')
        d.rounded_rectangle((556, y + 26, 1100, y + 72), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
        text(d, (574, y + 40), val, 16, False, '#6f6e68')

    text(d, (556, 388), 'Description (20-1,500 chars, required)', 16, True, '#0b0b0c')
    d.rounded_rectangle((556, 414, 1100, 514), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
    text(d, (574, 428), 'Condition, specifications, or scope of service...', 16, False, '#6f6e68')

    text(d, (556, 532), 'Price / Rate / Budget (PKR)', 16, True, '#0b0b0c')
    text(d, (838, 532), 'Condition / Rate unit / Flex', 16, True, '#0b0b0c')
    d.rounded_rectangle((556, 558, 822, 604), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
    d.rounded_rectangle((838, 558, 1100, 604), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
    text(d, (574, 572), '0 - 1,000,000', 15, False, '#6f6e68')
    text(d, (854, 572), 'Like new  /  Per hour', 15, False, '#6f6e68')

    text(d, (556, 624), 'Listing photo (optional, PNG/JPG/WebP/GIF <= 5 MB)', 16, True, '#0b0b0c')
    d.rounded_rectangle((556, 650, 1100, 738), radius=12, fill='#faf9f6', outline='#b8b5ad', width=2)
    text(d, (648, 676), 'Upload an image or drag and drop  (Replace / Remove)', 16, False, '#52514d')

    text(d, (556, 756), 'Broad location', 16, True, '#0b0b0c')
    text(d, (838, 756), 'Fallback artwork', 16, True, '#0b0b0c')
    d.rounded_rectangle((556, 782, 822, 828), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
    d.rounded_rectangle((838, 782, 1100, 828), radius=10, fill='#ffffff', outline='#d2cfc7', width=2)
    text(d, (574, 796), 'Main campus              v', 15, False, '#6f6e68')
    text(d, (854, 796), 'Laptop artwork           v', 15, False, '#6f6e68')

    pill(d, (556, 864, 830, 912), 'Submit for review', 17, '#0b0b0c', '#0b0b0c', '#ffffff')
    text(d, (858, 878), 'Cancel', 17, True, '#52514d')

    # Live preview column
    wire_card(d, 1138, 140, 392, 412, 'Live listing preview', '', 'Uploaded photo / SVG art', 'Category · Just now', 'PKR preview')
    d.rounded_rectangle((1138, 578, 1530, 720), radius=12, fill='#f5f4f0', outline='#e2dfd7', width=2)
    text(d, (1158, 598), 'Submission & Lifecycle Rules', 17, True, '#0b0b0c')
    text(d, (1158, 628), '- New & edited posts enter My listings', 15, False, '#52514d')
    text(d, (1158, 654), '  with Pending review badge.', 15, False, '#52514d')
    text(d, (1158, 680), '- Client validation prevents invalid posts.', 15, False, '#52514d')
    img.save(WIRES / 'mobile-and-form.png')

    # 3. Client Data Flow Diagram
    img = Image.new('RGB', (1600, 260), '#ffffff')
    d = ImageDraw.Draw(img)
    stages = [
        ('Hash Routes & Forms', '#browse / #post / #saved / #mine', (28, 56, 378, 178)),
        ('Validation & Filters', 'Bounds, escaping, 5MB photo check', (428, 56, 788, 178)),
        ('In-Memory Store', 'listings[], savedFinds, recentlyViewed', (838, 56, 1198, 178)),
        ('DOM Render & Morph', 'Mosaic, drawer, sticky CTA glide', (1248, 56, 1572, 178)),
    ]
    for title_s, sub_s, coords in stages:
        d.rounded_rectangle(coords, radius=14, fill='#faf9f6', outline='#0b0b0c', width=2)
        text(d, (coords[0] + 18, coords[1] + 24), title_s, 20, True, '#0b0b0c')
        text(d, (coords[0] + 18, coords[1] + 64), sub_s, 15, False, '#52514d')
    for x in [394, 804, 1214]:
        text(d, (x, 98), '->', 26, True, '#0b0b0c')
    text(d, (32, 208), 'Assignment 1 client-only architecture: static files only, in-memory state (resets on refresh), no backend database, login API, or payment service.', 18, False, '#52514d')
    img.save(WIRES / 'client-data-flow.png')
    print('Wireframes regenerated cleanly in', WIRES)

def build():
    make_wires()
    doc=Document()
    section=doc.sections[0]
    section.page_width=Inches(8.5);section.page_height=Inches(11)
    section.top_margin=Inches(.65);section.bottom_margin=Inches(.65)
    section.left_margin=Inches(.75);section.right_margin=Inches(.75)
    styles=doc.styles
    for name in ['Normal','Title','Subtitle','Heading 1','Heading 2','Caption']:
        styles[name].font.color.rgb=RGBColor(0,0,0)
        styles[name].font.name='Calibri'
    styles['Normal'].font.size=Pt(11)
    styles['Normal'].paragraph_format.space_after=Pt(7)
    styles['Normal'].paragraph_format.line_spacing=1.08
    styles['Title'].font.size=Pt(24)
    styles['Heading 1'].font.size=Pt(16)
    styles['Heading 2'].font.size=Pt(12)
    for name in ['Heading 1','Heading 2']:
        styles[name].paragraph_format.space_before=Pt(12)
        styles[name].paragraph_format.space_after=Pt(6)
    styles['Caption'].font.size=Pt(9)
    header=section.header.paragraphs[0]
    header.text='CS344 WEB ENGINEERING  |  ASSIGNMENT 1  |  IDEA 16'
    header.style='Normal';header.runs[0].font.size=Pt(9)
    footer=section.footer.paragraphs[0]
    footer.text='Annan Khan  |  CMS 506644  |  BESE15-B'
    footer.runs[0].font.size=Pt(9)
    footer.add_run(' '*8+'Page ').font.size=Pt(9)
    field=OxmlElement('w:fldSimple');field.set(qn('w:instr'),'PAGE');footer._p.append(field)
    def p(t):doc.add_paragraph(t)
    def h(t):doc.add_heading(t,2)
    def page(t):
        heading=doc.add_heading(t,1)
        heading.paragraph_format.page_break_before=True
    def picture(name,width=7):
        doc.add_picture(str(WIRES/name),width=Inches(width))
        doc.paragraphs[-1].paragraph_format.space_after=Pt(0)
    def caption(t):doc.add_paragraph(t,'Caption')
    doc.add_paragraph('Student Marketplace', 'Title')
    doc.add_paragraph('Assignment 1 Design Note','Subtitle')
    p('Annan Khan  |  CMS 506644  |  BESE15-B')
    p('CS344 Web Engineering  |  Idea 16  |  30 October 2026')
    h('User and workflow')
    p('Student Marketplace helps students find goods, offer services and request items on campus. Users browse or search, filter by type, category and price, then open or save a listing. The demo owner can create, edit and delete posts. New and edited posts stay pending. The app contains nine fictional records, including six active listings, and resets on refresh.')
    h('Design choices')
    p('The layout follows a newspaper: a blackletter masthead, compact headlines, white backgrounds and occasional wider listings. Wanted posts have a separate classifieds column. Green solid rules identify goods, blue double rules identify services, and rust dashed borders identify wanted posts. Each type also has a text label.')
    p('Desktop navigation sits on the left and can collapse to give listings more space. Tablet and mobile use a compact horizontal menu; small screens stack the listings. Labeled fields, semantic headings, a skip link and visible keyboard focus support accessibility.')
    h('WDLC stages')
    p('Requirements: identify the student workflow and the constraints of idea 16. Design: sketch the browse and posting screens and choose responsive layouts. Implementation: build the HTML structure, CSS and JavaScript interactions. Testing: check valid, invalid and empty cases, then inspect desktop, tablet and mobile views. Maintenance: preserve this version in Git and extend the same records in later assignments.')
    h('What runs in the browser')
    p('JavaScript filters the listing array, handles forms and updates the DOM. Records, saved items and recent views stay in memory. Forms use native browser constraints and JavaScript checks; user text is escaped before display. The HTTP server only serves static files. There is no database, real login or payment service in Assignment 1.')
    h('Run and source')
    p('Live app: https://student-marketplace-cs344.vercel.app')
    p('For local use, run the command below from the repository root with Python 3, then open http://127.0.0.1:5519. Setup steps, screenshots and the nine automated tests are in the README.')
    par=doc.add_paragraph('py -m http.server 5519 --bind 127.0.0.1 --directory assignment-1')
    for r in par.runs:r.font.name='Consolas';r.font.size=Pt(9)
    p('https://github.com/crankysmh47/student-marketplace-cs344')
    p('Fonts: Unifraktur Cook and Roboto Slab from google/fonts. Licenses and asset attribution are included in the repository.')
    page('Wireframes')
    p('These wireframes show the main layout. Actual application screenshots are included in the repository README.')
    picture('browse-desktop.png',6.65)
    caption('Figure 1  Desktop browse with left navigation and a separate Wanted column')
    picture('mobile-and-form.png',6.65)
    caption('Figure 2  Mobile browse and the listing form with a live preview')
    doc.core_properties.author='Annan Khan'
    doc.core_properties.title='Student Marketplace Assignment 1 Design Note'
    doc.core_properties.subject='CS344 Web Engineering Idea 16'
    target=OUT/'Annan_Khan_506644_Assignment_1.docx'
    for element in [doc._element,doc.styles.element]:
        for border in list(element.xpath('.//w:pBdr')):border.getparent().remove(border)
    doc.save(target)
    print(target)

if __name__ == '__main__':
    build()
