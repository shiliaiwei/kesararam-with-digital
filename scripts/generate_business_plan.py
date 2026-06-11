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
ASSETS_DIR = os.path.join(PROJECT_DIR, 'public', 'brand-assets')

os.makedirs(DOCS_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)

LOGO_PATH = os.path.join(ASSETS_DIR, 'logo_black.png')
CHART_PATH = os.path.join(ASSETS_DIR, 'growth_chart.png')
DIAGRAM_PATH = os.path.join(ASSETS_DIR, 'workflow_diagram.png')
DOCX_PATH = os.path.join(DOCS_DIR, 'KWD_Business_Plan.docx')


# ==========================================
# 1. ASSET GENERATION (MONOCHROME ONLY)
# ==========================================

def generate_logo():
    """Generates a minimalist black-and-white corporate logo for KWD."""
    # 500x500 monochrome logo
    img = Image.new('L', (500, 500), color=255) # White background
    draw = ImageDraw.Draw(img)
    
    # Draw a bold minimalist geometric mark: interlocking triangles/polygons representing road network & direction
    # Outer frame
    draw.rectangle([50, 50, 450, 450], outline=0, width=6)
    
    # Interlocking "K" and "W" shape using simple geometric lines
    # Triangle pointing right (safety direction)
    draw.polygon([(120, 120), (280, 250), (120, 380)], fill=0)
    # Forward chevron (driving ahead)
    draw.polygon([(260, 120), (400, 250), (260, 380)], outline=0, fill=None, width=12)
    # A dashed divider lane in the center
    draw.line([(250, 60), (250, 440)], fill=255, width=8)
    
    # Overlay brand initials "KWD" in clean text at the bottom inside the frame
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
        
    # Let's save as logo_black.png
    img.save(LOGO_PATH, 'PNG')
    print(f"Logo generated at {LOGO_PATH}")


