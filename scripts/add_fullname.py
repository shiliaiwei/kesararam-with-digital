import re, json

PATH = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/scripts/parsed_students.json"

# Same Khmer-to-Latin table used by parse_xlsx.py (kept in sync).
KHMER_TO_LATIN = {
    'ក': 'k', 'ខ': 'kh', 'គ': 'k', 'ឃ': 'kh', 'ង': 'ng',
    'ច': 'ch', 'ឆ': 'ch', 'ជ': 'ch', 'ឈ': 'ch', 'ញ': 'nh',
    'ដ': 'd', 'ឋ': 'th', 'ឌ': 'd', 'ឍ': 'th', 'ណ': 'n',
    'ត': 't', 'ថ': 'th', 'ទ': 't', 'ធ': 'th', 'ន': 'n',
    'ប': 'b', 'ផ': 'ph', 'ព': 'p', 'ភ': 'ph', 'ម': 'm',
    'យ': 'y', 'រ': 'r', 'ល': 'l', 'វ': 'v', 'ស': 's', 'ហ': 'h', 'ឡ': 'l', 'អ': 'o',
    'ា': 'a', 'ិ': 'i', 'ី': 'i', 'ឹ': 'u', 'ឺ': 'u', 'ុ': 'u', 'ូ': 'u', 'ួ': 'uo',
    'ើ': 'oe', 'ឿ': 'oe', 'ៀ': 'ie', 'េ': 'e', 'ែ': 'ae', 'ៃ': 'ai', 'ោ': 'o', 'ៅ': 'au',
    'ុំ': 'um', 'ំ': 'm', 'ាំ': 'am', 'ះ': 'ah', 'ុះ': 'uh', 'េះ': 'eh', 'ោះ': 'oh',
    '័': '', '៏': '', '៍': '', '៌': '', 'ៈ': '', '់': '',
    '្': '',
    'ឥ': 'e', 'ឦ': 'ei', 'ឧ': 'u', 'ឨ': 'uk', 'ឱ': 'ao', 'ឲ': 'ao', 'ឪ': 'au',
    'ឫ': 'rue', 'ឬ': 'rue', 'ឭ': 'lue', 'ឮ': 'lue', 'ឯ': 'ae', 'ឰ': 'ai',
    '​': '', '‌': '', '‍': ''
}

def romanize_word(text):
    out = []
    for ch in text:
        if ch in KHMER_TO_LATIN:
            out.append(KHMER_TO_LATIN[ch])
        elif ch.isalnum() and ord(ch) < 128:
            out.append(ch.lower())
    return "".join(out)

def romanize_fullname(text):
    clean = re.sub(r'\(.*?\)', '', text).strip()
    parts = [p for p in re.split(r'\s+', clean) if p]
    words = [romanize_word(p) for p in parts]
    words = [w for w in words if w]
    return " ".join(w.capitalize() for w in words) or "Student"

with open(PATH, encoding="utf-8") as f:
    students = json.load(f)

for s in students:
    s["fullname"] = romanize_fullname(s["name"])

with open(PATH, "w", encoding="utf-8") as f:
    json.dump(students, f, ensure_ascii=False, indent=2)

print(f"Added English fullname to {len(students)} students.")
for s in students[:8]:
    print(f"  {s['name']}  ->  fullname='{s['fullname']}'  username='{s['username']}'")
