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
    img=Image.new('RGB',(1600,830),'white'); d=ImageDraw.Draw(img)
    text(d,(38,20),'Desktop browse wireframe',30,True)
    text(d,(490,76),'Student Marketplace',42,True)
    text(d,(44,145),'Marketplace          Saved finds          My listings',23)
    box(d,(1330,132,1548,177),'Post listing',22)
    d.line((38,191,1555,191),fill='#222722',width=4)
    box(d,(42,220,1550,277),'Search listings                                                    Search',24)
    text(d,(44,298),'All listings    Goods    Services    Wanted                  Refine     Sort     Grid / List',22)
    d.line((42,342,1550,342),fill='#bdc7be',width=2)
    # Wide feature and the shorter entries beneath it share the main tracks.
    wire_card(d,42,370,710,210,'Goods - two-column feature',False)
    wire_card(d,778,370,345,395,'Goods - narrow listing')
    wire_card(d,42,608,345,190,'Goods',False)
    wire_card(d,410,608,342,190,'Services',False,'#305c86')
    d.line((1150,365,1150,800),fill='#bdc7be',width=2)
    text(d,(1200,372),'WANTED CLASSIFIEDS',21,True,'#86532f')
    wire_card(d,1180,421,365,220,'Wanted - student request',False,'#86532f')
    box(d,(1180,670,1545,728),'Place a wanted listing',20,'#86532f')
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
    def table(headers,rows,widths):
        tab=doc.add_table(rows=1,cols=len(headers));tab.autofit=False
        for i,label in enumerate(headers):
            tab.columns[i].width=Inches(widths[i]);cell=tab.rows[0].cells[i];cell.text=label
            shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'E9EDE9');cell._tc.get_or_add_tcPr().append(shade)
            for r in cell.paragraphs[0].runs:r.bold=True
        repeat=OxmlElement('w:tblHeader');tab.rows[0]._tr.get_or_add_trPr().append(repeat)
        for row in rows:
            cells=tab.add_row().cells
            for i,value in enumerate(row):cells[i].text=value
        tblw=tab._tbl.tblPr.find(qn('w:tblW'));tblw.set(qn('w:type'),'dxa');tblw.set(qn('w:w'),str(int(sum(widths)*1440)))
        for row in tab.rows:
            for i,cell in enumerate(row.cells):
                cell.width=Inches(widths[i])
                for par in cell.paragraphs:
                    par.paragraph_format.space_after=Pt(5)
                    for r in par.runs:r.font.size=Pt(10)
        return tab

    doc.add_paragraph('Student Marketplace', 'Title')
    doc.add_paragraph('Assignment 1 Design and WDLC Note','Subtitle')
    p('Annan Khan  |  CMS 506644  |  BESE15-B')
    p('Assigned idea 16  |  Client-side web application  |  Due 30 October 2026')
    h('User and problem')
    p('Students need a single place to find goods, offer small services and request items from other students. Student Marketplace groups these activities into Goods, Services and Wanted, with category and price controls that reduce the effort of finding a relevant listing. All records are fictional and no payments are processed.')
    h('Core workflow')
    p('Browse or search listings, refine the results, open a listing and save it for later. A demo student can create a listing, review its live preview and submit it. New and edited posts enter Pending review in My listings. The demo owner can edit or delete those records; public browse shows active records only. A page refresh restores the supplied fixtures.')
    h('Assignment 1 scope')
    p('The application runs in the browser using semantic HTML, CSS and vanilla JavaScript. Meaningful interactions include combined search and filtering, in-memory listing CRUD, saved items and type-specific forms. Nine fixture records include six active listings and three owner records illustrating pending, rejected and expired states. Those states are demonstrations, not a working moderator service.')
    h('Approved visual design')
    p('The design uses a stark white page and card background, a blackletter masthead, compact slab-serif headlines and plain interface text. Narrow editorial columns contain occasional two-column features. Content-height packing allows subsequent listings to occupy space below a shorter feature. Wanted requests use a separate classifieds rail. On smaller screens the rail moves below the main listings and the layout reduces to a single column.')
    p('Goods use green solid rules and a filled text label. Services use blue double rules and an outlined label. Wanted uses rust dashed notices. Text and border patterns communicate type without relying on color alone. The form and other views use the same typography and spacing.')

    page('Wireframes and responsive structure')
    p('These schematics describe the approved layout and content hierarchy. They are wireframes, not browser screenshots. The running application remains the source for exact typography and spacing.')
    picture('browse-desktop.png',6.65)
    caption('Figure 1  Desktop browse with occasional wider entries and a separate Wanted classifieds column')
    picture('mobile-and-form.png',6.65)
    caption('Figure 2  Mobile browse stacks vertically and the posting form provides labels, validation and a live preview')
    p('The CSS contains breakpoints for desktop, tablet and mobile layouts. Native headings, a skip link, input labels, fieldsets, visible focus states and ordinary links/buttons provide the intended keyboard and screen-reader structure. Desktop, tablet and mobile browser checks found no horizontal overflow. Heading-to-search keyboard focus was also verified.')

    page('Client design and validation')
    picture('client-data-flow.png')
    caption('Figure 3  Assignment 1 data flow is local to the browser after static files load')
    h('Browser and server responsibilities')
    p('The static HTTP server returns HTML, CSS, JavaScript, images and fonts. The browser holds the listing array, filter state, saved-item set and recently viewed identifiers in memory. Event handlers validate inputs and update the DOM. No API call stores a record, and browser storage is not used for personal data. Later stages add server validation, persistence, authenticated ownership and moderation; the current client checks are not security controls.')
    h('Core sample records')
    table(['Listing','Type','Amount'],[
        ['14-inch laptop','Goods','PKR 62,000'],['Engineering textbooks','Goods','PKR 2,800'],
        ['Adjustable desk lamp','Goods','PKR 1,800'],['Calculus tutoring','Services','PKR 750 per hour'],
        ['Unopened headphones','Goods','PKR 4,500'],['Study chair request','Wanted','Flexible budget'],
    ],[3.7,1.2,2.1])
    h('Validation and output safety')
    p('Browser constraints require a title of 5 to 80 characters, a description of 20 to 1500 characters, a valid category and an amount between 0 and 1,000,000 PKR in steps of 0.01. JavaScript repeats the checks for the application flow. Goods select a condition, services select a rate unit, and a flexible wanted budget disables the amount field. A minimum filter amount above the maximum produces an error. Empty results offer a clear reset action.')
    p('User-controlled text is escaped before template rendering or assigned through textContent. New and edited listings remain pending. Edit and delete actions check the fictional owner flag; a delete confirmation allows cancellation. Real privacy and access enforcement require the later server-backed implementation.')

    page('WDLC and verification')
    h('Web development lifecycle')
    p('Requirements: use idea 16, a browser-only application, responsive CSS, semantic forms, six or more records and meaningful interactions. Design: define the three listing types, core journey, wireframes, white newspaper layout and responsive behavior. Implementation: build the HTML shell, CSS layers, fixture data and event-driven JavaScript. Testing: exercise DOM workflows and edge cases, then inspect real viewports and keyboard use. Deployment and maintenance: publish versioned source, retain exact local run instructions and carry the same user problem into the PHP/PDO and MERN stages.')
    h('Automated verification')
    table(['Check group','Result'],[
        ['Native constraints and amount limits','Passed'],['Search, empty results and invalid ranges','Passed'],
        ['Create, edit, delete and pending visibility','Passed'],['Invalid submission and safe literal text','Passed'],
        ['Save and unsave without persistent storage','Passed'],['Layout spacing calculation','Passed'],
        ['Delete cancellation and non-owned target','Passed'],['Service units and flexible wanted budget','Passed'],
    ],[5.7,1.3])
    p('Eight Node and jsdom tests pass. Browser checks confirm native validation, create and edit, saved items, empty search, heading-to-search focus and three responsive sizes without horizontal overflow. Screenshots are in docs/screenshots. The Delete confirmation stalled in browser automation; deletion passes the DOM tests. A student live walkthrough is still required. The new fixes began with failing tests; the original prototype was not developed test first.')
    h('Repository and local demonstration')
    p('Repository: https://github.com/crankysmh47/student-marketplace-cs344')
    p('From the repository root, run the command below with Python 3 installed. Open http://127.0.0.1:5519/?theme=forest#browse and keep the terminal open. No backend or database setup is required.')
    par=doc.add_paragraph('py -m http.server 5519 --bind 127.0.0.1 --directory assignment-1')
    for r in par.runs:r.font.name='Consolas';r.font.size=Pt(9)
    h('Continuity and attribution')
    p('Assignment 2 introduces PHP 8.5, PDO, persistence, Fetch, server validation and session/CSRF protection. Assignment 3 introduces React, Express, MongoDB and authenticated roles. University-email sign-in awaits the supplied template. Contact requests, real moderation, expiry processing and abuse reports are later-stage work.')
    p('The brief is CS344 Web Engineering Assignments 1 to 3 2026, supplied in the project folder. Original fictional SVG illustrations are bundled locally. Unifraktur Cook and Roboto Slab come from the official google/fonts repository with their SIL and Apache licenses. Earlier font variants retain their own notices in assets/fonts. The repository is private; the assessor must have access before review.')
    doc.core_properties.author='Annan Khan'
    doc.core_properties.title='Student Marketplace Assignment 1 Design and WDLC Note'
    doc.core_properties.subject='CS344 Web Engineering Idea 16'
    target=OUT/'Annan_Khan_506644_Assignment_1.docx'
    for element in [doc._element,doc.styles.element]:
        for border in list(element.xpath('.//w:pBdr')):border.getparent().remove(border)
    doc.save(target)
    print(target)

if __name__ == '__main__':
    build()
