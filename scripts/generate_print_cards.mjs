import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const JSON_PATH = join(__dirname, "../tmp/pdfs/nskafl_credentials.json");
const HTML_OUTPUT_PATH = join(__dirname, "../output/nskafl_credentials_cards.html");

function generateCardHtml(cred) {
  const badgeText = cred.id; // e.g. "E1", "1", "2"
  const fullName = cred.fullName || "";
  
  // Determine if name is in Khmer (contains Khmer unicode range)
  const isKhmer = /[\u1780-\u17FF]/.test(fullName);
  const nameClass = isKhmer ? "name-kh" : "name-en";

  // Compact user silhouette SVG
  const avatarSvg = `
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  `;

  return `
    <div class="card-cell">
      <div class="card">
        <!-- Card Header -->
        <div class="card-header">
          <div class="header-left">
            <span class="project-title-kh">វិថីសុវត្ថិភាព</span>
            <span class="project-title-en">The Way of Safety</span>
          </div>
          <div class="header-right">
            <span class="header-url">kesararamwithdigital.tech</span>
          </div>
        </div>
        
        <!-- Caution Divider -->
        <div class="card-tape"></div>
        
        <!-- Card Body -->
        <div class="card-body">
          <div class="profile-row">
            <div class="avatar-circle">
              ${avatarSvg}
            </div>
            <div class="student-name ${nameClass}">${fullName}</div>
          </div>
          
          <div class="creds-box">
            <div class="cred-row">
              <span class="cred-label">USER:</span>
              <span class="cred-value">${cred.username}</span>
            </div>
            <div class="cred-row">
              <span class="cred-label">PASS:</span>
              <span class="cred-value pw-highlight">${cred.password}</span>
            </div>
          </div>
        </div>
        
        <!-- Card Badge Overlay -->
        <div class="card-badge">${badgeText}</div>
      </div>
    </div>
  `;
}