def generate_growth_chart():
    """Generates a clean black-and-white double growth chart using Matplotlib."""
    years = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5']
    subscribers = [120, 480, 1440, 3200, 5400]
    mrr = [1198.80, 4795.20, 14385.60, 31968.00, 53946.00]
    
    plt.figure(figsize=(10, 5.5), facecolor='white')
    
    # Subplot 1: Subscribers
    plt.subplot(1, 2, 1)
    plt.plot(years, subscribers, color='black', marker='o', linewidth=2, linestyle='-')
    plt.title('PROJECTED SUBSCRIBERS', fontsize=12, fontweight='bold', color='black')
    plt.xlabel('Timeline', fontsize=10, color='black')
    plt.ylabel('Subscribers (Teachers/Schools)', fontsize=10, color='black')
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
        {"x": 0.5, "y": 2.5, "w": 2.5, "h": 1.0, "text": "1. SUBSCRIPTION MODEL\n- Teacher Pro: $9.99/mo\n- School Bundle: $49.99/mo"},
        {"x": 3.8, "y": 2.5, "w": 2.5, "h": 1.0, "text": "2. INSTRUCTOR ACCESS\n- Set up classes (max 5)\n- Add students (max 50)\n- Custom content tools"},
        {"x": 7.1, "y": 2.5, "w": 2.5, "h": 1.0, "text": "3. SOLO/LIVE PLAY\n- Driving sign practice\n- Speed & sign modes\n- Fisher-Yates shuffle seed"},
        {"x": 3.8, "y": 0.5, "w": 2.5, "h": 1.0, "text": "5. RENEWAL CYCLE\n- High pass rates (92%+)\n- Retain via clear benefits\n- Institutional growth"},
        {"x": 7.1, "y": 0.5, "w": 2.5, "h": 1.0, "text": "4. ANALYTICS / TELEMETRY\n- Track weak topics\n- Class-wide performance\n- Admin audit log output"}
    ]
    
    for box in boxes:
        # Draw monochrome box
        rect = plt.Rectangle((box["x"], box["y"]), box["w"], box["h"], 
                             fill=False, edgecolor='black', linewidth=1.5)
        ax.add_patch(rect)
        # Add text
        ax.text(box["x"] + box["w"]/2, box["y"] + box["h"]/2, box["text"],
                ha='center', va='center', fontsize=8, color='black', fontweight='bold')
        
    # Draw monochrome flow arrows
    # Arrow 1 to 2
    ax.annotate('', xy=(3.8, 3.0), xytext=(3.0, 3.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    # Arrow 2 to 3
    ax.annotate('', xy=(7.1, 3.0), xytext=(6.3, 3.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    # Arrow 3 to 4
    ax.annotate('', xy=(8.35, 1.5), xytext=(8.35, 2.5),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    # Arrow 4 to 5
    ax.annotate('', xy=(6.3, 1.0), xytext=(7.1, 1.0),
                arrowprops=dict(arrowstyle="->", color="black", lw=1.5))
    # Arrow 5 to 2
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
# 2. DOCX COMPILATION
# ==========================================

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets standard padding for document tables."""
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
    """Sets a clean, thin black border for monochrome table grids."""
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        '<w:tblBorders %s>'
        '  <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        '  <w:insideH w:val="single" w:sz="2" w:space="0" w:color="CCCCCC"/>'
        '  <w:left w:val="none"/>'
        '  <w:right w:val="none"/>'
        '  <w:insideV w:val="none"/>'
        '</w:tblBorders>' % nsdecls('w')
    )
    tblPr.append(borders)

def make_callout_box(doc, title, text):
    """Creates a monochrome callout box (thin black border, Google Sans font) representing HUD system output."""
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    # 6 inches wide callout box
    tbl.columns[0].width = Inches(6.0)
    cell = tbl.cell(0, 0)
    cell.width = Inches(6.0)
    
    # Set thin black border around cell
    tcPr = cell._tc.get_or_add_tcPr()
    borders = parse_xml(
        '<w:tcBorders %s>'
        '  <w:top w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '  <w:left w:val="single" w:sz="18" w:space="0" w:color="000000"/>'  # Thicker left border for callout bar effect
        '  <w:bottom w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '  <w:right w:val="single" w:sz="8" w:space="0" w:color="000000"/>'
        '</w:tcBorders>' % nsdecls('w')
    )
    tcPr.append(borders)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    # Add content to callout cell
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    run_title = p.add_run(f"{title}\n")
    run_title.font.name = 'Google Sans'
    run_title.font.bold = True
    run_title.font.size = Pt(10.5)
    
    run_text = p.add_run(text)
    run_text.font.name = 'Google Sans'
    run_text.font.italic = True
    run_text.font.size = Pt(10)
    
    # Spacing after table
    doc.add_paragraph().paragraph_format.space_after = Pt(6)

def add_hud_bar(doc, text):
    """Adds a futuristic HUD bar label in text form (black/white uppercase)."""
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(6)
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    run = p.add_run(f"// {text.upper()} // STATUS: ACTIVE // OPERATIONAL TELEMETRY")
    run.font.name = 'Google Sans'
    run.font.bold = True
    run.font.size = Pt(9.5)
    
    # Add a thin line below it
    pBdr = parse_xml(
        '<w:pBdr %s>'
        '  <w:bottom w:val="single" w:sz="6" w:space="4" w:color="000000"/>'
        '</w:pBdr>' % nsdecls('w')
    )
    p._p.get_or_add_pPr().append(pBdr)

def add_page_number_fields(run):
    """Inserts XML elements for page numbers in docx run."""
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

def add_numpages_fields(run):
    """Inserts XML elements for total page count in docx run."""
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "NUMPAGES"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def setup_page_footer(doc):
    """Sets up a clean footer with left and right page indicators (as requested: left and right page numbers)."""
    section = doc.sections[0]
    footer = section.footer
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    
    # Left Page Number
    run_left = p.add_run("KWD-SEC // ")
    run_left.font.name = 'Google Sans'
    run_left.font.size = Pt(8.5)
    
    # Left page numbering
    run_num1 = p.add_run()
    run_num1.font.name = 'Google Sans'
    run_num1.font.size = Pt(8.5)
    add_page_number_fields(run_num1)
    
    # Spacer to align right
    run_space = p.add_run("\t\t\t\t\t\t\t\t") # Tabs to push text to the right
    run_space.font.name = 'Google Sans'
    run_space.font.size = Pt(8.5)
    
    # Right Page Number (representing alternate page tracking)
    run_right = p.add_run("PAGE ")
    run_right.font.name = 'Google Sans'
    run_right.font.size = Pt(8.5)
    
    run_num2 = p.add_run()
    run_num2.font.name = 'Google Sans'
    run_num2.font.size = Pt(8.5)
    add_page_number_fields(run_num2)
    
    p.paragraph_format.space_before = Pt(6)

def add_heading_styled(doc, text, level=1):
    """Adds a bold heading in Google Sans with strict monochrome formatting."""
    h = doc.add_heading(text, level=level)
    h.paragraph_format.keep_with_next = True
    
    # Remove default styling and enforce Google Sans + Black
    for run in h.runs:
        run.font.name = 'Google Sans'
        run.font.color.rgb = RGBColor(0, 0, 0)
        run.font.bold = True
        if level == 1:
            run.font.size = Pt(14)
            h.paragraph_format.space_before = Pt(18)
            h.paragraph_format.space_after = Pt(6)
        elif level == 2:
            run.font.size = Pt(12)
            h.paragraph_format.space_before = Pt(14)
            h.paragraph_format.space_after = Pt(4)
        else:
            run.font.size = Pt(11)
            h.paragraph_format.space_before = Pt(12)
            h.paragraph_format.space_after = Pt(2)
    return h


def build_business_plan():
    """Compiles the DOCX document and saves it."""
    doc = Document()
    
    # Set document margins (1 inch on all sides)
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
    
    # ==========================================
    # 1. TITLE PAGE
    # ==========================================
    # Spacer
    for _ in range(3):
        doc.add_paragraph()
        
    # Logo
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_logo = p_logo.add_run()
    run_logo.add_picture(LOGO_PATH, width=Inches(1.8))
    
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    # Brand Name & Title
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_after = Pt(4)
    run_title = p_title.add_run("KESARARAM TRAFFIC EDUCATION NETWORK")
    run_title.font.name = 'Google Sans'
    run_title.font.size = Pt(22)
    run_title.font.bold = True
    
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(24)
    run_sub = p_sub.add_run("FIVE-YEAR STRATEGIC BUSINESS PLAN // PROJECT CODENAME: KWD")
    run_sub.font.name = 'Google Sans'
    run_sub.font.size = Pt(11)
    run_sub.font.bold = True
    
    # Metadata Box
    for _ in range(4):
        doc.add_paragraph()
        
    p_meta = doc.add_paragraph()
    p_meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_meta.paragraph_format.line_spacing = 1.3
    
    meta_runs = [
        ("TIMELINE: ", True), ("2026 – 2031 (FORWARD ANALYSIS)\n", False),
        ("INITIAL CAPITAL: ", True), ("$50.00 USD (DEVELOPMENT & INITIAL OPERATIONS)\n", False),
        ("LAUNCH TARGET: ", True), ("Q3 2026 (THIS YEAR)\n", False),
        ("PREPARED BY: ", True), ("THE KWD EXECUTIVE BOARD\n", False),
        ("TARGET READERS: ", True), ("STRATEGIC INVESTORS AND VENTURE PARTNERS", False)
    ]
    
    for label, is_bold in meta_runs:
        r = p_meta.add_run(label)
        r.font.name = 'Google Sans'
        r.font.size = Pt(9.5)
        r.font.bold = is_bold
        
    setup_page_footer(doc)
    doc.add_page_break()
    
    # ==========================================
    # 2. ABSTRACT
    # ==========================================
    add_heading_styled(doc, "Abstract", level=1)
    
    p_abs = doc.add_paragraph()
    p_abs.paragraph_format.line_spacing = 1.15
    run_abs = p_abs.add_run(
        "This strategic document outlines the execution and commercialization pathway for Kesararam "
        "Traffic Education Network (KWD), a software-as-a-service (SaaS) interactive learning platform "
        "tailored for the Cambodian driving license and traffic safety sector. KWD targets driving instructors, "
        "schools, and independent examinees seeking robust, seed-based randomized quizzes to pass state exams. "
        "With an initial capital input of exactly $50.00 USD, the project prioritizes developer tools and core cloud "
        "operations. By applying structured subscription bundles, modern algorithmic logic (cryptographic Fisher-Yates "
        "shuffling), and psychological value pricing, KWD aims to achieve high operating margins. Over a five-year "
        "forward-looking projection (2026 to 2031), the service will scale from local software instances to "
        "a centralized safety telemetry network, establishing high customer lifetime value and presenting "
        "a compelling, high-efficiency acquisition opportunity for strategic investors."
    )
    run_abs.font.name = 'Google Sans'
    
    # HUD title
    add_hud_bar(doc, "abstract telemetry data")
    
    make_callout_box(
        doc,
        "[HUD CALLOUT // ABSTRACT CORE METRIC]",
        "The project bootstrap model leverages a highly-optimized Next.js and PostgreSQL architecture, "
        "limiting infrastructure outlays to $50.00 USD in Year 1 while securing the target school "
        "market. Profitability is achieved inside Q3 2026."
    )
    
    doc.add_page_break()
    
    # ==========================================
    # 3. TABLE OF CONTENTS
    # ==========================================
    add_heading_styled(doc, "Table of Contents", level=1)
    
    toc_items = [
        ("1. Executive Summary & Market Pitch", "3"),
        ("2. Market Analysis & Target Audience", "3"),
        ("3. Product Specifications & Quota System", "4"),
        ("4. Commercial Architecture & Subscription Tiers", "4"),
        ("5. Marketing Strategy & Value Optimization", "5"),
        ("6. Five-Year Strategic Roadmap (2026–2031)", "5"),
        ("7. Workflows & Performance Auditing", "6"),
        ("8. Financial Growth Forecast & Charts", "7"),
        ("9. Appendix: Year 1 vs. Year 5 Telemetry", "8")
    ]
    
    for title, pg in toc_items:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r_title = p.add_run(title)
        r_title.font.name = 'Google Sans'
        r_title.font.bold = True
        
        # Dots
        dots_count = 80 - len(title) - len(pg)
        r_dots = p.add_run(" " + "." * dots_count + " ")
        r_dots.font.name = 'Google Sans'
        r_dots.font.color.rgb = RGBColor(150, 150, 150)
        
        r_pg = p.add_run(pg)
        r_pg.font.name = 'Google Sans'
        r_pg.font.bold = True
        
    doc.add_page_break()
    
    # ==========================================
    # 4. STRUCTURED BODY
    # ==========================================
    add_heading_styled(doc, "1. Executive Summary & Market Pitch", level=1)
    
    p = doc.add_paragraph(
        "Kesararam Traffic Education Network (KWD) introduces an innovative, software-driven approach to "
        "road safety and license preparation in Cambodia. Operating under a capital-efficient startup architecture, "
        "KWD is launched in 2026 with a $50.00 USD initial investment. This capital is allocated entirely to "
        "acquiring development tools, domain names, and hosting verification, eliminating unnecessary administrative "
        "overhead. The software relies on a scalable Next.js and PostgreSQL environment, permitting low-latency quiz "
        "delivery and manual, admin-mediated subscriptions designed to eliminate chargebacks and fraud."
    )
    p = doc.add_paragraph(
        "From an investor standpoint, KWD represents a low-risk, high-margin asset. By bypassing expensive automated "
        "payment gateways in the initial phase, the business avoids substantial compliance and transactional fees. "
        "Revenue is collected via direct, manual institutional bank transfers (ABA Bank) and activated by system "
        "administrators. Over the next five years, the platform will expand its content catalogue to integrate safety "
        "telemetry, driver training modules, and municipal traffic safety partnerships."
    )
    
    add_heading_styled(doc, "2. Market Analysis & Target Audience", level=1)
    
    p = doc.add_paragraph(
        "Cambodia's driver licensing sector has experienced rapid formalization, requiring all operators of cars, "
        "trucks, and heavy machinery to hold validated driving licenses. The target audience is segmented into two "
        "core brackets:"
    )
    
    # Bullet lists
    bullets = [
        ("Educational Institutions & Driving Schools: ", "Driving instructors and school administrators who need structured classes, student tracking, and mock exam environments. They require central reporting tools to ensure high exam pass rates for their enrolled cohorts."),
        ("Independent Driving Examinees: ", "Individual students preparing for the official Ministry of Public Works and Transport driving exam. They demand structured question banks, speed rounds, and road sign quizzes."),
        ("Municipal Traffic Administrators: ", "Local traffic safety divisions seeking to promote public road safety through institutional access and curriculum distributions.")
    ]
    
    for prefix, body in bullets:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(prefix)
        r_p.font.name = 'Google Sans'
        r_p.font.bold = True
        r_b = bp.add_run(body)
        r_b.font.name = 'Google Sans'
        
    add_hud_bar(doc, "target audience profile")
    
    make_callout_box(
        doc,
        "[HUD CALLOUT // STRATEGIC TARGET PROFILE]",
        "Intended Reader Profile: This document is crafted for early-stage venture capital firms, angel investors, "
        "and educational technology partners seeking to capture market share in developing Southeast Asian transport sectors."
    )
    
    doc.add_page_break()
    
    add_heading_styled(doc, "3. Product Specifications & Quota System", level=1)
    
    p = doc.add_paragraph(
        "KWD is built around an advanced learning system designed to simulate the official driving theory exam. "
        "The application utilizes a unique, seed-based selection algorithm to guarantee that users receive a "
        "balanced, unpredictable mix of categories (Road Signs, Priority, and General Driving rules) without "
        "relying on heavy client-side processing. The subscription tier guards ensure that system load is directly "
        "correlated with paid quotas."
    )
    
    p = doc.add_paragraph(
        "Each class in KWD has a dedicated quota that prevents abuse. Under the Free Plan, users cannot create "
        "classes or register students, serving as a read-only trial. The Teacher Pro Plan unlocks up to 5 classes "
        "and 50 students, which perfectly fits independent instructors. The School Plan removes these restrictions "
        "to serve larger institutions, offering unlimited classes and students."
    )
    
    add_heading_styled(doc, "4. Commercial Architecture & Subscription Tiers", level=1)
    
    p = doc.add_paragraph(
        "KWD utilizes a subscription-based software model. Direct system administration controls verify "
        "payment confirmation, manual assignment, and expiration tracking, ensuring absolute stability. "
        "Our pricing structure is meticulously constructed using three core marketing tips to maximize conversion:"
    )
    
    tips = [
        ("Odd Pricing Implementation: ", "Instead of rounded numbers, prices are positioned psychologically. The Teacher Pro plan is set at $9.99 per month, and the School Plan is set at $49.99 per month. This odd pricing creates a high perception of cost-effectiveness, reducing purchase resistance."),
        ("Structured Institutional Bundles: ", "Instead of selling individual student accounts, KWD packages accounts into high-value bundles. The School Plan bundles unlimited classrooms, unlimited students, and advanced institutional analytics for a single flat rate. This drives high-ticket contract sign-ups, as driving schools prefer predictable monthly operational budgets."),
        ("Selling the Benefit, Not the Product: ", "KWD's marketing material does not lead with database features, server uptimes, or API specifications. Instead, we sell student confidence, peace of mind, high official pass rates (reaching 92%+), reduced instructor time-management overhead, and road safety. We sell the benefit of a highly-rated, safe driving school brand.")
    ]
    
    for prefix, body in tips:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(prefix)
        r_p.font.name = 'Google Sans'
        r_p.font.bold = True
        r_b = bp.add_run(body)
        r_b.font.name = 'Google Sans'
        
    p = doc.add_paragraph(
        "By packaging the subscription this way, driving schools can offset KWD's subscription cost by charging a minor "
        "theory-prep fee (e.g., $1.00 per student) to their examinees, creating an immediate profit center for the school."
    )
    
    doc.add_page_break()
    
    add_heading_styled(doc, "5. Marketing Strategy & Value Optimization", level=1)
    
    p = doc.add_paragraph(
        "KWD's marketing relies heavily on high-converting B2B channels. Rather than deploying broad, expensive consumer ads "
        "that would exhaust our budget, KWD works directly with driving schools. By providing a 30-day trial (Teacher Pro status) "
        "to instructors, we let them experience the benefit firsthand. Once their students begin scoring higher and passing the "
        "official license test on their first attempt, the school naturally upgrades to the institutional School Plan."
    )
    
    p = doc.add_paragraph(
        "We also leverage shareable assets. The platform includes a 'Save Card' component that generates a high-resolution, bilingual "
        "sign image with the school's branding and a QR code linking back to the learning environment. When students share their "
        "mock test success cards on social media, it acts as a free referral engine for the driving school and for KWD."
    )
    
    add_heading_styled(doc, "6. Five-Year Strategic Roadmap (2026–2031)", level=1)
    
    p = doc.add_paragraph(
        "KWD's forward-looking roadmap is divided into three distinct development phases designed to grow "
        "commercial operations from a simple quiz helper to Cambodia's primary traffic safety platform:"
    )
    
    phases = [
        ("Phase 1: Bootstrapped Launch & B2B Pilot (2026 - 2027): ", "Deploying the core Next.js web portal using our $50.00 initial tools budget. Partnering with 15 pilot driving schools in Phnom Penh to prove student success rates. Setting Teacher Pro pricing at $9.99 and School Plan pricing at $49.99."),
        ("Phase 2: Regional Expansion & API Integration (2028 - 2029): ", "Expanding software coverage to secondary provinces (Siem Reap, Battambang, Sihanoukville). Integrating a lightweight REST API for driving schools to sync student records automatically. Developing automated subscription renewal reminders."),
        ("Phase 3: Public Sector Telemetry & Safety Audits (2030 - 2031): ", "Collaborating with municipal transport offices to license traffic safety analytics. Providing aggregated, anonymous safety data (identifying which road signs have the lowest student comprehension rates) to national safety commissions. Introducing premium vehicle safety and fleet tracking tiers.")
    ]
    
    for prefix, body in phases:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r_p = bp.add_run(prefix)
        r_p.font.name = 'Google Sans'
        r_p.font.bold = True
        r_b = bp.add_run(body)
        r_b.font.name = 'Google Sans'
        
    doc.add_page_break()
    
    # ==========================================
    # 5. DATA & WORKFLOWS
    # ==========================================
    add_heading_styled(doc, "7. Workflows & Performance Auditing", level=1)
    
    p = doc.add_paragraph(
        "The following diagram illustrates KWD's user interaction, subscription boundaries, and data flows. "
        "All user actions are validated against database schemas to ensure quota compliance and secure analytics processing."
    )
    
    # Insert Workflow Diagram
    p_diag = doc.add_paragraph()
    p_diag.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_diag = p_diag.add_run()
    run_diag.add_picture(DIAGRAM_PATH, width=Inches(6.2))
    
    p_cap = doc.add_paragraph()
    p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap.paragraph_format.space_after = Pt(12)
    run_cap = p_cap.add_run("Figure 1.0: Technical Architecture and Commercial Operations Workflow")
    run_cap.font.name = 'Google Sans'
    run_cap.font.italic = True
    run_cap.font.size = Pt(9)
    
    add_heading_styled(doc, "Onboarding Workflow: Step-by-Step", level=2)
    
    steps = [
        "Admin configures subscription status for an instructor (e.g., active, trial, or school).",
        "Instructor logs in and receives quota limits based on the assigned subscription model.",
        "Instructor creates classrooms and adds students up to their tier quota limit (50 students for Teacher Pro, unlimited for School).",
        "Students access practice modules (solo, speed challenge, sign practice). The selection engine shuffles questions using standard seeds.",
        "System records student results, updating class analytics in real time.",
        "Instructor views analytics to identify weak student cohorts, ensuring high pass rates on official government examinations.",
        "Subscription expires or undergoes manual renewal assessment via administrative dashboard."
    ]
    
    for i, step in enumerate(steps, 1):
        sp = doc.add_paragraph()
        sp.paragraph_format.left_indent = Inches(0.25)
        sp.paragraph_format.space_after = Pt(3)
        r_num = sp.add_run(f"{i}.  ")
        r_num.font.name = 'Google Sans'
        r_num.font.bold = True
        r_text = sp.add_run(step)
        r_text.font.name = 'Google Sans'
        
    p = doc.add_paragraph().paragraph_format.space_after = Pt(6)
    
    # Table of Subscription Tiers
    add_heading_styled(doc, "Platform Pricing and Quota Table", level=2)
    
    pricing_data = [
        ["Plan Tier", "Monthly Price", "Student Quota", "Classroom Quota", "Key Feature Access"],
        ["Free Plan", "$0.00 / mo", "0 Students", "0 Classrooms", "Read-Only Practice"],
        ["Teacher Pro", "$9.99 / mo", "50 Students", "5 Classrooms", "Analytics, Custom Content"],
        ["School Plan", "$49.99 / mo", "Unlimited", "Unlimited", "School-Wide Analytics, Bulk Tools"]
    ]
    
    table = doc.add_table(rows=len(pricing_data), cols=5)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    set_table_borders(table)
    
    # Set widths: col 0 = 1.2, col 1 = 1.2, col 2 = 1.2, col 3 = 1.2, col 4 = 1.7 inches
    widths = [Inches(1.2), Inches(1.2), Inches(1.2), Inches(1.2), Inches(1.7)]
    
    for i, row in enumerate(table.rows):
        # Header formatting
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths[j]
            cell.text = pricing_data[i][j]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            
            # Format text
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if j < 4 else WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9.5)
                r.font.bold = is_header
                
            # Shading header cells in light grey (since we can only use black and white)
            if is_header:
                shading = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shading)
                
    doc.add_page_break()
    
    # ==========================================
    # 6. CHARTS
    # ==========================================
    add_heading_styled(doc, "8. Financial Growth Forecast & Charts", level=1)
    
    p = doc.add_paragraph(
        "KWD's financial trajectory is built on low infrastructure overhead and high subscription retention. "
        "The following charts compare projected active subscriber growth against monthly recurring revenue (MRR) "
        "over our five-year operational horizon. Our initial tool investment of $50.00 is recovered in Month 1."
    )
    
    # Insert Matplotlib growth chart
    p_chart = doc.add_paragraph()
    p_chart.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_chart = p_chart.add_run()
    run_chart.add_picture(CHART_PATH, width=Inches(6.2))
    
    p_cap2 = doc.add_paragraph()
    p_cap2.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_cap2.paragraph_format.space_after = Pt(12)
    run_cap2 = p_cap2.add_run("Figure 2.0: Five-Year Projected Growth: Subscriber Base and MRR Comparison")
    run_cap2.font.name = 'Google Sans'
    run_cap2.font.italic = True
    run_cap2.font.size = Pt(9)
    
    # Add HUD bar
    add_hud_bar(doc, "financial projection telemetry")
    
    make_callout_box(
        doc,
        "[HUD CALLOUT // OPERATIONS RATIO]",
        "Year 1 margins exceed 90% due to manual subscription processing and zero transaction fees. "
        "Year 5 projections maintain 85%+ margins while factoring in cloud database scaling, backup storage, "
        "and school relationship staff."
    )
    
    doc.add_page_break()
    
    # ==========================================
    # 7. APPENDIX
    # ==========================================
    add_heading_styled(doc, "9. Appendix: Year 1 vs. Year 5 Telemetry", level=1)
    
    p = doc.add_paragraph(
        "The following table compares our primary metrics from the end of Year 1 against the end of Year 5. "
        "This data highlights KWD's high scalability and long-term investor appeal."
    )
    
    appendix_data = [
        ["Metric Category", "Year 1 Output (2026)", "Year 5 Output (2031)", "Operational Delta (%)"],
        ["Active Subscribers", "120 accounts", "5,400 accounts", "+4,400%"],
        ["Monthly Recurring Revenue (MRR)", "$1,198.80", "$53,946.00", "+4,400%"],
        ["Annual Gross Revenue", "$14,385.60", "$647,352.00", "+4,400%"],
        ["Operating Costs", "$50.00", "$2,400.00", "+4,700%"],
        ["Net Margin", "99.5%", "95.5%", "-4.0%"]
    ]
    
    table2 = doc.add_table(rows=len(appendix_data), cols=4)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    table2.autofit = False
    set_table_borders(table2)
    
    # Set widths: col 0 = 2.0, col 1 = 1.5, col 2 = 1.5, col 3 = 1.5 inches
    widths2 = [Inches(2.0), Inches(1.5), Inches(1.5), Inches(1.5)]
    
    for i, row in enumerate(table2.rows):
        is_header = (i == 0)
        for j, cell in enumerate(row.cells):
            cell.width = widths2[j]
            cell.text = appendix_data[i][j]
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if j == 0 else WD_ALIGN_PARAGRAPH.CENTER
            for r in p.runs:
                r.font.name = 'Google Sans'
                r.font.size = Pt(9.5)
                r.font.bold = is_header
                
            if is_header:
                shd = parse_xml(r'<w:shd %s w:fill="E0E0E0"/>' % nsdecls('w'))
                cell._tc.get_or_add_tcPr().append(shd)
                
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    p_end = doc.add_paragraph()
    p_end.paragraph_format.space_before = Pt(24)
    p_end.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_end = p_end.add_run("// END OF REPORT // SYSTEM SECURE // KWD TELEMETRY TERMINATED //")
    run_end.font.name = 'Google Sans'
    run_end.font.bold = True
    run_end.font.size = Pt(9.5)
    
    # Save the file
    doc.save(DOCX_PATH)
    print(f"Business plan compiled successfully at {DOCX_PATH}")

# ==========================================
# MAIN EXECUTION
# ==========================================

if __name__ == '__main__':
    try:
        print("Starting asset generation...")
        generate_logo()
        generate_growth_chart()
        generate_workflow_diagram()
        
        print("Starting business plan document compilation...")
        build_business_plan()
        print("Success! Process completed.")
    except Exception as e:
        print(f"Error during execution: {e}", file=sys.stderr)
        sys.exit(1)
