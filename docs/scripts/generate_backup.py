import csv

csv_file = '/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/data-content/csv/8_General.csv'
txt_file = '/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/data-content/backups/8_General_Backup.txt'

with open(csv_file, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader)
    
    with open(txt_file, 'w', encoding='utf-8') as out:
        out.write("==============================================================\n")
        out.write("             CATEGORY 8: GENERAL - BACKUP DATA                \n")
        out.write("==============================================================\n")
        out.write("This file contains a structured backup of Category 8 questions,\n")
        out.write("showing the direct relationship between Khmer and English.\n\n")
        
        for row in reader:
            if not ''.join(row).strip():
                continue
                
            code = row[0]
            q_km = row[1]
            a1_km, a2_km, a3_km = row[2], row[3], row[4]
            q_en = row[5]
            a1_en, a2_en, a3_en = row[6], row[7], row[8]
            correct = row[9]
            
            out.write(f"--- [ CODE: CAT8-{int(code):02d} ] ---\n")
            out.write(f"QUESTION (Khmer):   {q_km}\n")
            out.write(f"QUESTION (English): {q_en}\n\n")
            
            out.write("OPTIONS:\n")
            out.write(f"  1. [KM] {a1_km}\n")
            out.write(f"     [EN] {a1_en}\n")
            if correct == '1': out.write("     << CORRECT ANSWER >>\n")
            
            out.write(f"  2. [KM] {a2_km}\n")
            out.write(f"     [EN] {a2_en}\n")
            if correct == '2': out.write("     << CORRECT ANSWER >>\n")
            
            if a3_km.strip() or a3_en.strip():
                out.write(f"  3. [KM] {a3_km}\n")
                out.write(f"     [EN] {a3_en}\n")
                if correct == '3': out.write("     << CORRECT ANSWER >>\n")
                
            out.write("\n==============================================================\n\n")

print(f"Created backup at {txt_file}")
