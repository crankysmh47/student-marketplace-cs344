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

def box(draw, xy, label='', size=20, color='#8a968d'):
    draw.rectangle(xy, outline=color, width=2)
    if label:
        text(draw, (xy[0]+12, xy[1]+10), label, size)

def wire_card(draw, x, y, w, h, title, image=True, ink='#215441'):
    draw.line((x,y,x+w,y),fill=ink,width=4)
    text(draw,(x+8,y+10),title,19,True,ink)
    if image:
        box(draw,(x+8,y+45,x+w-8,y+h//2),'Illustration',18,'#bbc4bc')
    start=y+h//2+15 if image else y+55
    for i,ratio in enumerate([.88,.74,.91]):
        draw.line((x+8,start+i*22,x+int(w*ratio),start+i*22),fill='#aab5ac',width=3)
    text(draw,(x+8,y+h-42),'Price     View listing',17,color=ink)
    draw.line((x,y+h,x+w,y+h),fill='#bdc7be',width=2)

def make_wires():
    img=Image.new('RGB',(1600,760),'white'); d=ImageDraw.Draw(img)
    text(d,(38,20),'Desktop browse wireframe',30,True)
    text(d,(520,74),'Student Marketplace',42,True)
    d.line((38,145,1555,145),fill='#222722',width=4)
    # Compact left navigation, with search and listings immediately alongside.
    d.line((230,178,230,712),fill='#bdc7be',width=2)
    for y,label in [(190,'Marketplace'),(246,'Saved finds'),(302,'My listings')]:text(d,(42,y),label,20,True)
    box(d,(42,374,208,432),'Post listing',20)
    text(d,(42,467),'Demo records',17)
    text(d,(42,494),'Reset on refresh',17)
    box(d,(268,178,1550,233),'Search listings                                                     Search',22)
    text(d,(270,257),'All listings    Goods    Services    Wanted                         Refine     Sort',21)
    d.line((268,299,1550,299),fill='#bdc7be',width=2)
    wire_card(d,268,324,620,190,'Goods - two-column feature',False)
    wire_card(d,914,324,298,375,'Goods - narrow listing')
    wire_card(d,268,548,298,174,'Goods',False)
    wire_card(d,590,548,298,174,'Services',False,'#305c86')
    d.line((1230,320,1230,720),fill='#bdc7be',width=2)
    text(d,(1260,330),'WANTED CLASSIFIEDS',19,True,'#86532f')
    wire_card(d,1250,382,300,205,'Wanted request',False,'#86532f')
    box(d,(1250,617,1550,675),'Place a wanted listing',18,'#86532f')
    img.save(WIRES/'browse-desktop.png')

    img=Image.new('RGB',(1600,920),'white'); d=ImageDraw.Draw(img)
    text(d,(36,20),'Mobile browse and listing form wireframes',30,True)
    box(d,(42,80,486,885));text(d,(80,105),'Student Marketplace',26,True)
    text(d,(70,157),'Browse     Saved     My listings',20)
    box(d,(68,205,458,256),'Search',22)
    text(d,(68,281),'All   Goods   Services   Wanted',20)
    wire_card(d,68,326,390,269,'Goods')
    wire_card(d,68,625,390,150,'Services',False,'#305c86')
    text(d,(68,812),'Wanted follows the main listings',19)
    text(d,(580,94),'Post a listing',31,True)
    text(d,(580,148),'Listing details',22,True)
    for x,w,label in [(580,185,'Goods'),(780,185,'Services'),(980,185,'Wanted')]:box(d,(x,191,x+w,242),label,21)
    for y,label in [(280,'Listing title'),(386,'Category')]:
        text(d,(580,y),label,21,True);box(d,(580,y+34,1165,y+83),'Enter or select a value',20)
    text(d,(580,492),'Description',21,True);box(d,(580,526,1165,655),'Condition or service scope',20)
    text(d,(580,683),'Price / rate / budget     Location',21,True)
    box(d,(580,719,860,765),'PKR amount',20);box(d,(883,719,1165,765),'Campus zone',20)
    box(d,(580,810,905,867),'Submit for review',21)
    text(d,(944,826),'Cancel',21)
    wire_card(d,1220,191,335,355,'Live listing preview')
    text(d,(1220,585),'New posts stay pending',19)
    text(d,(1220,615),'until a later server',19)
    text(d,(1220,645),'moderation workflow.',19)
    img.save(WIRES/'mobile-and-form.png')

    img=Image.new('RGB',(1600,245),'white'); d=ImageDraw.Draw(img)
    stages=[('Browser form',(25,65,365,180)),('Validation and rules',(435,65,825,180)),('In-memory records',(895,65,1260,180))]
    for label,coords in stages:box(d,coords,label,25,'#536d55')
    for x in [385,845,1268]:text(d,(x,100),'>',34,True)
    text(d,(1300,78),'DOM',25,True);text(d,(1300,120),'render',25)
    text(d,(35,210),'Static HTTP server delivers files only. No API, database, sign-in or payment service in Assignment 1.',21)
    img.save(WIRES/'client-data-flow.png')

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
    p('Desktop navigation sits on the left so search and listings appear higher on the page. Tablet and mobile use a compact horizontal menu; small screens stack the listings. Labeled fields, semantic headings, a skip link and visible keyboard focus support accessibility.')
    h('WDLC stages')
    p('Requirements: identify the student workflow and the constraints of idea 16. Design: sketch the browse and posting screens and choose responsive layouts. Implementation: build the HTML structure, CSS and JavaScript interactions. Testing: check valid, invalid and empty cases, then inspect desktop, tablet and mobile views. Maintenance: preserve this version in Git and extend the same records in later assignments.')
    h('What runs in the browser')
    p('JavaScript filters the listing array, handles forms and updates the DOM. Records, saved items and recent views stay in memory. Forms use native browser constraints and JavaScript checks; user text is escaped before display. The HTTP server only serves static files. There is no database, real login or payment service in Assignment 1.')
    h('Run and source')
    p('From the repository root, run the command below with Python 3, then open http://127.0.0.1:5519/?theme=forest#browse. Setup steps, screenshots and the eight automated tests are documented in the README.')
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
