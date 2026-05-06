#!/usr/bin/env python3
"""
Script to restore original 50 questions (remove questions 51-75)
and keep subgroups for the original 50
"""

def restore_original_50(input_file, output_file):
    """Keep only questions 1-50 with subgroups"""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by question delimiter
    sections = content.split('----------------------------------------------------------------------')
    
    new_content = []
    
    # Update header
    header = sections[0].replace('Total : 75 questions', 'Total : 50 questions')
    new_content.append(header)
    
    # Process only questions 1-50
    for section in sections[1:]:
        if section.strip():
            lines = section.strip().split('\n')
            if lines and lines[0].startswith('DRV-Q'):
                # Extract question number
                q_num = int(lines[0].replace('DRV-Q', ''))
                
                # Only keep questions 1-50
                if q_num <= 50:
                    new_content.append('\n' + '\n'.join(lines))
                    new_content.append('\n----------------------------------------------------------------------')
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(new_content))
    
    print(f"✓ Restored original 50 questions to: {output_file}")
    print(f"✓ Subgroups preserved for all 50 questions")

if __name__ == "__main__":
    input_file = "qa_prompts_clean_no_emotion/4_Driving.txt"
    output_file = "qa_prompts_clean_no_emotion/4_Driving.txt"
    restore_original_50(input_file, output_file)