function main() {
  console.log(`Reading credentials from: ${JSON_PATH}`);
  const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
  const credentials = data.credentials;
  const classCode = data.class.code;
  const className = data.class.name;
  const totalStudents = credentials.length;

  console.log(`Loaded ${totalStudents} students. Structuring HTML layout...`);

  // Group cards into pages of 32 (4 columns x 8 rows)
  const CARDS_PER_PAGE = 32;
  const pages = [];
  for (let i = 0; i < credentials.length; i += CARDS_PER_PAGE) {
    pages.push(credentials.slice(i, i + CARDS_PER_PAGE));
  }

  const totalPages = pages.length;

  let pagesHtml = "";
  pages.forEach((pageCards, pageIdx) => {
    const pageNum = pageIdx + 1;
    let gridHtml = "";
    pageCards.forEach((cred) => {
      gridHtml += generateCardHtml(cred);
    });

    pagesHtml += `
      <div class="page">
        <!-- Page Header -->
        <div class="page-header-row">
          <div class="class-info">
            <span class="class-code-badge">${classCode}</span>
            <span class="class-title-text">បញ្ជីគណនីសិស្ស (ថ្នាក់៖ ${className}) — វិថីសុវត្ថិភាព / The Way of Safety</span>
          </div>
          <div class="page-counter">
            សរុប៖ <b>${totalStudents}</b> នាក់ &nbsp;·&nbsp; ទំព័រ៖ <b>${pageNum}</b> / ${totalPages}
          </div>
        </div>
        
        <!-- Page Header Caution Tape -->
        <div class="header-tape"></div>
        
        <!-- Cards Grid -->
        <div class="cards-grid">
          ${gridHtml}
        </div>
      </div>
    `;
  });

  const fullHtml = `<!doctype html>
<html lang="km">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>KWD Student Login Cards — Class ${classCode}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700;900&family=Roboto+Mono:wght@700;900&family=Roboto:wght@500;700;900&display=swap" rel="stylesheet">
  <style>
    /* Reset & Page setup */
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      background: #f4f4f5;
      font-family: 'Roboto', sans-serif;
      color: #000;
      padding: 20px;
    }
    
    /* print button */
    .no-print-bar {
      max-width: 210mm;
      margin: 0 auto 15px auto;
      background: #fff;
      border: 3px solid #000;
      box-shadow: 4px 4px 0 #000;
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .print-btn {
      background: #eab308;
      border: 2px solid #000;
      box-shadow: 2px 2px 0 #000;
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 900;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      transition: all 0.1s ease;
    }
    
    .print-btn:hover {
      transform: translate(-1px, -1px);
      box-shadow: 3px 3px 0 #000;
    }
    
    .print-btn:active {
      transform: translate(1px, 1px);
      box-shadow: 1px 1px 0 #000;
    }
    
    .print-info-title {
      font-size: 14px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .print-info-desc {
      font-size: 11px;
      color: #71717a;
      margin-top: 2px;
      font-weight: 700;
    }

    /* Page Container */
    .page {
      background: #fff;
      width: 210mm;
      height: 297mm;
      margin: 0 auto 30px auto;
      padding: 10mm 10mm;
      position: relative;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      page-break-after: always;
      page-break-inside: avoid;
    }

    /* Page Header */
    .page-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 7mm;
      margin-bottom: 2mm;
    }
    
    .class-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .class-code-badge {
      background: #000;
      color: #eab308;
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 900;
      font-family: 'Roboto Mono', monospace;
    }
    
    .class-title-text {
      font-family: 'Noto Sans Khmer', sans-serif;
      font-size: 11px;
      font-weight: 900;
    }
    
    .page-counter {
      font-size: 10px;
      font-family: 'Noto Sans Khmer', sans-serif;
      font-weight: 700;
      color: #52525b;
    }
    
    .page-counter b {
      color: #000;
    }

    /* Caution Tape elements */
    .header-tape {
      background: repeating-linear-gradient(
        -45deg,
        #eab308,
        #eab308 8px,
        #0a0a0a 8px,
        #0a0a0a 16px
      );
      height: 8px;
      border-top: 1.5px solid #000;
      border-bottom: 1.5px solid #000;
      margin-bottom: 3mm;
      width: 100%;
    }

    .card-tape {
      background: repeating-linear-gradient(
        -45deg,
        #eab308,
        #eab308 5px,
        #0a0a0a 5px,
        #0a0a0a 10px
      );
      height: 4px;
      border-top: 1px solid #000;
      border-bottom: 1px solid #000;
      width: 100%;
      margin: 0;
    }

    /* Cards Grid (4 columns x 8 rows) */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      grid-template-rows: repeat(8, 1fr);
      gap: 2.5mm;
      height: calc(100% - 15mm);
      align-content: start;
    }

    /* Cell holding card & cut lines */
    .card-cell {
      border: 1px dashed #a1a1aa;
      width: 100%;
      height: 30mm;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Individual Card (41mm x 26.5mm) */
    .card {
      width: 41mm;
      height: 26.5mm;
      border: 1.5px solid #000;
      background: #fff;
      box-shadow: 2px 2px 0 #000;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    /* Card Header */
    .card-header {
      background: #eab308;
      padding: 2px 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 6.5mm;
      border-bottom: 1.5px solid #000;
    }

    .header-left {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .project-title-kh {
      font-family: 'Noto Sans Khmer', sans-serif;
      font-size: 7.5px;
      font-weight: 900;
      color: #000;
    }

    .project-title-en {
      font-size: 5.5px;
      font-weight: 700;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 0.1px;
    }

    .header-url {
      font-size: 6px;
      font-weight: 900;
      font-family: 'Roboto Mono', monospace;
      color: #000;
    }

    /* Card Body */
    .card-body {
      padding: 3px 5px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    /* Student Profile Row */
    .profile-row {
      display: flex;
      align-items: center;
      height: 6.5mm;
    }

    .avatar-circle {
      width: 20px;
      height: 20px;
      border: 1.2px solid #000;
      background: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #000;
      flex-shrink: 0;
    }

    .student-name {
      margin-left: 5px;
      color: #000;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .student-name.name-kh {
      font-family: 'Noto Sans Khmer', sans-serif;
      font-weight: 900;
      font-size: 9.5px;
    }

    .student-name.name-en {
      font-family: 'Roboto', sans-serif;
      font-weight: 900;
      font-size: 9px;
      text-transform: uppercase;
    }

    /* Credentials Box */
    .creds-box {
      border: 1.2px solid #000;
      background: #fafafa;
      box-shadow: 1.5px 1.5px 0 #000;
      padding: 2px 4px;
      display: flex;
      flex-direction: column;
      gap: 0px;
    }

    .cred-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      line-height: 1.2;
    }

    .cred-label {
      font-family: 'Roboto Mono', monospace;
      font-weight: 900;
      font-size: 9.5px;
      color: #52525b;
    }

    .cred-value {
      font-family: 'Roboto Mono', monospace;
      font-weight: 900;
      font-size: 11.5px; /* Big & Bold as requested */
      color: #000;
    }
    
    .pw-highlight {
      color: #b45309;
      font-weight: 900;
    }

    /* Card ID Badge */
    .card-badge {
      position: absolute;
      right: 0;
      bottom: 0;
      border-top: 1.2px solid #000;
      border-left: 1.2px solid #000;
      background: #eab308;
      padding: 0px 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 7.5px;
      font-weight: 900;
      font-family: 'Roboto Mono', monospace;
      color: #000;
      height: 4.5mm;
    }

    /* Print media overrides */
    @media print {
      body {
        background: #fff;
        padding: 0;
      }
      
      .no-print-bar {
        display: none !important;
      }

      .page {
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
    }
  </style>
</head>
<body>

  <!-- Instruction bar at top (only visible on screen) -->
  <div class="no-print-bar">
    <div>
      <div class="print-info-title">🖨️ KWD Student Login Sheets — Redesigned</div>
      <div class="print-info-desc">Tighter layout (32 cards/page), custom project labels, corrected links, smaller cards, and enlarged user/pass text.</div>
    </div>
    <button class="print-btn" onclick="window.print()">Print / បោះពុម្ព</button>
  </div>

  <!-- Pages Container -->
  ${pagesHtml}

</body>
</html>
`;

  // Ensure output directory exists
  mkdirSync(dirname(HTML_OUTPUT_PATH), { recursive: true });
  
  writeFileSync(HTML_OUTPUT_PATH, fullHtml, "utf8");
  console.log(`Successfully generated HTML cards at: ${HTML_OUTPUT_PATH}`);
}

main();
