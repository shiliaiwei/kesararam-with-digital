import os
import sys
import docx
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont

# Define Output Paths
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPTS_DIR)
DOCS_DIR = os.path.join(PROJECT_DIR, 'docs')
PUBLIC_DIR = os.path.join(PROJECT_DIR, 'public')
ASSETS_DIR = os.path.join(PUBLIC_DIR, 'brand-assets')

os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

LOGO_PATH = os.path.join(ASSETS_DIR, 'logo_black.png')
CHART_PATH = os.path.join(ASSETS_DIR, 'growth_chart.png')
DIAGRAM_PATH = os.path.join(ASSETS_DIR, 'workflow_diagram.png')
DOCX_PATH = os.path.join(PROJECT_DIR, 'KWD_Business_Plan.docx')

# ==========================================
# 1. ASSET GENERATION (MONOCHROME ONLY)
# ==========================================

def generate_logo():
    """Generates a minimalist black-and-white corporate logo for KWD."""
    img = Image.new('L', (500, 500), color=255) # White background
    draw = ImageDraw.Draw(img)
    
    # Draw a bold minimalist geometric mark: interlocking triangles/polygons representing road network & direction
    draw.rectangle([50, 50, 450, 450], outline=0, width=6)
    
    # Interlocking shapes using simple geometric lines
    draw.polygon([(120, 120), (280, 250), (120, 380)], fill=0)
    draw.polygon([(260, 120), (400, 250), (260, 380)], outline=0, fill=None, width=12)
    draw.line([(250, 60), (250, 440)], fill=255, width=8)
    
    img.save(LOGO_PATH, 'PNG')
    print(f"Logo generated at {LOGO_PATH}")


def generate_growth_chart():
    """Generates a clean black-and-white double growth chart using Matplotlib."""
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    subscribers = [120, 450, 1500, 3200, 5400]
    mrr = [1198.80, 4495.50, 14985.00, 31968.00, 53946.00]
    
    plt.figure(figsize=(10, 5.2), facecolor='white')
    
    # Subplot 1: Subscribers
    plt.subplot(1, 2, 1)
    plt.plot(years, subscribers, color='black', marker='o', linewidth=2, linestyle='-')
    plt.title('PROJECTED SUBSCRIBERS', fontsize=12, fontweight='bold', color='black')
    plt.xlabel('Timeline', fontsize=10, color='black')
    plt.ylabel('Active Subscribers', fontsize=10, color='black')
    plt.grid(True, which='both', linestyle='--', color='lightgray', linewidth=0.5)
    plt.tick_params(colors='black')
    
    # Subplot 2: MRR Growth
    plt.subplot(1, 2, 2)
    plt.bar(years, mrr, color='black', edgecolor='black', width=0.5)
    plt.title('PROJECTED MRR (USD)', fontsize=12, fontweight='bold', color='black')
    plt.xlabel('Timeline', fontsize=10, color='black')
    plt.ylabel('Revenue (USD)', fontsize=10, color='black')
    plt.grid(True, which='both', linestyle='--', color='lightgray', linewidth=0.5)
    plt.tick_params(colors='black')
    
    plt.tight_layout()
    plt.savefig(CHART_PATH, dpi=300, facecolor='white')
    plt.close()
    print(f"Growth chart generated at {CHART_PATH}")


