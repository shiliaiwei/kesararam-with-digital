import openpyxl
import re
import json
import os

filepath = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/បញ្ជឺឈ្មោះសិស្សរៀនឌីជីថល.xlsx"
output_path = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/scripts/parsed_students.json"

wb = openpyxl.load_workbook(filepath)
sheet = wb.active

students = []
col_groups = [(0, 1, 2), (4, 5, 6), (8, 9, 10)]

# Khmer-to-Latin transliteration table
KHMER_TO_LATIN = {
    'ក': 'k', 'ខ': 'kh', 'គ': 'k', 'ឃ': 'kh', 'ង': 'ng',
    'ច': 'ch', 'ឆ': 'ch', 'ជ': 'ch', 'ឈ': 'ch', 'ញ': 'nh',
    'ដ': 'd', 'ឋ': 'th', 'ឌ': 'd', 'ឍ': 'th', 'ណ': 'n',
    'ត': 't', 'ថ': 'th', 'ទ': 't', 'ធ': 'th', 'ន': 'n',
    'ប': 'b', 'ផ': 'ph', 'ព': 'p', 'ភ': 'ph', 'ម': 'm',
    'យ': 'y', 'រ': 'r', 'ល': 'l', 'វ': 'v', 'ស': 's', 'ហ': 'h', 'ឡ': 'l', 'អ': 'o',
    # vowels and diacritics
    'ា': 'a', 'ិ': 'i', 'ី': 'i', 'ឹ': 'u', 'ឺ': 'u', 'ុ': 'u', 'ូ': 'u', 'ួ': 'uo',
    'ើ': 'oe', 'ឿ': 'oe', 'ៀ': 'ie', 'េ': 'e', 'ែ': 'ae', 'ៃ': 'ai', 'ោ': 'o', 'ៅ': 'au',
    'ុំ': 'um', 'ំ': 'm', 'ាំ': 'am', 'ះ': 'ah', 'ុះ': 'uh', 'េះ': 'eh', 'ោះ': 'oh',
    '័': '', '៏': '', '៍': '', '៌': '', 'ៈ': '', '់': '',
    # sub-consonant marker
    '្': '',
    # independent vowels
    'ឥ': 'e', 'ឦ': 'ei', 'ឧ': 'u', 'ឨ': 'uk', 'ឱ': 'ao', 'ឲ': 'ao', 'ឪ': 'au',
    'ឫ': 'rue', 'ឬ': 'rue', 'ឭ': 'lue', 'ឮ': 'lue', 'ឯ': 'ae', 'ឰ': 'ai', 'ឱ': 'ao',
    # zero-width spaces/joins
    '\u200b': '', '\u200c': '', '\u200d': ''
}

def romanize_khmer(text):
    # Strip parentheses and comments
    clean_text = re.sub(r'\(.*?\)', '', text).strip()
    result = []
    for char in clean_text:
        if char in KHMER_TO_LATIN:
            result.append(KHMER_TO_LATIN[char])
        elif char.isspace():
            result.append('_')
        elif char.isalnum() and ord(char) < 128:
            result.append(char.lower())
    
    romanized = "".join(result)
    romanized = re.sub(r'_+', '', romanized)
    return romanized

for r in range(1, sheet.max_row + 1):
    row_values = [cell.value for cell in sheet[r]]
    for no_col, name_col, gender_col in col_groups:
        if name_col < len(row_values) and gender_col < len(row_values):
            no = row_values[no_col]
            name = row_values[name_col]
            gender = row_values[gender_col]
            if name and gender:
                name_str = str(name).strip()
                gender_str = str(gender).strip()
                no_str = str(no).strip() if no is not None else ""
                
                students.append({
                    "no": no_str,
                    "name": name_str,
                    "gender": gender_str
                })

# Resolve uniqueness in usernames
seen_usernames = {}
duplicate_count = 0

for s in students:
    roman = romanize_khmer(s['name'])
    if not roman:
        roman = "student"
        
    base_roman = roman
    counter = 2
    while roman in seen_usernames:
        roman = f"{base_roman}{counter}"
        counter += 1
        duplicate_count += 1
        
    seen_usernames[roman] = s['name']
    s['username'] = roman

# Write to json file
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(students, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully parsed {len(students)} students (handled {duplicate_count} duplicates).")
print(f"Exported to {output_path}")