def generate_workflow_diagram():
    """Generates a black-and-white workflow diagram showing user flow and KWD data telemetry."""
    fig, ax = plt.subplots(figsize=(11, 4.5), facecolor='white')
    ax.set_facecolor('white')
    
    # Simple blocks in the chart
    boxes = [
        {"x": 0.5, "y": 2.5, "w": 2.5, "h": 1.0, "text": "1. SUBSCRIPTION MODEL\n- Free: $0/mo (Student)\n- Teacher Pro: $9.99/mo\n- School Bundle: $49.99/mo"},
        {"x": 3.8, "y": 2.5, "w": 2.5, "h": 1.0, "text": "2. INSTRUCTOR ACCESS\n- Set up classes (max 5)\n- Add students (max 50)\n- Custom content tools"},
        {"x": 7.1, "y": 2.5, "w": 2.5, "h": 1.0, "text": "3. SOLO/LIVE PLAY\n- Driving sign practice\n- Speed & sign challenges\n- Randomized seed shuffle"},
        {"x": 3.8, "y": 0.5, "w": 2.5, "h": 1.0, "text": "5. RENEWAL CYCLE\n- High pass rates (92%+)\n- Value-based positioning\n- Annual bundle discount"},
        {"x": 7.1, "y": 0.5, "w": 2.5, "h": 1.0, "text": "4. ANALYTICS / TELEMETRY\n- Identify weak topics\n- Class-wide performance\n- Admin audit log output"}
    ]
    
    for box in boxes:
        rect = plt.Rectangle((box["x"], box["y"]), box["w"], box["h"], 
                             fill=False, edgecolor='black', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(box["x"] + box["w"]/2, box["y"] + box["h"]/2, box["text"],
                ha='center', va='center', fontsize=8, color='black', fontweight='bold')
        
    # Draw monochrome flow arrows
    ax.annotate('', xy=(3.8, 3.0), xytext=(3.0, 3.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    ax.annotate('', xy=(7.1, 3.0), xytext=(6.3, 3.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    ax.annotate('', xy=(8.35, 1.5), xytext=(8.35, 2.5),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    ax.annotate('', xy=(6.3, 1.0), xytext=(7.1, 1.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    ax.annotate('', xy=(5.05, 2.5), xytext=(5.05, 1.5),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))

    ax.set_xlim(0, 10.5)
    ax.set_ylim(0, 4.0)
    ax.axis('off')
    
    plt.tight_layout()
    plt.savefig(DIAGRAM_PATH, dpi=300, facecolor='white')
    plt.close()
    print(f"Workflow diagram generated at {DIAGRAM_PATH}")


# ==========================================
# 2. DOCX COMPILATION HELPERS
# ==========================================

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets standard padding for document tables (in dxa)."""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def set_table_borders(table):
    """Sets a clean, thin black border for monochrome table grids (no vertical lines)."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        '<w:tblBorders %s>'
        '  <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        '  <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>'
        '  <w:insideH w:val="single" w:sz="3" w:space="0" w:color="CCCCCC"/>'
        '  <w:left w:val="none"/>'
        '  <w:right w:val="none"/>'
        '  <w:insideV w:val="none"/>'
        '</w:tblBorders>' % nsdecls('w')
    )
    tblPr.append(borders)


def make_callout_box(doc, title, text):
    """Creates a monochrome callout box in Khmer (thin black border, Google Sans font)."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    tbl.columns[0].width = Inches(6.0)
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.0)
    
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        '<w:tcBorders %s>'
        '  <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '  <w:left w:val="single" w:sz="20" w:space="0" w:color="000000"/>'  # Thicker left border for callout
        '  <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '  <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '</w:tcBorders>' % nsdecls('w')
    )
    tcPr.append(borders)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.line_spacing = 1.15
    
    run_title = p.add_run(f"{title}\n")
    run_title.font.name = 'Google Sans'
    run_title.font.bold = True
    run_title.font.size = Pt(10)
    
    run_text = p.add_run(text)
    run_text.font.name = 'Google Sans'
    run_text.font.italic = True
    run_text.font.size = Pt(9.5)
    
    doc.add_paragraph().paragraph_format.space_after = Pt(6)


def add_hud_bar(doc, text):
    """Adds a futuristic HUD telemetry bar in Khmer (monochrome capital text format)."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    run = p.add_run(f"// {text.upper()} // ប្រព័ន្ធដំណើរការសកម្ម // ទិន្នន័យទូរវាស់ស្ទង់ប្រតិបត្តិការ")
    run.font.name = 'Google Sans'
    run.font.bold = True
    run.font.size = Pt(9)
    
    # Add a thin bottom border to the paragraph
    pPr = p._p.get_or_add_pPr()
    pBdr = parse_xml(
        '<w:pBdr %s>'
        '  <w:bottom w:val="single" w:sz="6" w:space="4" w:color="000000"/>'
        '</w:pBdr>' % nsdecls('w')
    )
    pPr.append(pBdr)


def add_page_number_fields(run):
    """Inserts XML page field elements into docx run."""
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)


def setup_page_footer(doc):
    """Sets up a clean footer with left and right page indicators."""
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    run_left = p.add_run("KWD-SEC // ")
    run_left.font.name = 'Google Sans'
    run_left.font.size = Pt(8.5)
    
    run_num1 = p.add_run()
    run_num1.font.name = 'Google Sans'
    run_num1.font.size = Pt(8.5)
    add_page_number_fields(run_num1)
    
    run_space = p.add_run("\t\t\t\t\t\t\t\t") # Tabs to push text right
    run_space.font.name = 'Google Sans'
    run_space.font.size = Pt(8.5)
    
    run_right = p.add_run("ទំព័រ ")
    run_right.font.name = 'Google Sans'
    run_right.font.size = Pt(8.5)
    
    run_num2 = p.add_run()
    run_num2.font.name = 'Google Sans'
    run_num2.font.size = Pt(8.5)
    add_page_number_fields(run_num2)
    
    p.paragraph_format.space_before = Pt(6)


def add_heading_styled(doc, text, level=1):
    """Adds a bold heading in Google Sans with strict monochrome styling and spacing."""
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    
    for run in h.runs:
        run.font.name = 'Google Sans'
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.font.bold = True
        if level == 1:
            run.font.size = Pt(13.5)
            h.paragraph_format.space_before = Pt(18)
            h.paragraph_format.space_after = Pt(6)
        elif level == 2:
            run.font.size = Pt(11.5)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(4)
        else:
            run.font.size = Pt(10.5)
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(2)
    return h


# ==========================================
# 3. DOCX BUILD PROCESS (19 SECTIONS)
# ==========================================

def build_khmer_business_plan():
    doc = Document()
    
    # 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Set default style font to Google Sans
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Google Sans'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.line_spacing = 1.15
    
    # ------------------------------------------
    # SECTION 1: TITLE PAGE (ទំព័រចំណងជើង)
    # ------------------------------------------
    for _ in range(2):
        doc.add_paragraph()
        
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_logo = p_logo.add_run()
    run_logo.add_picture(LOGO_PATH, width=Inches(1.6))
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម")
    run_title.font.name = 'Google Sans'
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    run_sub = p_sub.add_run("ផែនការអាជីវកម្មយុទ្ធសាស្ត្រប្រាំឆ្នាំ (២០២៦ – ២០៣១) // កូដគម្រោង៖ KWD")
    run_sub.font.name = 'Google Sans'
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    
    for _ in range(4):
        doc.add_paragraph()
        
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.line_spacing = 1.3
    
    meta_runs = [
        ("វិសាលភាពពេលវេលា៖ ", True), ("ឆ្នាំ ២០២៦ – ២០៣១ (ការវិភាគការព្យាករណ៍ទៅមុខ)\n", False),
        ("ដើមទុនដំបូង៖ ", True), ("$50.00 ដុល្លារអាមេរិក (សម្រាប់ការអភិវឌ្ឍប្រព័ន្ធ និងប្រតិបត្តិការដំបូង)\n", False),
        ("កាលបរិច្ឆេទចាប់ផ្តើម៖ ", True), ("ត្រីមាសទី៣ ឆ្នាំ ២០២៦ (ឆ្នាំនេះ)\n", False),
        ("រៀបចំដោយ៖ ", True), ("គណៈកម្មការប្រតិបត្តិ KWD\n", False),
        ("សម្រាប់៖ ", True), ("វិនិយោគិនយុទ្ធសាស្ត្រ និងដៃគូអាជីវកម្ម", False)
    ]
    
    for label, is_bold in meta_runs:
        r = p_meta.add_run(label)
        r.font.name = 'Google Sans'
        r.font.size = Pt(9.5)
        r.font.bold = is_bold
        
    setup_page_footer(doc)
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 2: EXECUTIVE SUMMARY (សេចក្តីសង្ខេបប្រតិបត្តិ)
    # ------------------------------------------
    add_heading_styled(doc, "២. សេចក្តីសង្ខេបប្រតិបត្តិ (Executive Summary)", level=1)
    
    doc.add_paragraph(
        "បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម (KWD) គឺជាវេទិកាសិក្សាអន្តរកម្មលើពពក (Software-as-a-Service - SaaS) "
        "ដែលត្រូវបានរចនាឡើងជាពិសេសដើម្បីដោះស្រាយបញ្ហាសុវត្ថិភាពចរាចរណ៍ និងការរៀបចំប្រឡងយកប័ណ្ណបើកបរនៅព្រះរាជាណាចក្រកម្ពុជា។ "
        "គម្រោងនេះចាប់ផ្តើមដំណើរការជាមួយដើមទុនដំបូងចំនួន $50 USD ដែលត្រូវបានបែងចែកទាំងស្រុងសម្រាប់ការទិញឧបករណ៍អភិវឌ្ឍន៍ "
        "ការចុះឈ្មោះឈ្មោះដែន (Domain) និងការផ្ទៀងផ្ទាត់សេវាកម្មពពកស្នូល ដោយកាត់បន្ថយរាល់ចំណាយរដ្ឋបាលមិនចាំបាច់ទាំងអស់។"
    )
    doc.add_paragraph(
        "តាមរយៈទស្សនវិស័យរបស់វិនិយោគិន KWD គឺជាទ្រព្យសកម្មបច្ចេកវិទ្យាដែលមានហានិភ័យទាប និងអត្រាចំណេញខ្ពស់បំផុត។ "
        "ប្រព័ន្ធនេះដំណើរការដោយប្រើ Next.js និង PostgreSQL ធានាបាននូវដំណើរការឆ្លើយសំណួរលឿន និងការគ្រប់គ្រងការជាវដោយដៃ (Manual Subscriptions) "
        "ដោយមិនឆ្លងកាត់ច្រកទូទាត់ប្រាក់ស្វ័យប្រវត្តិនាដំណាក់កាលដំបូង ដើម្បីការពារការបោកប្រាស់ និងកាត់បន្ថយថ្លៃសេវាប្រតិបត្តិការ។ "
        "អាជីវកម្មនេះរំពឹងថានឹងទទួលបានប្រាក់ចំណេញឡើងវិញយ៉ាងរហ័ស និងពង្រីកសេវាកម្មទៅជាបណ្តាញទិន្នន័យចរាចរណ៍ថ្នាក់ជាតិក្នុងរយៈពេលប្រាំឆ្នាំខាងមុខ។"
    )
    
    # ------------------------------------------
    # SECTION 3: ABSTRACT (សង្ខេបឯកសារ)
    # ------------------------------------------
    add_heading_styled(doc, "៣. សង្ខេបឯកសារ (Abstract)", level=1)
    
    doc.add_paragraph(
        "ឯកសារយុទ្ធសាស្ត្រនេះបង្ហាញលម្អិតពីផែនការអាជីវកម្ម និងស្ថាបត្យកម្មប្រតិបត្តិការរបស់ KWD — វេទិកាអប់រំសុវត្ថិភាពចរាចរណ៍ឌីជីថល "
        "សម្រាប់គ្រូបង្រៀនបើកបរ សាលាបង្រៀនបើកបរ និងបេក្ខជនរៀបចំប្រឡងយកប័ណ្ណបើកបរទូទាំងប្រទេស។ តាមរយៈការអនុវត្ត "
        "គំរូកំណត់តម្លៃជាវប្រចាំ (Subscription model) ជាមួយក្បួនដោះស្រាយសំណួរចៃដន្យ (Fisher-Yates Shuffling Seed) និងចិត្តវិទ្យាតម្លៃលេខសេស "
        "KWD ធានាបាននូវការលូតលាស់ហិរញ្ញវត្ថុប្រកបដោយនិរន្តរភាព និងអត្រារក្សាអតិថិជនខ្ពស់។ ក្នុងរយៈពេល ៥ ឆ្នាំ "
        "ប្រព័ន្ធនឹងកើនឡើងពីការប្រើប្រាស់គម្រោងគ្រូបង្រៀនឯករាជ្យរហូតដល់សាលារៀនធំៗ បង្កើតតម្លៃជីវិតអតិថិជន (LTV) ខ្ពស់ និងផ្តល់ឱកាសវិនិយោគដ៏មានប្រសិទ្ធភាព។"
    )
    
    add_hud_bar(doc, "core abstract metrics")
    make_callout_box(
        doc,
        "[HUD CALLOUT // សូចនាករស្នូលនៃឯកសារសង្ខេប]",
        "គំរូនៃការបង្កើតប្រព័ន្ធ KWD ប្រើប្រាស់ហេដ្ឋារចនាសម្ព័ន្ធ Next.js និង PostgreSQL ដែលធ្វើឱ្យការចំណាយប្រតិបត្តិការ Year 1 ត្រឹមតែ $50 USD "
        "ខណៈពេលដែលធានាបាននូវចំណែកទីផ្សារខ្ពស់ក្នុងចំណោមសាលាបង្រៀនបើកបរ។ ភាពរួចដើមត្រូវបានសម្រេចនៅក្នុងត្រីមាសទី៣ ឆ្នាំ២០២៦។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 4: TABLE OF CONTENTS (មាតិកា)
    # ------------------------------------------
    add_heading_styled(doc, "៤. មាតិកា (Table of Contents)", level=1)
    
    toc_items = [
        ("១. ទំព័រចំណងជើង (Title Page)", "1"),
        ("២. សេចក្តីសង្ខេបប្រតិបត្តិ (Executive Summary)", "2"),
        ("៣. សង្ខេបឯកសារ (Abstract)", "2"),
        ("៤. មាតិកា (Table of Contents)", "3"),
        ("៥. បញ្ហា និងឱកាសក្នុងទីផ្សារ (Problem & Opportunity)", "4"),
        ("៦. ទិដ្ឋភាពទូទៅនៃផលិតផល (Product Overview)", "4"),
        ("៧. ក្រុមគោលដៅ និងចំណែកទីផ្សារ (Target Audience)", "5"),
        ("៨. ការវិភាគទីផ្សារចរាចរណ៍ (Market Analysis)", "5"),
        ("៩. គំរូអាជីវកម្ម (Business Model)", "6"),
        ("១០. យុទ្ធសាស្ត្រកំណត់តម្លៃ (Pricing Strategy)", "6"),
        ("១១. យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់ (Marketing & Growth Strategy)", "7"),
        ("១២. ផែនការប្រតិបត្តិការ (Operations Plan)", "8"),
        ("១៣. ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា (Technology & Platform Overview)", "8"),
        ("១៤. ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥ (Financial Projections Year 1-5)", "9"),
        ("១៥. ការវិភាគហានិភ័យ និងវិធានការបង្ការ (Risk Analysis)", "10"),
        ("១៦. ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់ (Growth Roadmap)", "10"),
        ("១៧. សេចក្តីសង្ខេបការវិនិយោគ (Investment Summary)", "11"),
        ("១៨. សេចក្តីសន្និដ្ឋាន (Conclusion)", "11"),
        ("១៩. ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ (Appendix)", "12")
    ]
    
    for title, pg in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r_title = p.add_run(title)
        r_title.font.name = 'Google Sans'
        r_title.font.bold = True
        
        dots_count = 80 - len(title) - len(pg)
        if dots_count < 5:
            dots_count = 5
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = 'Google Sans'
        r_dots.font.color.rgb = RGBColor(140, 140, 140)
        
        r_pg = p.add_run(pg)
        r_pg.font.name = 'Google Sans'
        r_pg.font.bold = True
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 5: PROBLEM & OPPORTUNITY (បញ្ហា និងឱកាសក្នុងទីផ្សារ)
    # ------------------------------------------
    add_heading_styled(doc, "៥. បញ្ហា និងឱកាសក្នុងទីផ្សារ (Problem & Opportunity)", level=1)
    
    p = doc.add_paragraph()
    run_bold = p.add_run("បញ្ហាប្រឈមក្នុងទីផ្សារ៖ ")
    run_bold.bold = True
    p.add_run(
        "អត្រាគ្រោះថ្នាក់ចរាចរណ៍នៅព្រះរាជាណាចក្រកម្ពុជានៅតែស្ថិតក្នុងកម្រិតខ្ពស់ ដែលបណ្តាលមកពីកង្វះការយល់ដឹងច្បាស់លាស់ "
        "អំពីច្បាប់ និងសញ្ញាចរាចរណ៍។ ជាងនេះទៅទៀត វិធីសាស្ត្ររៀន និងប្រឡងយកប័ណ្ណបើកបរកាលពីមុនភាគច្រើនផ្អែកលើក្រដាស និងសៀវភៅ "
        "ដែលពិបាកចូលប្រើប្រាស់ ខ្វះលក្ខណៈអន្តរកម្ម និងមិនមានយន្តការពីរភាសា។ គ្រូបង្រៀន និងសាលាបង្រៀនបើកបរ ជួបការលំបាក "
        "ក្នុងការតាមដាន វាយតម្លៃ និងវាស់ស្ទង់ចំណុចខ្សោយរបស់សិស្សម្នាក់ៗ ដែលនាំឱ្យអត្រាប្រឡងជាប់ទាប និងចំណាយពេលវេលាច្រើន។"
    )
    
    p2 = doc.add_paragraph()
    run_bold2 = p2.add_run("ឱកាសយុទ្ធសាស្ត្រ៖ ")
    run_bold2.bold = True
    p2.add_run(
        "ក្រសួងសាធារណការ និងដឹកជញ្ជូនបាន និងកំពុងរឹតបន្តឹងលើការផ្ទៀងផ្ទាត់ និងការប្រឡងយកប័ណ្ណបើកបរផ្លូវការយ៉ាងតឹងរ៉ឹង។ "
        "ការណ៍នេះបានបង្ខំឱ្យសាលាបង្រៀនបើកបរទាំងអស់ ត្រូវស្វែងរកឧបករណ៍សិក្សាឌីជីថលទំនើប ដើម្បីបង្កើនកិត្យានុភាព "
        "និងអត្រាប្រឡងជាប់របស់សិស្ស។ កង្វះវេទិកាគ្រប់គ្រងថ្នាក់រៀន (LMS) សម្រាប់ច្បាប់ចរាចរណ៍នៅកម្ពុជា គឺជាឱកាសដ៏ធំធេង "
        "សម្រាប់ KWD ក្នុងការផ្តល់នូវសេវាកម្មជាវប្រចាំបែបបច្ចេកវិទ្យា (B2B SaaS) ដែលដោះស្រាយបញ្ហាទាំងគ្រូ និងសិស្សក្នុងពេលតែមួយ។"
    )
    
    # ------------------------------------------
    # SECTION 6: PRODUCT OVERVIEW (ទិដ្ឋភាពទូទៅនៃផលិតផល)
    # ------------------------------------------
    add_heading_styled(doc, "៦. ទិដ្ឋភាពទូទៅនៃផលិតផល (Product Overview)", level=1)
    
    doc.add_paragraph(
        "KWD គឺជាវេទិកាសិក្សាសុវត្ថិភាពចរាចរណ៍ និងរៀបចំប្រឡងយកប័ណ្ណបើកបរដ៏ទូលំទូលាយ ដែលមានមុខងារសំខាន់ៗរៀបចំឡើងជា ៣ សសរស្តម្ភគ្រឹះ៖"
    )
    
    pillars = [
        ("រៀន (Learn)៖ ", "ផ្តល់នូវមេរៀន សញ្ញាចរាចរណ៍ និងច្បាប់ចរាចរណ៍ជាពីរភាសា (ខ្មែរ និងអង់គ្លេស) អមដោយរូបភាព និងសំឡេងពន្យល់ច្បាស់ៗ ដើម្បីជួយសិស្សឱ្យងាយយល់ និងចងចាំ។"),
        ("អនុវត្ត (Practice)៖ ", "ប្រព័ន្ធសំណួរ និងលំហាត់អនុវត្តដោយខ្លួនឯង ដែលប្រើប្រាស់ក្បួនដោះស្រាយ Fisher-Yates ដើម្បីសាប់សំណួរចៃដន្យ ធានាថាសិស្សទទួលបានបទពិសោធន៍តេស្តថ្មី និងមិនអាចទន្ទេញចម្លើយបាន។"),
        ("ប្រកួត (Compete)៖ ", "ប្រព័ន្ធប្រកួតផ្ទាល់ក្នុងថ្នាក់ (Live Classroom Sessions) ដែលអនុញ្ញាតឱ្យគ្រូបង្រៀនបង្កើតបន្ទប់ប្រកួត ហើយសិស្សទាំងអស់ឆ្លើយសំណួរប្រកួតគ្នាក្នុងពេលជាក់ស្តែង (Real-time) តាមរយៈ Pusher។")
    ]
    for pref, text in pillars:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    doc.add_paragraph(
        "លើសពីនេះ វេទិកាមានរួមបញ្ចូល Suar AI ដែលជាជំនួយការសិក្សាឆ្លាតវៃ ឆ្លើយតបរាល់ចម្ងល់ច្បាប់ចរាចរណ៍របស់សិស្សភ្លាមៗ "
        "ដោយផ្អែកលើឯកសារច្បាប់ផ្លូវការ ជៀសវាងការបង្កើតព័ត៌មានមិនត្រឹមត្រូវ។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 7: TARGET AUDIENCE (ក្រុមគោលដៅ និងចំណែកទីផ្សារ)
    # ------------------------------------------
    add_heading_styled(doc, "៧. ក្រុមគោលដៅ និងចំណែកទីផ្សារ (Target Audience)", level=1)
    
    doc.add_paragraph(
        "KWD បម្រើប្រព័ន្ធអេកូឡូស៊ីអប់រំចរាចរណ៍ទាំងមូល ដោយផ្តោតលើក្រុមគោលដៅសំខាន់ៗ និងចំណែកទីផ្សារច្បាស់លាស់៖"
    )
    
    targets = [
        ("អ្នកប្រើប្រាស់ចម្បង (Primary Users)៖ ", "បេក្ខជនប្រឡងយកប័ណ្ណបើកបរ (ឡាន ម៉ូតូ និងឡានធំ) ដែលត្រូវការវេទិកាហ្វឹកហាត់សំណួរ និងចង់ប្រឡងជាប់នៅGovernment examដំបូង។"),
        ("អ្នកប្រើប្រាស់បន្ទាប់បន្សំ (Secondary Users)៖ ", "គ្រូបង្រៀនបើកបរឯករាជ្យ និងសាលាបង្រៀនបើកបរ ដែលត្រូវការឧបករណ៍ទំនើប ដើម្បីគ្រប់គ្រងថ្នាក់ តាមដានសិស្ស និងកាត់បន្ថយពេលវេលាពន្យល់ដោយដៃ។"),
        ("ចំណែកទីផ្សារ (Customer Segments)៖ ", "សាលាបង្រៀនបើកបរកម្រិតមធ្យម និងកម្រិតអាជីវកម្មទូទាំង ២៥ ខេត្ត-ក្រុង ដែលចង់បានដំណោះស្រាយឌីជីថល (LMS) ក្រោមស្លាកយីហោផ្ទាល់ខ្លួន (White-label)។"),
        ("សម្មតិកម្មកំណើន (User Growth Assumptions)៖ ", "កំណើនអ្នកប្រើប្រាស់នឹងកើនឡើងយ៉ាងលឿនតាមរយៈបណ្តាញសាលាដៃគូ (B2B2C) និងយន្តការចែករំលែកកាតលទ្ធផលសិក្សា (Save Card) របស់សិស្សលើបណ្តាញសង្គម Telegram និង Facebook។")
    ]
    for pref, text in targets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    add_hud_bar(doc, "target audience profile")
    make_callout_box(
        doc,
        "[HUD CALLOUT // របាយការណ៍ក្រុមគោលដៅ]",
        "សាលាបង្រៀនបើកបរដៃគូត្រូវបានជ្រើសរើសជាច្រកផ្លូវចម្បងដើម្បីទាក់ទាញសិស្ស ដោយសារសាលានីមួយៗមានសិស្សចុះឈ្មោះរាប់រយនាក់ "
        "ក្នុងមួយខែៗ។ ការណ៍នេះធ្វើឱ្យថ្លៃដើមទាក់ទាញអតិថិជន (CAC) មានកម្រិតទាបបំផុត ($0.15 ក្នុងឆ្នាំទី១)។"
    )
    
    # ------------------------------------------
    # SECTION 8: MARKET ANALYSIS (ការវិភាគទីផ្សារចរាចរណ៍)
    # ------------------------------------------
    add_heading_styled(doc, "៨. ការវិភាគទីផ្សារចរាចរណ៍ (Market Analysis)", level=1)
    
    doc.add_paragraph(
        "ទីផ្សារអប់រំ និងបណ្តុះបណ្តាលបើកបរនៅព្រះរាជាណាចក្រកម្ពុជា កំពុងមានសន្ទុះខ្លាំង ដោយសារកំណើនប្រជាជន កំណើនយានយន្ត "
        "និងការរឹតបន្តឹងលើការអនុវត្តច្បាប់ពីសំណាក់អាជ្ញាធរជាតិ។ យោងតាមស្ថិតិផ្លូវការ មានសាលាបង្រៀនបើកបរចុះបញ្ជីត្រឹមត្រូវ "
        "រាប់រយទីតាំងទូទាំងប្រទេស ហើយសិស្សានុសិស្សរាប់ម៉ឺននាក់ត្រូវប្រឡងទ្រឹស្តីច្បាប់ចរាចរណ៍ជារៀងរាល់ខែ។"
    )
    doc.add_paragraph(
        "ការវិភាគលើគូប្រជែងបង្ហាញថា ភាគច្រើននៅតែប្រើប្រាស់វិធីសាស្ត្រសិក្សាបែបប្រពៃណី (ក្រដាស និងសៀវភៅ) ឬកម្មវិធីទូរស័ព្ទ "
        "ដែលមិនមានប្រព័ន្ធគ្រប់គ្រងសិស្សសម្រាប់គ្រូ និងខ្វះអន្តរកម្ម។ KWD ទទួលបានអត្ថប្រយោជន៍ប្រកួតប្រជែងយ៉ាងខ្លាំង "
        "តាមរយៈការផ្តល់ជូននូវវេទិកា LMS ពេញលេញ និងការរួមបញ្ចូលបច្ចេកវិទ្យា AI ជំនួយការសិក្សា ដែលគូប្រជែងដទៃទៀតពុំទាន់មាន។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 9: BUSINESS MODEL (គំរូអាជីវកម្ម)
    # ------------------------------------------
    add_heading_styled(doc, "៩. គំរូអាជីវកម្ម (Business Model)", level=1)
    
    doc.add_paragraph(
        "KWD ដំណើរការតាមគំរូអាជីវកម្មបែបជាវប្រចាំ (B2B SaaS Subscription Model) ជាមួយយុទ្ធសាស្ត្រលូតលាស់ច្បាស់លាស់៖"
    )
    
    biz_model = [
        ("យុទ្ធសាស្ត្រ Freemium៖ ", "សិស្សអាចចុះឈ្មោះសិក្សា អនុវត្តសំណួរចៃដន្យ និងមើលសញ្ញាចរាចរណ៍ដោយឥតគិតថ្លៃ ១០០%។ ការណ៍នេះធានាបាននូវការកើនឡើងចំនួនអ្នកប្រើប្រាស់ប្រព័ន្ធយ៉ាងលឿន និងបង្កើតស្ថិតិទិន្នន័យសិក្សា។"),
        ("ប្រភពចំណូលពីការជាវប្រចាំ (Subscriptions)៖ ", "គ្រូបង្រៀន និងសាលាបង្រៀនបើកបរ បង់ថ្លៃសេវាប្រចាំខែ ដើម្បីទទួលបានសិទ្ធិបង្កើតថ្នាក់រៀន បញ្ចូលសិស្ស តាមដានវឌ្ឍនភាព និងដក Branding របស់ KWD ចេញពីកាតលទ្ធផល។"),
        ("ឱកាសលក់បន្ថែម (Upsell Opportunities)៖ ", "ការផ្តល់ជូនសេវាកម្មបន្ថែម ដូចជាការគ្រប់គ្រងមាតិកាផ្ទាល់ខ្លួនរបស់សាលារៀន គណនីគ្រូបង្រៀនច្រើននាក់ និងការរៀបចំរង្វាន់លើកទឹកចិត្តសិស្សជាក់ស្តែងក្នុងប្រព័ន្ធ។"),
        ("ឱកាសសហគ្រាស (Enterprise Opportunities)៖ ", "ការផ្តល់អាជ្ញាបណ្ណដាច់ដោយឡែក (Self-hosted/Dedicated Server) សម្រាប់សហគ្រាសដឹកជញ្ជូនខ្នាតធំ សាលាបង្រៀនបើកបរធំៗដែលមានសាខាច្រើន ឬស្ថាប័នរដ្ឋាភិបាលដែលចង់បានប្រព័ន្ធសុវត្ថិភាពចរាចរណ៍ផ្ទាល់ខ្លួន។")
    ]
    for pref, text in biz_model:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    # ------------------------------------------
    # SECTION 10: PRICING STRATEGY (យុទ្ធសាស្ត្រកំណត់តម្លៃ)
    # ------------------------------------------
    add_heading_styled(doc, "១០. យុទ្ធសាស្ត្រកំណត់តម្លៃ (Pricing Strategy)", level=1)
    
    doc.add_paragraph(
        "យុទ្ធសាស្ត្រកំណត់តម្លៃរបស់ KWD ត្រូវបានរៀបចំឡើងយ៉ាងហ្មត់ចត់ ដើម្បីធានាបាននូវអត្រាបំលែង (Conversion Rate) ខ្ពស់បំផុត និងអត្ថប្រយោជន៍អាជីវកម្មយូរអង្វែង៖"
    )
    
    price_details = [
        ("ចិត្តវិទ្យាតម្លៃលេខសេស (Odd Pricing Psychology)៖ ", "តម្លៃគម្រោងគ្រូបង្រៀន (Teacher Pro) ត្រូវបានកំណត់ត្រឹម $9.99/ខែ និងគម្រោងសាលារៀន (School Plan) ត្រឹម $49.99/ខែ។ ការកំណត់នេះជួយកាត់បន្ថយអារម្មណ៍ស្ទាក់ស្ទើរក្នុងការសម្រេចចិត្តទិញ និងបង្កើនការយល់ឃើញអំពីភាពសន្សំសំចៃ។"),
        ("ការលក់ផ្អែកលើតម្លៃ និងអត្ថប្រយោជន៍ (Value-based & Benefits-focused)៖ ", "យើងមិនលក់លក្ខណៈបច្ចេកវិទ្យា ឬលក្ខណៈកូដប្រព័ន្ធឡើយ។ យើងលក់ «ភាពជឿជាក់របស់សិស្ស អត្រាប្រឡងជាប់ខ្ពស់ (៩២%+) និងកេរ្តិ៍ឈ្មោះសាលា»។ សាលាបង្រៀនបើកបរអាចកាត់កងថ្លៃជាវនេះបានយ៉ាងងាយ តាមរយៈការគិតថ្លៃសេវារៀបចំទ្រឹស្តីបន្ថែមបន្តិចបន្តួចពីសិស្ស (ឧទាហរណ៍ $1 ក្នុងម្នាក់)។"),
        ("យុទ្ធសាស្ត្ររក្សាអតិថិជន (Customer Retention Strategy)៖ ", "ការផ្តល់ការសាកល្បងគម្រោង Teacher Pro រយៈពេល ៣០ ថ្ងៃដោយឥតគិតថ្លៃ និងការបញ្ចុះតម្លៃ ២០% សម្រាប់ការបង់ប្រាក់ជាកញ្ចប់ប្រចាំឆ្នាំ ដើម្បីរក្សាលំហូរចំណូលឱ្យមានស្ថិរភាព។")
    ]
    for pref, text in price_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    add_heading_styled(doc, "តារាងប្រៀបធៀបមុខងារ និងតម្លៃគម្រោងជាវ", level=2)
    
    pricing_data = [
        ["គម្រោងជាវ (Plan Tier)", "តម្លៃប្រចាំខែ (Price)", "កូតាសិស្ស (Students)", "កូតាថ្នាក់រៀន (Classes)", "សិទ្ធិ និងមុខងារសំខាន់ៗ (Features)"],
        ["Free Plan", "$0.00 / ខែ", "០ នាក់", "០ ថ្នាក់", "រៀន និងអនុវត្តទ្រឹស្តីតែម្នាក់ឯង, មើលសញ្ញាចរាចរណ៍"],
        ["Teacher Pro", "$9.99 / ខែ", "៥០ នាក់", "៥ ថ្នាក់", "ប្រព័ន្ធគ្រប់គ្រងសិស្ស, របាយការណ៍ស្ថិតិ, ខ្លឹមសារផ្ទាល់ខ្លួន"],
        ["School Plan", "$49.99 / ខែ", "មិនកំណត់", "មិនកំណត់", "គ្រូ ១០ នាក់, ដក Branding KWD ចេញ, ជំនួយអាទិភាព ២៤/៧"],
        ["Enterprise Plan", "តម្លៃចរចា", "តាមការកំណត់", "តាមការកំណត់", "Dedicated Server, ការរួមបញ្ចូល API, មុខងាររចនាតាមតម្រូវការ"]
    ]
    
    table = doc.add_table(rows=len(pricing_data), cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    
    widths = [Inches(1.2), Inches(1.1), Inches(1.1), Inches(1.1), Inches(2.0)]
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths[j]
            cell.text = pricing_data[i][j]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 11: MARKETING & GROWTH STRATEGY (យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់)
    # ------------------------------------------
    add_heading_styled(doc, "១១. យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់ (Marketing & Growth Strategy)", level=1)
    
    doc.add_paragraph(
        "KWD អនុវត្តយុទ្ធសាស្ត្រទីផ្សារ B2B ផ្តោតលើភាពជាក់ស្តែង និងការចំណាយទាប ដើម្បីសម្រេចបាននូវការលូតលាស់យ៉ាងលឿន៖"
    )
    
    marketing_details = [
        ("បណ្តាញទាក់ទាញអតិថិជន (Acquisition Channels)៖ ", "ការជួបពិភាក្សាផ្ទាល់ជាមួយម្ចាស់សាលាបង្រៀនបើកបរ ការផ្តល់បទបង្ហាញពីអត្ថប្រយោជន៍ប្រព័ន្ធ និងការចូលរួមក្នុងយុទ្ធនាការសុវត្ថិភាពចរាចរណ៍របស់រដ្ឋ។"),
        ("ប្រព័ន្ធណែនាំបន្ត (Referral System)៖ ", "ការផ្តល់ជូនការប្រើប្រាស់ឥតគិតថ្លៃ ២ ខែ ដល់សាលាបង្រៀនបើកបរណា ដែលណែនាំសាលាបង្រៀនបើកបរផ្សេងទៀតឱ្យចុះឈ្មោះប្រើប្រាស់គម្រោងបង់ប្រាក់របស់ KWD។"),
        ("ទីផ្សារខ្លឹមសារ និងសហគមន៍ (Content & Community Growth)៖ ", "ការផលិតវីដេអូខ្លីៗពន្យល់ពីគន្លឹះចរាចរណ៍ និងការប្រឡង ព្រមទាំងការបង្កើតសហគមន៍សួរ-ឆ្លើយច្បាប់ចរាចរណ៍លើ Telegram ដើម្បីទាក់ទាញសិស្សឱ្យមកប្រើប្រាស់ទំព័រ Play ឥតគិតថ្លៃ។"),
        ("ភាពជាដៃគូ (Partnership Opportunities)៖ ", "កិច្ចសហការជាមួយសហព័ន្ធសាលាបង្រៀនបើកបរ ឬនាយកដ្ឋានសុវត្ថិភាពចរាចរណ៍ ដើម្បីទទួលបានការបញ្ជាក់ និងការណែនាំផ្លូវការពីស្ថាប័នរដ្ឋ។"),
        ("លំហូរការបំលែង (Conversion Funnel)៖ ", "សិស្សប្រើប្រាស់ឥតគិតថ្លៃ -> គ្រូចុះឈ្មោះសាកល្បង ៣០ ថ្ងៃ -> សិស្សទទួលបានអត្រាប្រឡងជាប់ខ្ពស់ -> សាលារៀនសម្រេចចិត្តជាវគម្រោង School Plan ដើម្បីពង្រឹងយីហោរបស់ខ្លួន។")
    ]
    for pref, text in marketing_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    # ------------------------------------------
    # SECTION 12: OPERATIONS PLAN (ផែនការប្រតិបត្តិការ)
    # ------------------------------------------
    add_heading_styled(doc, "១២. ផែនការប្រតិបត្តិការ (Operations Plan)", level=1)
    
    doc.add_paragraph(
        "ដើម្បីរក្សាបាននូវភាពសាមញ្ញ និងការចំណាយប្រតិបត្តិការទាបបំផុត KWD អនុវត្តផែនការប្រតិបត្តិការដូចខាងក្រោម៖"
    )
    
    ops_details = [
        "ការទូទាត់ និងការបើកគណនីដោយដៃ៖ សាលាបង្រៀនផ្ទេរប្រាក់ផ្ទាល់តាមរយៈធនាគារ ABA ហើយផ្ញើវិក្កយបត្រមកកាន់ក្រុមការងារ។ ប្រព័ន្ធគ្រប់គ្រង (Admin) នឹងធ្វើការផ្ទៀងផ្ទាត់ និងបើកដំណើរការគម្រោងដោយដៃ។ យន្តការនេះជួយជៀសវាងការបោកប្រាស់ និងថ្លៃសេវាច្រកទូទាត់ដំបូង។",
        "ការត្រួតពិនិត្យ និងគ្រប់គ្រងខ្លឹមសារ៖ បុគ្គលិក KWD (Staff) ផលិតសំណួរ និងខ្លឹមសារថ្មីៗ រួចដាក់ជូនអ្នកគ្រប់គ្រង (Admin) ពិនិត្យ និងអនុម័ត មុននឹងបោះផ្សាយជាសាធារណៈ។",
        "ការគាំទ្របច្ចេកទេស និងការថែទាំ៖ ក្រុមការងារបច្ចេកទេសតាមដានស្ថានភាពម៉ាស៊ីនមេ និងផ្តល់ជំនួយដល់សាលារៀនជាវប្រចាំភ្លាមៗតាមរយៈក្រុម Telegram ជំនួយការរបស់ KWD។"
    ]
    for text in ops_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        bp.add_run(text)
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 13: TECHNOLOGY & PLATFORM OVERVIEW (ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា)
    # ------------------------------------------
    add_heading_styled(doc, "១៣. ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា (Technology & Platform Overview)", level=1)
    
    doc.add_paragraph(
        "KWD ត្រូវបានសាងសង់ឡើងលើស្ថាបត្យកម្មលំដាប់ឧស្សាហកម្ម ដែលធានាបាននូវល្បឿន និងសុវត្ថិភាពខ្ពស់បំផុត៖"
    )
    
    tech_data = [
        ["ស្រទាប់ប្រព័ន្ធ (Layer)", "បច្ចេកវិទ្យា (Technology)", "តួនាទីក្នុងវេទិកា KWD (Role)"],
        ["Frontend (ស្រទាប់បង្ហាញ)", "Next.js · React · Tailwind CSS", "បង្ហាញចំណុចប្រទាក់អ្នកប្រើ និងគ្រប់គ្រងបទពិសោធន៍សិក្សាល្បឿនលឿន"],
        ["ពហុភាសា (Localization)", "next-intl", "គាំទ្រការប្រើប្រាស់ជាភាសាខ្មែរ និងអង់គ្លេសយ៉ាងរលូន"],
        ["Backend (ស្រទាប់ដំណើរការ)", "Next.js Server Actions & API Routes", "គ្រប់គ្រងតក្កវិជ្ជាអាជីវកម្ម ការពិនិត្យសិទ្ធិចូលប្រើប្រាស់ និងកូតា"],
        ["Database (ទិន្នន័យ)", "PostgreSQL (Neon) · Drizzle ORM", "ផ្ទុកទិន្នន័យសិស្ស ថ្នាក់រៀន និងស្ថិតិសិក្សាប្រកបដោយសុវត្ថិភាព"],
        ["Real-time (ផ្សាយផ្ទាល់)", "Pusher", "ផ្សាយលទ្ធផលប្រឡង និងលំដាប់ពិន្ទុភ្លាមៗសម្រាប់វគ្គប្រកួតក្នុងថ្នាក់"],
        ["មេឌៀ (Media Storage)", "Cloudinary", "ផ្ទុក និងគ្រប់គ្រងរូបភាពសញ្ញាចរាចរណ៍ និងសំឡេងមេរៀន"],
        ["បញ្ញាសិប្បនិមិត្ត (AI)", "Gemini API (Suar AI)", "ជំនួយការសិក្សាឆ្លើយសំណួរច្បាប់ចរាចរណ៍ផ្អែកលើខ្លឹមសារផ្លូវការ"],
        ["ការដាក់ដំណើរការ", "Vercel", "ផ្សព្វផ្សាយ និងបម្រើវេទិកាជាសកលជាមួយយន្តការការពារសុវត្ថិភាពខ្ពស់"]
    ]
    
    table_tech = doc.add_table(rows=len(tech_data), cols=3)
    table_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_tech.autofit = False
    set_table_borders(table_tech)
    
    widths_tech = [Inches(1.8), Inches(2.0), Inches(2.7)]
    for i, row in enumerate(table_tech.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_tech[j]
            cell.text = tech_data[i][j]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    # ------------------------------------------
    # SECTION 14: FINANCIAL PROJECTIONS (YEAR 1–5) (ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥)
    # ------------------------------------------
    add_heading_styled(doc, "១៤. ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥ (Financial Projections Year 1-5)", level=1)
    
    doc.add_paragraph(
        "គំរូហិរញ្ញវត្ថុរបស់ KWD បង្ហាញពីកំណើនចំណូលដ៏ឆាប់រហ័ស គួបផ្សំនឹងការរក្សាបាននូវភាគរយចំណេញខ្ពស់បំផុត "
        "ដោយសារតែការចំណាយលើហេដ្ឋារចនាសម្ព័ន្ធបច្ចេកវិទ្យាដំបូងមានកម្រិតទាបបំផុត ($50.00 USD)។ អាជីវកម្មត្រូវបាន "
        "ព្យាករណ៍ថានឹងទទួលបានការទូទាត់ថ្លៃជាវ និងទទួលបានចំណេញចាប់ពីខែដំបូងនៃការដំណើរការអាជីវកម្ម។"
    )
    
    # Insert Matplotlib growth chart
    p_chart = doc.add_paragraph()
    p_chart.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_chart = p_chart.add_run()
    run_chart.add_picture(CHART_PATH, width=Inches(6.0))
    
    p_cap2 = doc.add_paragraph()
    p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap2.paragraph_format.space_after = Pt(12)
    run_cap2 = p_cap2.add_run("រូបភាពទី ១៖ ការព្យាករណ៍កំណើនចំនួនអ្នកជាវប្រចាំ និងចំណូលប្រចាំខែ (MRR) ក្នុងរយៈពេល ៥ ឆ្នាំ")
    run_cap2.font.name = 'Google Sans'
    run_cap2.font.italic = True
    run_cap2.font.size = Pt(9)
    
    doc.add_paragraph()
    run_bold = doc.add_paragraph().add_run("ការវិភាគចំណុចរួចដើម (Break-even Analysis)៖ ")
    run_bold.bold = True
    doc.add_paragraph(
        "ដោយសារតែចំណាយវិនិយោគដំបូងមានត្រឹមតែ $50 USD សម្រាប់ការជាវឧបករណ៍ និងដែន (Domain) ការលក់គម្រោងសាលារៀន (School Plan) "
        "តែមួយគណនី ($49.99/ខែ) គឺគ្រប់គ្រាន់ដើម្បីឱ្យអាជីវកម្មរួចដើមទាំងស្រុងនៅក្នុងខែដំបូង។ រាល់ការលក់បន្ទាប់ពីនោះ "
        "គឺជាប្រាក់ចំណេញសុទ្ធ ដែលធ្វើឱ្យ KWD ក្លាយជាម៉ាស៊ីនបង្កើតចំណូលប្រកបដោយប្រសិទ្ធភាពខ្ពស់។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 15: RISK ANALYSIS (ការវិភាគហានិភ័យ និងវិធានការបង្ការ)
    # ------------------------------------------
    add_heading_styled(doc, "១៥. ការវិភាគហានិភ័យ និងវិធានការបង្ការ (Risk Analysis)", level=1)
    
    doc.add_paragraph(
        "ដើម្បីធានាបាននូវនិរន្តរភាពអាជីវកម្ម គណៈកម្មការប្រតិបត្តិ KWD បានកំណត់អត្តសញ្ញាណហានិភ័យ និងរៀបចំវិធានការបង្ការទុកជាមុន៖"
    )
    
    risks_data = [
        ["ប្រភេទហានិភ័យ (Risk Type)", "ការពិពណ៌នា (Description)", "វិធានការបង្ការ / ដំណោះស្រាយ (Mitigation)"],
        ["ហានិភ័យបច្ចេកទេស", "ម៉ាស៊ីនមេគាំង ឬបាត់បង់ទិន្នន័យសិស្ស និងសាលារៀន", "ប្រើសេវាកម្មពពកស្វ័យប្រវត្តិកម្រិតខ្ពស់ និងអនុវត្តការ Backup រាល់ ២៤ ម៉ោង"],
        ["ហានិភ័យនៃការជាវដោយដៃ", "ការយឺតយ៉ាវក្នុងការផ្ទៀងផ្ទាត់ និងបើកគណនី", "បង្កើតប្រព័ន្ធប្រកាសដំណឹងស្វ័យប្រវត្តិទៅកាន់ Admin តាម Telegram Bot"],
        ["ការប្រកួតប្រជែងតម្លៃ", "គូប្រជែងលេចឡើង និងលក់តម្លៃទាបជាង KWD", "ផ្តោតលើគុណតម្លៃលទ្ធផលសិស្ស (Pass rate) និងសេវាថែទាំអតិថិជនពិសេស"],
        ["ភាពត្រឹមត្រូវនៃមាតិកា", "សំណួរច្បាប់ចរាចរណ៍មានកំហុស ឬមិនតម្រឹមតាមក្រសួង", "បង្កើតលំហូរការងារពិនិត្យសំណួរ ២ ដំណាក់កាល និងពិគ្រោះជាមួយនគរបាលចរាចរណ៍"]
    ]
    
    table_risk = doc.add_table(rows=len(risks_data), cols=3)
    table_risk.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_risk.autofit = False
    set_table_borders(table_risk)
    
    widths_risk = [Inches(1.8), Inches(2.2), Inches(2.5)]
    for i, row in enumerate(table_risk.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_risk[j]
            cell.text = risks_data[i][j]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    # ------------------------------------------
    # SECTION 16: GROWTH ROADMAP (ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់)
    # ------------------------------------------
    add_heading_styled(doc, "១៦. ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់ (Growth Roadmap)", level=1)
    
    doc.add_paragraph(
        "ផែនទីបង្ហាញផ្លូវរបស់ KWD ត្រូវបានបែងចែកជា ៣ ដំណាក់កាល ដើម្បីអភិវឌ្ឍអាជីវកម្ម និងពង្រីកឥទ្ធិពលសង្គម៖"
    )
    
    roadmap_phases = [
        ("ដំណាក់កាលទី ១៖ ចាប់ផ្តើម និងសាកល្បង B2B (២០២៦ - ២០២៧)៖ ", "ដាក់ឱ្យដំណើរការ Next.js ជាមួយដើមទុន $50.00។ ធ្វើដៃគូជាមួយសាលាបង្រៀនបើកបរ ១៥ ក្នុងរាជធានីភ្នំពេញ ដើម្បីបង្ហាញពីអត្រាប្រឡងជាប់របស់សិស្ស ៩២%+។"),
        ("ដំណាក់កាលទី ២៖ ពង្រីកថ្នាក់តំបន់ និងសមាហរណកម្ម API (២០២៨ - ២០២៩)៖ ", "ពង្រីកទៅខេត្តសៀមរាប បាត់ដំបង និងព្រះសីហនុ។ ដាក់ឱ្យប្រើប្រាស់ API សម្រាប់សាលាបង្រៀនបើកបរដើម្បីសមកាលកម្មទិន្នន័យសិស្ស និងប្រព័ន្ធរំលឹកបន្តគម្រោងស្វ័យប្រវត្តិ។"),
        ("ដំណាក់កាលទី ៣៖ ទិន្នន័យជាតិ និងសុវត្ថិភាពចរាចរណ៍ (២០៣០ - ២០៣១)៖ ", "សហការជាមួយមន្ទីរដឹកជញ្ជូនរាជធានី-ខេត្ត ដើម្បីផ្តល់អាជ្ញាបណ្ណទិន្នន័យសុវត្ថិភាពចរាចរណ៍ (កំណត់ថាតើសញ្ញាណាដែលសិស្សមិនសូវយល់) និងការវិភាគកម្រិតខ្ពស់។")
    ]
    for pref, text in roadmap_phases:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 17: INVESTMENT SUMMARY (សេចក្តីសង្ខេបការវិនិយោគ)
    # ------------------------------------------
    add_heading_styled(doc, "១៧. សេចក្តីសង្ខេបការវិនិយោគ (Investment Summary)", level=1)
    
    doc.add_paragraph(
        "KWD ត្រូវបានចាប់ផ្តើមឡើងក្រោមទម្រង់អាជីវកម្មខ្នាតតូច ជាមួយការចំណាយដំបូងត្រឹមតែ $50 USD។ គំរូនេះមាន "
        "អត្រាចំណេញដុលខ្ពស់បំផុត (> ៩៥% ក្នុងឆ្នាំទី៥)។ យើងកំពុងស្វែងរកដៃគូវិនិយោគយុទ្ធសាស្ត្រ ដើម្បីជួយជម្រុញ "
        "ការធ្វើទីផ្សារ B2B ឱ្យកាន់តែលឿន ការពង្រីកប្រព័ន្ធបច្ចេកវិទ្យា និងការអភិវឌ្ឍកម្មវិធីលើទូរស័ព្ទដៃ (Mobile App) ផ្លូវការ។"
    )
    doc.add_paragraph(
        "ដើមទុនដែលទទួលបានពីការវិនិយោគ នឹងត្រូវបានបែងចែកយ៉ាងជាក់លាក់ ៥០% សម្រាប់ការអភិវឌ្ឍប្រព័ន្ធ និងបច្ចេកវិទ្យា "
        "៣០% សម្រាប់យុទ្ធនាការលក់ B2B និង ២០% សម្រាប់ប្រតិបត្តិការគាំទ្រសាលារៀនដៃគូ។ វិនិយោគិននឹងទទួលបានការត្រឡប់មកវិញ "
        "នៃប្រាក់វិនិយោគ (ROI) យ៉ាងឆាប់រហ័ស តាមរយៈលំហូរចំណូលជាប្រចាំប្រចាំខែ (MRR) ដែលមានស្ថិរភាព។"
    )
    
    # ------------------------------------------
    # SECTION 18: CONCLUSION (សេចក្តីសន្និដ្ឋាន)
    # ------------------------------------------
    add_heading_styled(doc, "១៨. សេចក្តីសន្និដ្ឋាន (Conclusion)", level=1)
    
    doc.add_paragraph(
        "បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម (KWD) គឺជាការរួមបញ្ចូលគ្នាដ៏មានសក្តានុពលរវាង បច្ចេកវិទ្យា SaaS ទំនើប និង "
        "តម្រូវការជាក់ស្តែងនៃការអប់រំសុវត្ថិភាពចរាចរណ៍នៅកម្ពុជា។ តាមរយៈការចំណាយហេដ្ឋារចនាសម្ព័ន្ធដ៏ទាប និងគំរូជាវប្រចាំប្រកបដោយ "
        "ចិត្តវិទ្យា KWD មិនត្រឹមតែជាឱកាសអាជីវកម្មដែលមានផលចំណេញខ្ពស់ និងនិរន្តរភាពហិរញ្ញវត្ថុប៉ុណ្ណោះទេ ប៉ុន្តែថែមទាំងជាដំណោះស្រាយ "
        "ដ៏សំខាន់ក្នុងការកាត់បន្ថយគ្រោះថ្នាក់ចរាចរណ៍ និងលើកកម្ពស់វប្បធម៌បើកបរប្រកបដោយសុវត្ថិភាពនៅក្នុងសង្គមខ្មែរទាំងមូលផងដែរ។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 19: APPENDIX (ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ)
    # ------------------------------------------
    add_heading_styled(doc, "១៩. ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ (Appendix)", level=1)
    
    doc.add_paragraph(
        "តារាងខាងក្រោមបង្ហាញអំពីការព្យាករណ៍ទិន្នន័យប្រតិបត្តិការហិរញ្ញវត្ថុ និងសូចនាករអាជីវកម្មសំខាន់ៗរបស់ KWD "
        "ពីឆ្នាំទី១ ដល់ឆ្នាំទី៥ ដែលបញ្ជាក់ពីកំណើន និងប្រសិទ្ធភាពហិរញ្ញវត្ថុរបស់គម្រោង៖"
    )
    
    appendix_data = [
        ["សូចនាករហិរញ្ញវត្ថុ (Metrics)", "ឆ្នាំទី ១ (Year 1)", "ឆ្នាំទី ២ (Year 2)", "ឆ្នាំទី ៣ (Year 3)", "ឆ្នាំទី ៤ (Year 4)", "ឆ្នាំទី ៥ (Year 5)"],
        ["ចំនួនអ្នកជាវប្រចាំ (Subscribers)", "120 គណនី", "450 គណនី", "1,500 គណនី", "3,200 គណនី", "5,400 គណនី"],
        ["ចំណូលប្រចាំខែ (MRR)", "$1,198.80", "$4,495.50", "$14,985.00", "$31,968.00", "$53,946.00"],
        ["ចំណូលប្រចាំឆ្នាំ (ARR)", "$14,385.60", "$53,946.00", "$179,820.00", "$383,616.00", "$647,352.00"],
        ["ចំណាយប្រតិបត្តិការបច្ចេកទេស", "$50.00", "$300.00", "$1,000.00", "$1,800.00", "$2,400.00"],
        ["ចំណាយប្រតិបត្តិការសរុប", "$50.00", "$1,200.00", "$5,400.00", "$15,000.00", "$29,130.00"],
        ["ប្រាក់ចំណេញសុទ្ធ (Net Profit)", "$14,335.60", "$52,746.00", "$174,420.00", "$368,616.00", "$618,222.00"],
        ["ភាគរយចំណេញ (Margin)", "99.65%", "97.78%", "97.00%", "96.09%", "95.50%"],
        ["ថ្លៃដើមទាក់ទាញសិស្ស (CAC)", "$0.15", "$0.50", "$1.00", "$1.50", "$2.00"],
        ["តម្លៃជីវិតអតិថិជន (LTV)", "$120.00", "$150.00", "$180.00", "$210.00", "$240.00"]
    ]
    
    table_app = doc.add_table(rows=len(appendix_data), cols=6)
    table_app.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_app.autofit = False
    set_table_borders(table_app)
    
    widths_app = [Inches(2.1), Inches(0.9), Inches(0.9), Inches(0.9), Inches(0.9), Inches(0.9)]
    for i, row in enumerate(table_app.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_app[j]
            cell.text = appendix_data[i][j]
            set_cell_margins(cell, top=90, bottom=90, left=100, right=100)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if j == 0 else WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(8.5)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(24)
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_end = p_end.add_run("// បញ្ចប់របាយការណ៍ // ប្រព័ន្ធសុវត្ថិភាព // ការទាក់ទងទូរវាស់ស្ទង់ KWD ត្រូវបានបញ្ចប់ //")
    run_end.font.name = 'Google Sans'
    run_end.font.bold = True
    run_end.font.size = Pt(9.5)
    
    # ------------------------------------------
    # SECTION 7.1: INSERT DIAGRAM IN WORKFLOWS SECTION
    # ------------------------------------------
    # Locate Section 12 (Operations Plan) or Section 7 (Workflows & Performance Auditing, which is Section 12 here)
    # We will insert the workflow diagram in the Operations Plan section (Section 12)
    # Let's insert it before the Tech Overview
    # Actually, we can add it to the Technology & Platform Overview section or as part of the Operations Plan.
    # Let's insert the diagram in Section 12 (Operations Plan) as requested.
    # To do this in the document generation flow, let's locate where we build Section 12:
    # We will modify the code to insert the diagram right in the flow of doc building. Let's do that!
    
    # Wait, we already created the document structure. Let's add the image in Section 12 in the script!
    # Let's update the builder function below to insert the image properly.
    
    # Save document
    doc.save(DOCX_PATH)
    print(f"Business Plan generated successfully at {DOCX_PATH}")


def build_khmer_business_plan_v2():
    doc = Document()
    
    # 1-inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        
    # Set default style font to Google Sans
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Google Sans'
    normal_style.font.size = Pt(10.5)
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.line_spacing = 1.15
    
    # ------------------------------------------
    # SECTION 1: TITLE PAGE (ទំព័រចំណងជើង)
    # ------------------------------------------
    for _ in range(2):
        doc.add_paragraph()
        
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_logo = p_logo.add_run()
    run_logo.add_picture(LOGO_PATH, width=Inches(1.6))
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម")
    run_title.font.name = 'Google Sans'
    run_title.font.size = Pt(20)
    run_title.font.bold = True
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    run_sub = p_sub.add_run("ផែនការអាជីវកម្មយុទ្ធសាស្ត្រប្រាំឆ្នាំ (២០២៦ – ២០៣១) // កូដគម្រោង៖ KWD")
    run_sub.font.name = 'Google Sans'
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    
    for _ in range(4):
        doc.add_paragraph()
        
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.line_spacing = 1.3
    
    meta_runs = [
        ("វិសាលភាពពេលវេលា៖ ", True), ("ឆ្នាំ ២០២៦ – ២០៣១ (ការវិភាគការព្យាករណ៍ទៅមុខ)\n", False),
        ("ដើមទុនដំបូង៖ ", True), ("$50.00 ដុល្លារអាមេរិក (សម្រាប់ការអភិវឌ្ឍប្រព័ន្ធ និងប្រតិបត្តិការដំបូង)\n", False),
        ("កាលបរិច្ឆេទចាប់ផ្តើម៖ ", True), ("ត្រីមាសទី៣ ឆ្នាំ ២០២៦ (ឆ្នាំនេះ)\n", False),
        ("รៀបចំដោយ៖ ", True), ("គណៈកម្មការប្រតិបត្តិ KWD\n", False),
        ("សម្រាប់៖ ", True), ("វិនិយោគិនយុទ្ធសាស្ត្រ និងដៃគូអាជីវកម្ម", False)
    ]
    
    for label, is_bold in meta_runs:
        r = p_meta.add_run(label)
        r.font.name = 'Google Sans'
        r.font.size = Pt(9.5)
        r.font.bold = is_bold
        
    setup_page_footer(doc)
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 2: EXECUTIVE SUMMARY (សេចក្តីសង្ខេបប្រតិបត្តិ)
    # ------------------------------------------
    add_heading_styled(doc, "២. សេចក្តីសង្ខេបប្រតិបត្តិ (Executive Summary)", level=1)
    
    doc.add_paragraph(
        "បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម (KWD) គឺជាវេទិកាសិក្សាអន្តរកម្មលើពពក (Software-as-a-Service - SaaS) "
        "ដែលត្រូវបានរចនាឡើងជាពិសេសដើម្បីដោះស្រាយបញ្ហាសុវត្ថិភាពចរាចរណ៍ និងការរៀបចំប្រឡងយកប័ណ្ណបើកបរនៅព្រះរាជាណាចក្រកម្ពុជា។ "
        "គម្រោងនេះចាប់ផ្តើមដំណើរការជាមួយដើមទុនដំបូងចំនួន $50 USD ដែលត្រូវបានបែងចែកទាំងស្រុងសម្រាប់ការទិញឧបករណ៍អភិវឌ្ឍន៍ "
        "ការចុះឈ្មោះឈ្មោះដែន (Domain) និងការផ្ទៀងផ្ទាត់សេវាកម្មពពកស្នូល ដោយកាត់បន្ថយរាល់ចំណាយរដ្ឋបាលមិនចាំបាច់ទាំងអស់។"
    )
    doc.add_paragraph(
        "តាមរយៈទស្សនវិស័យរបស់វិនិយោគិន KWD គឺជាទ្រព្យសកម្មបច្ចេកវិទ្យាដែលមានហានិភ័យទាប និងអត្រាចំណេញខ្ពស់បំផុត។ "
        "ប្រព័ន្ធនេះដំណើរការដោយប្រើ Next.js និង PostgreSQL ធានាបាននូវដំណើរការឆ្លើយសំណួរលឿន និងការគ្រប់គ្រងការជាវដោយដៃ (Manual Subscriptions) "
        "ដោយមិនឆ្លងកាត់ច្រកទូទាត់ប្រាក់ស្វ័យប្រវត្តិនាដំណាក់កាលដំបូង ដើម្បីការពារការបោកប្រាស់ និងកាត់បន្ថយថ្លៃសេវាប្រតិបត្តិការ។ "
        "អាជីវកម្មនេះរំពឹងថានឹងទទួលបានប្រាក់ចំណេញឡើងវិញយ៉ាងរហ័ស និងពង្រីកសេវាកម្មទៅជាបណ្តាញទិន្នន័យចរាចរណ៍ថ្នាក់ជាតិក្នុងរយៈពេលប្រាំឆ្នាំខាងមុខ។"
    )
    
    # ------------------------------------------
    # SECTION 3: ABSTRACT (សង្ខេបឯកសារ)
    # ------------------------------------------
    add_heading_styled(doc, "៣. សង្ខេបឯកសារ (Abstract)", level=1)
    
    doc.add_paragraph(
        "ឯកសារយុទ្ធសាស្ត្រនេះបង្ហាញលម្អិតពីផែនការអាជីវកម្ម និងស្ថាបត្យកម្មប្រតិបត្តិការរបស់ KWD — វេទិកាអប់រំសុវត្ថិភាពចរាចរណ៍ឌីជីថល "
        "សម្រាប់គ្រូបង្រៀនបើកបរ សាលាបង្រៀនបើកបរ និងបេក្ខជនរៀបចំប្រឡងយកប័ណ្ណបើកបរទូទាំងប្រទេស។ តាមរយៈការអនុវត្ត "
        "គំរូកំណត់តម្លៃជាវប្រចាំ (Subscription model) ជាមួយក្បួនដោះស្រាយសំណួរចៃដន្យ (Fisher-Yates Shuffling Seed) និងចិត្តវិទ្យាតម្លៃលេខសេស "
        "KWD ធានាបាននូវការលូតលាស់ហិរញ្ញវត្ថុប្រកបដោយនិរន្តរភាព និងអត្រារក្សាអតិថិជនខ្ពស់។ ក្នុងរយៈពេល ៥ ឆ្នាំ "
        "ប្រព័ន្ធនឹងកើនឡើងពីការប្រើប្រាស់គម្រោងគ្រូបង្រៀនឯករាជ្យរហូតដល់សាលារៀនធំៗ បង្កើតតម្លៃជីវិតអតិថិជន (LTV) ខ្ពស់ និងផ្តល់ឱកាសវិនិយោគដ៏មានប្រសិទ្ធភាព។"
    )
    
    add_hud_bar(doc, "core abstract metrics")
    make_callout_box(
        doc,
        "[HUD CALLOUT // សូចនាករស្នូលនៃឯកសារសង្ខេប]",
        "គំរូនៃការបង្កើតប្រព័ន្ធ KWD ប្រើប្រាស់ហេដ្ឋារចនាសម្ព័ន្ធ Next.js និង PostgreSQL ដែលធ្វើឱ្យការចំណាយប្រតិបត្តិការ Year 1 ត្រឹមតែ $50 USD "
        "ខណៈពេលដែលធានាបាននូវចំណែកទីផ្សារខ្ពស់ក្នុងចំណោមសាលាបង្រៀនបើកបរ។ ភាពរួចដើមត្រូវបានសម្រេចនៅក្នុងត្រីមាសទី៣ ឆ្នាំ២០២៦។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 4: TABLE OF CONTENTS (មាតិកា)
    # ------------------------------------------
    add_heading_styled(doc, "៤. មាតិកា (Table of Contents)", level=1)
    
    # Set dot leader spacing explicitly
    for title, pg in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r_title = p.add_run(title)
        r_title.font.name = 'Google Sans'
        r_title.font.bold = True
        
        dots_count = 90 - len(title) - len(pg)
        if dots_count < 5:
            dots_count = 5
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = 'Google Sans'
        r_dots.font.color.rgb = RGBColor(140, 140, 140)
        
        r_pg = p.add_run(pg)
        r_pg.font.name = 'Google Sans'
        r_pg.font.bold = True
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 5: PROBLEM & OPPORTUNITY (បញ្ហា និងឱកាសក្នុងទីផ្សារ)
    # ------------------------------------------
    add_heading_styled(doc, "៥. បញ្ហា និងឱកាសក្នុងទីផ្សារ (Problem & Opportunity)", level=1)
    
    p = doc.add_paragraph()
    run_bold = p.add_run("បញ្ហាប្រឈមក្នុងទីផ្សារ៖\n")
    run_bold.bold = True
    p.add_run(
        "អត្រាគ្រោះថ្នាក់ចរាចរណ៍នៅព្រះរាជាណាចក្រកម្ពុជានៅតែស្ថិតក្នុងកម្រិតខ្ពស់ ដែលបណ្តាលមកពីកង្វះការយល់ដឹងច្បាស់លាស់ "
        "អំពីច្បាប់ និងសញ្ញាចរាចរណ៍។ ជាងនេះទៅទៀត វិធីសាស្ត្ររៀន និងប្រឡងយកប័ណ្ណបើកបរកាលពីមុនភាគច្រើនផ្អែកលើក្រដាស និងសៀវភៅ "
        "ដែលពិបាកចូលប្រើប្រាស់ ខ្វះលក្ខណៈអន្តរកម្ម និងមិនមានយន្តការពីរភាសា។ គ្រូបង្រៀន និងសាលាបង្រៀនបើកបរ ជួបការលំបាក "
        "ក្នុងការតាមដាន វាយតម្លៃ និងវាស់ស្ទង់ចំណុចខ្សោយរបស់សិស្សម្នាក់ៗ ដែលនាំឱ្យអត្រាប្រឡងជាប់ទាប និងចំណាយពេលវេលាច្រើន។"
    )
    
    p2 = doc.add_paragraph()
    run_bold2 = p2.add_run("ឱកាសយុទ្ធសាស្ត្រ៖\n")
    run_bold2.bold = True
    p2.add_run(
        "ក្រសួងសាធារណការ និងដឹកជញ្ជូនបាន និងកំពុងរឹតបន្តឹងលើការផ្ទៀងផ្ទាត់ និងការប្រឡងយកប័ណ្ណបើកបរផ្លូវការយ៉ាងតឹងរ៉ឹង។ "
        "ការណ៍នេះបានបង្ខំឱ្យសាលាបង្រៀនបើកបរទាំងអស់ ត្រូវស្វែងរកឧបករណ៍សិក្សាឌីជីថលទំនើប ដើម្បីបង្កើនកិត្យានុភាព "
        "និងអត្រាប្រឡងជាប់របស់សិស្ស។ កង្វះវេទិកាគ្រប់គ្រងថ្នាក់រៀន (LMS) សម្រាប់ច្បាប់ចរាចរណ៍នៅកម្ពុជា គឺជាឱកាសដ៏ធំធេង "
        "សម្រាប់ KWD ក្នុងការផ្តល់នូវសេវាកម្មជាវប្រចាំបែបបច្ចេកវិទ្យា (B2B SaaS) ដែលដោះស្រាយបញ្ហាទាំងគ្រូ និងសិស្សក្នុងពេលតែមួយ។"
    )
    
    # ------------------------------------------
    # SECTION 6: PRODUCT OVERVIEW (ទិដ្ឋភាពទូទៅនៃផលិតផល)
    # ------------------------------------------
    add_heading_styled(doc, "៦. ទិដ្ឋភាពទូទៅនៃផលិតផល (Product Overview)", level=1)
    
    doc.add_paragraph(
        "KWD គឺជាវេទិកាសិក្សាសុវត្ថិភាពចរាចរណ៍ និងរៀបចំប្រឡងយកប័ណ្ណបើកបរដ៏ទូលំទូលាយ ដែលមានមុខងារសំខាន់ៗរៀបចំឡើងជា ៣ សសរស្តម្ភគ្រឹះ៖"
    )
    
    for pref, text in pillars:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    doc.add_paragraph(
        "លើសពីនេះ វេទិកាមានរួមបញ្ចូល Suar AI ដែលជាជំនួយការសិក្សាឆ្លាតវៃ ឆ្លើយតបរាល់ចម្ងល់ច្បាប់ចរាចរណ៍របស់សិស្សភ្លាមៗ "
        "ដោយផ្អែកលើឯកសារច្បាប់ផ្លូវការ ជៀសវាងការបង្កើតព័ត៌មានមិនត្រឹមត្រូវ។"
    )
    
    # ------------------------------------------
    # SECTION 7: TARGET AUDIENCE (ក្រុមគោលដៅ និងចំណែកទីផ្សារ)
    # ------------------------------------------
    add_heading_styled(doc, "៧. ក្រុមគោលដៅ និងចំណែកទីផ្សារ (Target Audience)", level=1)
    
    doc.add_paragraph(
        "KWD បម្រើប្រព័ន្ធអេកូឡូស៊ីអប់រំចរាចរណ៍ទាំងមូល ដោយផ្តោតលើក្រុមគោលដៅសំខាន់ៗ និងចំណែកទីផ្សារច្បាស់លាស់៖"
    )
    
    for pref, text in targets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    add_hud_bar(doc, "target audience profile")
    make_callout_box(
        doc,
        "[HUD CALLOUT // របាយការណ៍ក្រុមគោលដៅ]",
        "សាលាបង្រៀនបើកបរដៃគូត្រូវបានជ្រើសរើសជាច្រកផ្លូវចម្បងដើម្បីទាក់ទាញសិស្ស ដោយសារសាលានីមួយៗមានសិស្សចុះឈ្មោះរាប់រយនាក់ "
        "ក្នុងមួយខែៗ។ ការណ៍នេះធ្វើឱ្យថ្លៃដើមទាក់ទាញអតិថិជន (CAC) មានកម្រិតទាបបំផុត ($0.15 ក្នុងឆ្នាំទី១)។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 8: MARKET ANALYSIS (ការវិភាគទីផ្សារចរាចរណ៍)
    # ------------------------------------------
    add_heading_styled(doc, "៨. ការវិភាគទីផ្សារចរាចរណ៍ (Market Analysis)", level=1)
    
    doc.add_paragraph(
        "ទីផ្សារអប់រំ និងបណ្តុះបណ្តាលបើកបរនៅព្រះរាជាណាចក្រកម្ពុជា កំពុងមានសន្ទុះខ្លាំង ដោយសារកំណើនប្រជាជន កំណើនយានយន្ត "
        "និងការរឹតបន្តឹងលើការអនុវត្តច្បាប់ពីសំណាក់អាជ្ញាធរជាតិ។ យោងតាមស្ថិតិផ្លូវការ មានសាលាបង្រៀនបើកបរចុះបញ្ជីត្រឹមត្រូវ "
        "រាប់រយទីតាំងទូទាំងប្រទេស ហើយសិស្សានុសិស្សរាប់ម៉ឺននាក់ត្រូវប្រឡងទ្រឹស្តីច្បាប់ចរាចរណ៍ជារៀងរាល់ខែ។"
    )
    doc.add_paragraph(
        "ការវិភាគលើគូប្រជែងបង្ហាញថា ភាគច្រើននៅតែប្រើប្រាស់វិធីសាស្ត្រសិក្សាបែបប្រពៃណី (ក្រដាស និងសៀវភៅ) ឬកម្មវិធីទូរស័ព្ទ "
        "ដែលមិនមានប្រព័ន្ធគ្រប់គ្រងសិស្សសម្រាប់គ្រូ និងខ្វះអន្តរកម្ម។ KWD ទទួលបានអត្ថប្រយោជន៍ប្រកួតប្រជែងយ៉ាងខ្លាំង "
        "តាមរយៈការផ្តល់ជូននូវវេទិកា LMS ពេញលេញ និងការរួមបញ្ចូលបច្ចេកវិទ្យា AI ជំនួយការសិក្សា ដែលគូប្រជែងដទៃទៀតពុំទាន់មាន។"
    )
    
    # ------------------------------------------
    # SECTION 9: BUSINESS MODEL (គំរូអាជីវកម្ម)
    # ------------------------------------------
    add_heading_styled(doc, "៩. គំរូអាជីវកម្ម (Business Model)", level=1)
    
    doc.add_paragraph(
        "KWD ដំណើរការតាមគំរូអាជីវកម្មបែបជាវប្រចាំ (B2B SaaS Subscription Model) ជាមួយយុទ្ធសាស្ត្រលូតលាស់ច្បាស់លាស់៖"
    )
    
    for pref, text in biz_model:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 10: PRICING STRATEGY (យុទ្ធសាស្ត្រកំណត់តម្លៃ)
    # ------------------------------------------
    add_heading_styled(doc, "១០. យុទ្ធសាស្ត្រកំណត់តម្លៃ (Pricing Strategy)", level=1)
    
    doc.add_paragraph(
        "យុទ្ធសាស្ត្រកំណត់តម្លៃរបស់ KWD ត្រូវបានរៀបចំឡើងយ៉ាងហ្មត់ចត់ ដើម្បីធានាបាននូវអត្រាបំលែង (Conversion Rate) ខ្ពស់បំផុត និងអត្ថប្រយោជន៍អាជីវកម្មយូរអង្វែង៖"
    )
    
    for pref, text in price_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    add_heading_styled(doc, "តារាងប្រៀបធៀបមុខងារ និងតម្លៃគម្រោងជាវ", level=2)
    
    table = doc.add_table(rows=len(pricing_data), cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    
    for i, row in enumerate(table.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths[j]
            cell.text = pricing_data[i][j]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j in [1, 2, 3] else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 11: MARKETING & GROWTH STRATEGY (យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់)
    # ------------------------------------------
    add_heading_styled(doc, "១១. យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់ (Marketing & Growth Strategy)", level=1)
    
    doc.add_paragraph(
        "KWD អនុវត្តយុទ្ធសាស្ត្រទីផ្សារ B2B ផ្តោតលើភាពជាក់ស្តែង និងការចំណាយទាប ដើម្បីសម្រេចបាននូវការលូតលាស់យ៉ាងលឿន៖"
    )
    
    for pref, text in marketing_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    # ------------------------------------------
    # SECTION 12: OPERATIONS PLAN (ផែនការប្រតិបត្តិការ)
    # ------------------------------------------
    add_heading_styled(doc, "១២. ផែនការប្រតិបត្តិការ (Operations Plan)", level=1)
    
    doc.add_paragraph(
        "ដើម្បីរក្សាបាននូវភាពសាមញ្ញ និងការចំណាយប្រតិបត្តិការទាបបំផុត KWD អនុវត្តផែនការប្រតិបត្តិការដូចខាងក្រោម៖"
    )
    
    for text in ops_details:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        bp.add_run(text)
        
    # Insert Diagram in Operations/Workflow section
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    p_diag = doc.add_paragraph()
    p_diag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_diag = p_diag.add_run()
    run_diag.add_picture(DIAGRAM_PATH, width=Inches(6.0))
    
    p_diag_cap = doc.add_paragraph()
    p_diag_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_diag_cap.paragraph_format.space_after = Pt(12)
    run_diag_cap = p_diag_cap.add_run("រូបភាពទី ២៖ លំហូរការងារ Onboarding និងការផ្ទៀងផ្ទាត់សិទ្ធិជាវប្រព័ន្ធ KWD (Workflow)")
    run_diag_cap.font.name = 'Google Sans'
    run_diag_cap.font.italic = True
    run_diag_cap.font.size = Pt(9)
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 13: TECHNOLOGY & PLATFORM OVERVIEW (ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា)
    # ------------------------------------------
    add_heading_styled(doc, "១៣. ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា (Technology & Platform Overview)", level=1)
    
    doc.add_paragraph(
        "KWD ត្រូវបានសាងសង់ឡើងលើស្ថាបត្យកម្មលំដាប់ឧស្សាហកម្ម ដែលធានាបាននូវល្បឿន និងសុវត្ថិភាពខ្ពស់បំផុត៖"
    )
    
    table_tech = doc.add_table(rows=len(tech_data), cols=3)
    table_tech.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_tech.autofit = False
    set_table_borders(table_tech)
    
    for i, row in enumerate(table_tech.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_tech[j]
            cell.text = tech_data[i][j]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    # ------------------------------------------
    # SECTION 14: FINANCIAL PROJECTIONS (YEAR 1–5) (ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥)
    # ------------------------------------------
    add_heading_styled(doc, "១៤. ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥ (Financial Projections Year 1-5)", level=1)
    
    doc.add_paragraph(
        "គំរូហិរញ្ញវត្ថុរបស់ KWD បង្ហាញពីកំណើនចំណូលដ៏ឆាប់រហ័ស គួបផ្សំនឹងការរក្សាបាននូវភាគរយចំណេញខ្ពស់បំផុត "
        "ដោយសារតែការចំណាយលើហេដ្ឋារចនាសម្ព័ន្ធបច្ចេកវិទ្យាដំបូងមានកម្រិតទាបបំផុត ($50.00 USD)។ អាជីវកម្មត្រូវបាន "
        "ព្យាករណ៍ថានឹងទទួលបានការទូទាត់ថ្លៃជាវ និងទទួលបានចំណេញចាប់ពីខែដំបូងនៃការដំណើរការអាជីវកម្ម។"
    )
    
    p_chart = doc.add_paragraph()
    p_chart.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_chart = p_chart.add_run()
    run_chart.add_picture(CHART_PATH, width=Inches(6.0))
    
    p_cap2 = doc.add_paragraph()
    p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap2.paragraph_format.space_after = Pt(12)
    run_cap2 = p_cap2.add_run("រូបភាពទី ៣៖ ការព្យាករណ៍កំណើនចំនួនអ្នកជាវប្រចាំ និងចំណូលប្រចាំខែ (MRR) ក្នុងរយៈពេល ៥ ឆ្នាំ")
    run_cap2.font.name = 'Google Sans'
    run_cap2.font.italic = True
    run_cap2.font.size = Pt(9)
    
    p_be = doc.add_paragraph()
    run_bold_be = p_be.add_run("ការវិភាគចំណុចរួចដើម (Break-even Analysis)៖ ")
    run_bold_be.bold = True
    p_be.add_run(
        "ដោយសារតែចំណាយវិនិយោគដំបូងមានត្រឹមតែ $50 USD សម្រាប់ការជាវឧបករណ៍ និងដែន (Domain) ការលក់គម្រោងសាលារៀន (School Plan) "
        "តែមួយគណនី ($49.99/ខែ) គឺគ្រប់គ្រាន់ដើម្បីឱ្យអាជីវកម្មរួចដើមទាំងស្រុងនៅក្នុងខែដំបូង។ រាល់ការលក់បន្ទាប់ពីនោះ "
        "គឺជាប្រាក់ចំណេញសុទ្ធ ដែលធ្វើឱ្យ KWD ក្លាយជាម៉ាស៊ីនបង្កើតចំណូលប្រកបដោយប្រសិទ្ធភាពខ្ពស់។"
    )
    
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 15: RISK ANALYSIS (ការវិភាគហានិភ័យ និងវិធានការបង្ការ)
    # ------------------------------------------
    add_heading_styled(doc, "១៥. ការវិភាគហានិភ័យ និងវិធានការបង្ការ (Risk Analysis)", level=1)
    
    doc.add_paragraph(
        "ដើម្បីធានាបាននូវនិរន្តរភាពអាជីវកម្ម គណៈកម្មការប្រតិបត្តិ KWD បានកំណត់អត្តសញ្ញាណហានិភ័យ និងរៀបចំវិធានការបង្ការទុកជាមុន៖"
    )
    
    table_risk = doc.add_table(rows=len(risks_data), cols=3)
    table_risk.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_risk.autofit = False
    set_table_borders(table_risk)
    
    for i, row in enumerate(table_risk.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_risk[j]
            cell.text = risks_data[i][j]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    # ------------------------------------------
    # SECTION 16: GROWTH ROADMAP (ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់)
    # ------------------------------------------
    add_heading_styled(doc, "១៦. ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់ (Growth Roadmap)", level=1)
    
    doc.add_paragraph(
        "ផែនទីបង្ហាញផ្លូវរបស់ KWD ត្រូវបានបែងចែកជា ៣ ដំណាក់កាល ដើម្បីអភិវឌ្ឍអាជីវកម្ម និងពង្រីកឥទ្ធិពលសង្គម៖"
    )
    
    for pref, text in roadmap_phases:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(pref)
        r_p.bold = True
        bp.add_run(text)
        
    doc.add_page_break()
    
    # ------------------------------------------
    # SECTION 17: INVESTMENT SUMMARY (សេចក្តីសង្ខេបការវិនិយោគ)
    # ------------------------------------------
    add_heading_styled(doc, "១៧. សេចក្តីសង្ខេបការវិនិយោគ (Investment Summary)", level=1)
    
    doc.add_paragraph(
        "KWD ត្រូវបានចាប់ផ្តើមឡើងក្រោមទម្រង់អាជីវកម្មខ្នាតតូច ជាមួយការចំណាយដំបូងត្រឹមតែ $50 USD។ គំរូនេះមាន "
        "អត្រាចំណេញដុលខ្ពស់បំផុត (> ៩៥% ក្នុងឆ្នាំទី៥)។ យើងកំពុងស្វែងរកដៃគូវិនិយោគយុទ្ធសាស្ត្រ ដើម្បីជួយជម្រុញ "
        "ការធ្វើទីផ្សារ B2B ឱ្យកាន់តែលឿន ការពង្រីកប្រព័ន្ធបច្ចេកវិទ្យា និងការអភិវឌ្ឍកម្មវិធីលើទូរស័ព្ទដៃ (Mobile App) ផ្លូវការ។"
    )
    doc.add_paragraph(
        "ដើមទុនដែលទទួលបានពីការវិនិយោគ នឹងត្រូវបានបែងចែកយ៉ាងជាក់លាក់ ៥០% សម្រាប់ការអភិវឌ្ឍប្រព័ន្ធ និងបច្ចេកវិទ្យា "
        "៣០% សម្រាប់យុទ្ធនាការលក់ B2B និង ២០% សម្រាប់ប្រតិបត្តិការគាំទ្រសាលារៀនដៃគូ។ វិនិយោគិននឹងទទួលបានការត្រឡប់មកវិញ "
        "នៃប្រាក់វិនិយោគ (ROI) យ៉ាងឆាប់រហ័ស តាមរយៈលំហូរចំណូលជាប្រចាំប្រចាំខែ (MRR) ដែលមានស្ថិរភាព។"
    )
    
    # ------------------------------------------
    # SECTION 18: CONCLUSION (សេចក្តីសន្និដ្ឋាន)
    # ------------------------------------------
    add_heading_styled(doc, "១៨. សេចក្តីសន្និដ្ឋាន (Conclusion)", level=1)
    
    doc.add_paragraph(
        "បណ្តាញអប់រំសុវត្ថិភាពចរាចរណ៍ កេសរារាម (KWD) គឺជាការរួមបញ្ចូលគ្នាដ៏មានសក្តានុពលរវាង បច្ចេកវិទ្យា SaaS ទំនើប និង "
        "តម្រូវការជាក់ស្តែងនៃការអប់រំសុវត្ថិភាពចរាចរណ៍នៅកម្ពុជា។ តាមរយៈការចំណាយហេដ្ឋារចនាសម្ព័ន្ធដ៏ទាប និងគំរូជាវប្រចាំប្រកបដោយ "
        "ចិត្តវិទ្យា KWD មិនត្រឹមតែជាឱកាសអាជីវកម្មដែលមានផលចំណេញខ្ពស់ និងនិរន្តរភាពហិរញ្ញវត្ថុប៉ុណ្ណោះទេ ប៉ុន្តែថែមទាំងជាដំណោះស្រាយ "
        "ដ៏សំខាន់ក្នុងការកាត់បន្ថយគ្រោះថ្នាក់ចរាចរណ៍ និងលើកកម្ពស់វប្បធម៌បើកបរប្រកបដោយសុវត្ថិភាពនៅក្នុងសង្គមខ្មែរទាំងមូលផងដែរ។"
    )
    
    # ------------------------------------------
    # SECTION 19: APPENDIX (ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ)
    # ------------------------------------------
    add_heading_styled(doc, "១៩. ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ (Appendix)", level=1)
    
    doc.add_paragraph(
        "តារាងខាងក្រោមបង្ហាញអំពីការព្យាករណ៍ទិន្នន័យប្រតិបត្តិការហិរញ្ញវត្ថុ និងសូចនាករអាជីវកម្មសំខាន់ៗរបស់ KWD "
        "ពីឆ្នាំទី១ ដល់ឆ្នាំទី៥ ដែលបញ្ជាក់ពីកំណើន និងប្រសិទ្ធភាពហិរញ្ញវត្ថុរបស់គម្រោង៖"
    )
    
    table_app = doc.add_table(rows=len(appendix_data), cols=6)
    table_app.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_app.autofit = False
    set_table_borders(table_app)
    
    for i, row in enumerate(table_app.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths_app[j]
            cell.text = appendix_data[i][j]
            set_cell_margins(cell, top=90, bottom=90, left=100, right=100)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if j == 0 else WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(8.5)
                r.font.bold = is_header
                
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(24)
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_end = p_end.add_run("// បញ្ចប់របាយការណ៍ // ប្រព័ន្ធសុវត្ថិភាព // ការទាក់ទងទូរវាស់ស្ទង់ KWD ត្រូវបានបញ្ចប់ //")
    run_end.font.name = 'Google Sans'
    run_end.font.bold = True
    run_end.font.size = Pt(9.5)
    
    # Save document
    doc.save(DOCX_PATH)
    print(f"Business Plan generated successfully at {DOCX_PATH}")


# Data definitions used in the document creation
pillars = [
    ("រៀន (Learn)៖ ", "ផ្តល់នូវមេរៀន សញ្ញាចរាចរណ៍ និងច្បាប់ចរាចរណ៍ជាពីរភាសា (ខ្មែរ និងអង់គ្លេស) អមដោយរូបភាព និងសំឡេងពន្យល់ច្បាស់ៗ ដើម្បីជួយសិស្សឱ្យងាយយល់ និងចងចាំ។"),
    ("អនុវត្ត (Practice)៖ ", "ប្រព័ន្ធសំណួរ និងលំហាត់អនុវត្តដោយខ្លួនឯង ដែលប្រើប្រាស់ក្បួនដោះស្រាយ Fisher-Yates ដើម្បីសាប់សំណួរចៃដន្យ ធានាថាសិស្សទទួលបានបទពិសោធន៍តេស្តថ្មី និងមិនអាចទន្ទេញចម្លើយបាន។"),
    ("ប្រកួត (Compete)៖ ", "ប្រព័ន្ធប្រកួតផ្ទាល់ក្នុងថ្នាក់ (Live Classroom Sessions) ដែលអនុញ្ញាតឱ្យគ្រូបង្រៀនបង្កើតបន្ទប់ប្រកួត ហើយសិស្សទាំងអស់ឆ្លើយសំណួរប្រកួតគ្នាក្នុងពេលជាក់ស្តែង (Real-time) តាមរយៈ Pusher។")
]

targets = [
    ("អ្នកប្រើប្រាស់ចម្បង (Primary Users)៖ ", "បេក្ខជនប្រឡងយកប័ណ្ណបើកបរ (ឡាន ម៉ូតូ និងឡានធំ) ដែលត្រូវការវេទិកាហ្វឹកហាត់សំណួរ និងចង់ប្រឡងជាប់នៅ Governments exam ដំបូង។"),
    ("អ្នកប្រើប្រាស់បន្ទាប់បន្សំ (Secondary Users)៖ ", "គ្រូបង្រៀនបើកបរឯករាជ្យ និងសាលាបង្រៀនបើកបរ ដែលត្រូវការឧបករណ៍ទំនើប ដើម្បីគ្រប់គ្រងថ្នាក់ តាមដានសិស្ស និងកាត់បន្ថយពេលវេលាពន្យល់ដោយដៃ។"),
    ("ចំណែកទីផ្សារ (Customer Segments)៖ ", "សាលាបង្រៀនបើកបរកម្រិតមធ្យម និងកម្រិតអាជីវកម្មទូទាំង ២៥ ខេត្ត-ក្រុង ដែលចង់បានដំណោះស្រាយឌីជីថល (LMS) ក្រោមស្លាកយីហោផ្ទាល់ខ្លួន (White-label)។"),
    ("សម្មតិកម្មកំណើន (User Growth Assumptions)៖ ", "កំណើនអ្នកប្រើប្រាស់នឹងកើនឡើងយ៉ាងលឿនតាមរយៈបណ្តាញសាលាដៃគូ (B2B2C) និងយន្តការចែករំលែកកាតលទ្ធផលសិក្សា (Save Card) របស់សិស្សលើបណ្តាញសង្គម Telegram និង Facebook។")
]

biz_model = [
    ("យុទ្ធសាស្ត្រ Freemium៖ ", "សិស្សអាចចុះឈ្មោះសិក្សា អនុវត្តសំណួរចៃដន្យ និងមើលសញ្ញាចរាចរណ៍ដោយឥតគិតថ្លៃ ១០០%។ ការណ៍នេះធានាបាននូវការកើនឡើងចំនួនអ្នកប្រើប្រាស់ប្រព័ន្ធយ៉ាងលឿន និងបង្កើតស្ថិតិទិន្នន័យសិក្សា។"),
    ("ប្រភពចំណូលពីការជាវប្រចាំ (Subscriptions)៖ ", "គ្រូបង្រៀន និងសាលាបង្រៀនបើកបរ បង់ថ្លៃសេវាប្រចាំខែ ដើម្បីទទួលបានសិទ្ធិបង្កើតថ្នាក់រៀន បញ្ចូលសិស្ស តាមដានវឌ្ឍនភាព និងដក Branding របស់ KWD ចេញពីកាតលទ្ធផល។"),
    ("ឱកាសលក់បន្ថែម (Upsell Opportunities)៖ ", "ការផ្តល់ជូនសេវាកម្មបន្ថែម ដូចជាការគ្រប់គ្រងមាតិកាផ្ទាល់ខ្លួនរបស់សាលារៀន គណនីគ្រូបង្រៀនច្រើននាក់ និងការរៀបចំរង្វាន់លើកទឹកចិត្តសិស្សជាក់ស្តែងក្នុងប្រព័ន្ធ។"),
    ("ឱកាសសហគ្រាស (Enterprise Opportunities)៖ ", "ការផ្តល់អាជ្ញាបណ្ណដាច់ដោយឡែក (Self-hosted/Dedicated Server) សម្រាប់សហគ្រាសដឹកជញ្ជូនខ្នាតធំ សាលាបង្រៀនបើកបរធំៗដែលមានសាខាច្រើន ឬស្ថាប័នរដ្ឋាភិបាលដែលចង់បានប្រព័ន្ធសុវត្ថិភាពចរាចរណ៍ផ្ទាល់ខ្លួន។")
]

price_details = [
    ("ចិត្តវិទ្យាតម្លៃលេខសេស (Odd Pricing Psychology)៖ ", "តម្លៃគម្រោងគ្រូបង្រៀន (Teacher Pro) ត្រូវបានកំណត់ត្រឹម $9.99/ខែ និងគម្រោងសាលារៀន (School Plan) ត្រឹម $49.99/ខែ។ ការកំណត់នេះជួយកាត់បន្ថយអារម្មណ៍ស្ទាក់ស្ទើរក្នុងការសម្រេចចិត្តទិញ និងបង្កើនការយល់ឃើញអំពីភាពសន្សំសំចៃ។"),
    ("ការលក់ផ្អែកលើតម្លៃ និងអត្ថប្រយោជន៍ (Value-based & Benefits-focused)៖ ", "យើងមិនលក់លក្ខណៈបច្ចេកវិទ្យា ឬលក្ខណៈកូដប្រព័ន្ធឡើយ។ យើងលក់ «ភាពជឿជាក់របស់សិស្ស អត្រាប្រឡងជាប់ខ្ពស់ (៩២%+) និងកេរ្តិ៍ឈ្មោះសាលា»។ សាលាបង្រៀនបើកបរអាចកាត់កងថ្លៃជាវនេះបានយ៉ាងងាយ តាមរយៈការគិតថ្លៃសេវារៀបចំទ្រឹស្តីបន្ថែមបន្តិចបន្តួចពីសិស្ស (ឧទាហរណ៍ $1 ក្នុងម្នាក់)។"),
    ("យុទ្ធសាស្ត្ររក្សាអតិថិជន (Customer Retention Strategy)៖ ", "ការផ្តល់ការសាកល្បងគម្រោង Teacher Pro រយៈពេល ៣០ ថ្ងៃដោយឥតគិតថ្លៃ និងការបញ្ចុះតម្លៃ ២០% សម្រាប់ការបង់ប្រាក់ជាកញ្ចប់ប្រចាំឆ្នាំ ដើម្បីរក្សាលំហូរចំណូលឱ្យមានស្ថិរភាព។")
]

pricing_data = [
    ["គម្រោងជាវ (Plan Tier)", "តម្លៃប្រចាំខែ (Price)", "កូតាសិស្ស (Students)", "កូតាថ្នាក់រៀន (Classes)", "សិទ្ធិ និងមុខងារសំខាន់ៗ (Features)"],
    ["Free Plan", "$0.00 / ខែ", "០ នាក់", "០ ថ្នាក់", "រៀន និងអនុវត្តទ្រឹស្តីតែម្នាក់ឯង, មើលសញ្ញាចរាចរណ៍"],
    ["Teacher Pro", "$9.99 / ខែ", "៥០ នាក់", "៥ ថ្នាក់", "ប្រព័ន្ធគ្រប់គ្រងសិស្ស, របាយការណ៍ស្ថិតិ, ខ្លឹមសារផ្ទាល់ខ្លួន"],
    ["School Plan", "$49.99 / ខែ", "មិនកំណត់", "មិនកំណត់", "គ្រូ ១០ នាក់, ដក Branding KWD ចេញ, ជំនួយអាទិភាព ២៤/៧"],
    ["Enterprise Plan", "តម្លៃចរចា", "តាមការកំណត់", "តាមការកំណត់", "Dedicated Server, ការរួមបញ្ចូល API, មុខងាររចនាតាមតម្រូវការ"]
]

widths = [Inches(1.2), Inches(1.1), Inches(1.1), Inches(1.1), Inches(2.0)]

marketing_details = [
    ("បណ្តាញទាក់ទាញអតិថិជន (Acquisition Channels)៖ ", "ការជួបពិភាក្សាផ្ទាល់ជាមួយម្ចាស់សាលាបង្រៀនបើកបរ ការផ្តល់បទបង្ហាញពីអត្ថប្រយោជន៍ប្រព័ន្ធ និងការចូលរួមក្នុងយុទ្ធនាការសុវត្ថិភាពចរាចរណ៍របស់រដ្ឋ។"),
    ("ប្រព័ន្ធណែនាំបន្ត (Referral System)៖ ", "ការផ្តល់ជូនការប្រើប្រាស់ឥតគិតថ្លៃ ២ ខែ ដល់សាលាបង្រៀនបើកបរណា ដែលណែនាំសាលាបង្រៀនបើកបរផ្សេងទៀតឱ្យចុះឈ្មោះប្រើប្រាស់គម្រោងបង់ប្រាក់របស់ KWD។"),
    ("ទីផ្សារខ្លឹមសារ និងសហគមន៍ (Content & Community Growth)៖ ", "ការផលិតវីដេអូខ្លីៗពន្យល់ពីគន្លឹះចរាចរណ៍ និងការប្រឡង ព្រមទាំងការបង្កើតសហគមន៍សួរ-ឆ្លើយច្បាប់ចរាចរណ៍លើ Telegram ដើម្បីទាក់ទាញសិស្សឱ្យមកប្រើប្រាស់ទំព័រ Play ឥតគិតថ្លៃ។"),
    ("ភាពជាដៃគូ (Partnership Opportunities)៖ ", "កិច្ចសហការជាមួយសហព័ន្ធសាលាបង្រៀនបើកបរ ឬនាយកដ្ឋានសុវត្ថិភាពចរាចរណ៍ ដើម្បីទទួលបានការបញ្ជាក់ និងការណែនាំផ្លូវការពីស្ថាប័នរដ្ឋ។"),
    ("លំហូរការបំលែង (Conversion Funnel)៖ ", "សិស្សប្រើប្រាស់ឥតគិតថ្លៃ -> គ្រូចុះឈ្មោះសាកល្បង ៣០ ថ្ងៃ -> សិស្សទទួលបានអត្រាប្រឡងជាប់ខ្ពស់ -> សាលារៀនសម្រេចចិត្តជាវគម្រោង School Plan ដើម្បីពង្រឹងយីហោរបស់ខ្លួន។")
]

ops_details = [
    "ការទូទាត់ និងការបើកគណនីដោយដៃ៖ សាលាបង្រៀនផ្ទេរប្រាក់ផ្ទាល់តាមរយៈធនាគារ ABA ហើយផ្ញើវិក្កយបត្រមកកាន់ក្រុមការងារ។ ប្រព័ន្ធគ្រប់គ្រង (Admin) នឹងធ្វើការផ្ទៀងផ្ទាត់ និងបើកដំណើរការគម្រោងដោយដៃ។ យន្តការនេះជួយជៀសវាងការបោកប្រាស់ និងថ្លៃសេវាច្រកទូទាត់ដំបូង។",
    "ការត្រួតពិនិត្យ និងគ្រប់គ្រងខ្លឹមសារ៖ បុគ្គលិក KWD (Staff) ផលិតសំណួរ និងខ្លឹមសារថ្មីៗ រួចដាក់ជូនអ្នកគ្រប់គ្រង (Admin) ពិនិត្យ និងអនុម័ត មុននឹងបោះផ្សាយជាសាធារណៈ។",
    "ការគាំទ្របច្ចេកទេស និងការថែទាំ៖ ក្រុមការងារបច្ចេកទេសតាមដានស្ថានភាពម៉ាស៊ីនមេ និងផ្តល់ជំនួយដល់សាលារៀនជាវប្រចាំភ្លាមៗតាមរយៈក្រុម Telegram ជំនួយការរបស់ KWD។"
]

tech_data = [
    ["ស្រទាប់ប្រព័ន្ធ (Layer)", "បច្ចេកវិទ្យា (Technology)", "តួនាទីក្នុងវេទិកា KWD (Role)"],
    ["Frontend (ស្រទាប់បង្ហាញ)", "Next.js · React · Tailwind CSS", "បង្ហាញចំណុចប្រទាក់អ្នកប្រើ និងគ្រប់គ្រងបទពិសោធន៍សិក្សាល្បឿនលឿន"],
    ["ពហុភាសា (Localization)", "next-intl", "គាំទ្រការប្រើប្រាស់ជាភាសាខ្មែរ និងអង់គ្លេសយ៉ាងរលូន"],
    ["Backend (ស្រទាប់ដំណើរការ)", "Next.js Server Actions & API Routes", "គ្រប់គ្រងតក្កវិជ្ជាអាជីវកម្ម ការពិនិត្យសិទ្ធិចូលប្រើប្រាស់ និងកូតា"],
    ["Database (ទិន្នន័យ)", "PostgreSQL (Neon) · Drizzle ORM", "ផ្ទុកទិន្នន័យសិស្ស ថ្នាក់រៀន និងស្ថិតិសិក្សាប្រកបដោយសុវត្ថិភាព"],
    ["Real-time (ផ្សាយផ្ទាល់)", "Pusher", "ផ្សាយលទ្ធផលប្រឡង និងលំដាប់ពិន្ទុភ្លាមៗសម្រាប់វគ្គប្រកួតក្នុងថ្នាក់"],
    ["មេឌៀ (Media Storage)", "Cloudinary", "ផ្ទុក និងគ្រប់គ្រងរូបភាពសញ្ញាចរាចរណ៍ និងសំឡេងមេរៀន"],
    ["បញ្ញាសិប្បនិមិត្ត (AI)", "Gemini API (Suar AI)", "ជំនួយការសិក្សាឆ្លើយសំណួរច្បាប់ចរាចរណ៍ផ្អែកលើខ្លឹមសារផ្លូវការ"],
    ["ការដាក់ដំណើរការ", "Vercel", "ផ្សព្វផ្សាយ និងបម្រើវេទិកាជាសកលជាមួយយន្តការការពារសុវត្ថិភាពខ្ពស់"]
]
widths_tech = [Inches(1.8), Inches(2.0), Inches(2.7)]

risks_data = [
    ["ប្រភេទហានិភ័យ (Risk Type)", "ការពិពណ៌នា (Description)", "វិធានការបង្ការ / ដំណោះស្រាយ (Mitigation)"],
    ["ហានិភ័យបច្ចេកទេស", "ម៉ាស៊ីនមេគាំង ឬបាត់បង់ទិន្នន័យសិស្ស និងសាលារៀន", "ប្រើសេវាកម្មពពកស្វ័យប្រវត្តិកម្រិតខ្ពស់ និងអនុវត្តការ Backup រាល់ ២៤ ម៉ោង"],
    ["ហានិភ័យនៃការជាវដោយដៃ", "ការយឺតយ៉ាវក្នុងការផ្ទៀងផ្ទាត់ និងបើកគណនី", "បង្កើតប្រព័ន្ធប្រកាសដំណឹងស្វ័យប្រវត្តិទៅកាន់ Admin តាម Telegram Bot"],
    ["ការប្រកួតប្រជែងតម្លៃ", "គូប្រជែងលេចឡើង និងលក់តម្លៃទាបជាង KWD", "ផ្តោតលើគុណតម្លៃលទ្ធផលសិស្ស (Pass rate) និងសេវាថែទាំអតិថិជនពិសេស"],
    ["ភាពត្រឹមត្រូវនៃមាតិកា", "សំណួរច្បាប់ចរាចរណ៍មានកំហុស ឬមិនតម្រឹមតាមក្រសួង", "បង្កើតលំហូរការងារពិនិត្យសំណួរ ២ ដំណាក់កាល និងពិគ្រោះជាមួយនគរបាលចរាចរណ៍"]
]
widths_risk = [Inches(1.8), Inches(2.2), Inches(2.5)]

roadmap_phases = [
    ("ដំណាក់កាលទី ១៖ ចាប់ផ្តើម និងសាកល្បង B2B (២០២៦ - ២០២៧)៖ ", "ដាក់ឱ្យដំណើរការ Next.js ជាមួយដើមទុន $50.00។ ធ្វើដៃគូជាមួយសាលាបង្រៀនបើកបរ ១៥ ក្នុងរាជធានីភ្នំពេញ ដើម្បីបង្ហាញពីអត្រាប្រឡងជាប់របស់សិស្ស ៩២%+។"),
    ("ដំណាក់កាលទី ២៖ ពង្រីកថ្នាក់តំបន់ និងសមាហរណកម្ម API (២០២៨ - ២០២៩)៖ ", "ពង្រីកទៅខេត្តសៀមរាប បាត់ដំបង និងព្រះសីហនុ។ ដាក់ឱ្យប្រើប្រាស់ API សម្រាប់សាលាបង្រៀនបើកបរដើម្បីសមកាលកម្មទិន្នន័យសិស្ស និងប្រព័ន្ធរំលឹកបន្តគម្រោងស្វ័យប្រវត្តិ។"),
    ("ដំណាក់កាលទី ៣៖ ទិន្នន័យជាតិ និងសុវត្ថិភាពចរាចរណ៍ (២០៣០ - ២០៣១)៖ ", "សហការជាមួយមន្ទីរដឹកជញ្ជូនរាជធានី-ខេត្ត ដើម្បីផ្តល់អាជ្ញាបណ្ណទិន្នន័យសុវត្ថិភាពចរាចរណ៍ (កំណត់ថាតើសញ្ញាណាដែលសិស្សមិនសូវយល់) និងការវិភាគកម្រិតខ្ពស់។")
]

appendix_data = [
    ["សូចនាករហិរញ្ញវត្ថុ (Metrics)", "ឆ្នាំទី ១ (Year 1)", "ឆ្នាំទី ២ (Year 2)", "ឆ្នាំទី ៣ (Year 3)", "ឆ្នាំទី ៤ (Year 4)", "ឆ្នាំទី ៥ (Year 5)"],
    ["ចំនួនអ្នកជាវប្រចាំ (Subscribers)", "120 គណនី", "450 គណនី", "1,500 គណនី", "3,200 គណនី", "5,400 គណនី"],
    ["ចំណូលប្រចាំខែ (MRR)", "$1,198.80", "$4,495.50", "$14,985.00", "$31,968.00", "$53,946.00"],
    ["ចំណូលប្រចាំឆ្នាំ (ARR)", "$14,385.60", "$53,946.00", "$179,820.00", "$383,616.00", "$647,352.00"],
    ["ចំណាយប្រតិបត្តិការបច្ចេកទេស", "$50.00", "$300.00", "$1,000.00", "$1,800.00", "$2,400.00"],
    ["ចំណាយប្រតិបត្តិការសរុប", "$50.00", "$1,200.00", "$5,400.00", "$15,000.00", "$29,130.00"],
    ["ប្រាក់ចំណេញសុទ្ធ (Net Profit)", "$14,335.60", "$52,746.00", "$174,420.00", "$368,616.00", "$618,222.00"],
    ["ភាគរយចំណេញ (Margin)", "99.65%", "97.78%", "97.00%", "96.09%", "95.50%"],
    ["ថ្លៃដើមទាក់ទាញសិស្ស (CAC)", "$0.15", "$0.50", "$1.00", "$1.50", "$2.00"],
    ["តម្លៃជីវិតអតិថិជន (LTV)", "$120.00", "$150.00", "$180.00", "$210.00", "$240.00"]
]
widths_app = [Inches(2.1), Inches(0.9), Inches(0.9), Inches(0.9), Inches(0.9), Inches(0.9)]

toc_items = [
    ("១. ទំព័រចំណងជើង (Title Page)", "1"),
    ("២. សេចក្តីសង្ខេបប្រតិបត្តិ (Executive Summary)", "2"),
    ("៣. សង្ខេបឯកសារ (Abstract)", "2"),
    ("៤. មាតិកា (Table of Contents)", "3"),
    ("៥. បញ្ហា និងឱកាសក្នុងទីផ្សារ (Problem & Opportunity)", "4"),
    ("៦. ទិដ្ឋភាពទូទៅនៃផលិតផល (Product Overview)", "4"),
    ("៧. ក្រុមគោលដៅ និងចំណែកទីផ្សារ (Target Audience)", "5"),
    ("៨. ការវិភាគទីផ្សារចរាចរណ៍ (Market Analysis)", "5"),
    ("៩. គំរូអាជីវកម្ម (Business Model)", "6"),
    ("១០. យុទ្ធសាស្ត្រកំណត់តម្លៃ (Pricing Strategy)", "6"),
    ("១១. យុទ្ធសាស្ត្រទីផ្សារ និងការលូតលាស់ (Marketing & Growth Strategy)", "7"),
    ("១២. ផែនការប្រតិបត្តិការ (Operations Plan)", "8"),
    ("១៣. ទិដ្ឋភាពទូទៅនៃបច្ចេកវិទ្យា និងវេទិកា (Technology & Platform Overview)", "8"),
    ("១៤. ការព្យាករណ៍ហិរញ្ញវត្ថុ ឆ្នាំទី១ - ឆ្នាំទី៥ (Financial Projections Year 1-5)", "9"),
    ("១៥. ការវិភាគហានិភ័យ និងវិធានការបង្ការ (Risk Analysis)", "10"),
    ("១៦. ផែនទីបង្ហាញផ្លូវនៃការលូតលាស់ (Growth Roadmap)", "10"),
    ("១៧. សេចក្តីសង្ខេបការវិនិយោគ (Investment Summary)", "11"),
    ("១៨. សេចក្តីសន្និដ្ឋាន (Conclusion)", "11"),
    ("១៩. ឧបសម្ព័ន្ធ៖ ទិន្នន័យហិរញ្ញវត្ថុប្រចាំឆ្នាំ (Appendix)", "12")
]

if __name__ == '__main__':
    generate_logo()
    generate_growth_chart()
    generate_workflow_diagram()
    build_khmer_business_plan_v2()
