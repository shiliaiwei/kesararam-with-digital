#!/usr/bin/env python3
"""
Add subgroups to ALL 50 driving questions
"""

def add_subgroups_to_all(input_file, output_file):
    """Add subgroup below each question code"""
    
    # Balanced distribution across 3 subgroups
    subgroup_map = {
        # Basic Maneuvers (Q1-Q17) - fundamental driving skills
        **{i: "Basic Maneuvers" for i in range(1, 18)},
        
        # Advanced Techniques (Q18-Q34) - complex driving situations  
        **{i: "Advanced Techniques" for i in range(18, 35)},
        
        # Defensive Driving (Q35-Q50) - safety and awareness
        **{i: "Defensive Driving" for i in range(35, 51)},
    }
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    new_lines = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)
        
        # Check if this is a question code line
        if line.strip().startswith('DRV-Q'):
            q_num = int(line.strip().replace('DRV-Q', ''))
            
            # Check if next line is already a subgroup
            if i + 1 < len(lines) and lines[i + 1].strip().startswith('Sub-group:'):
                # Skip the old subgroup line, we'll add the correct one
                i += 1
            
            # Add correct subgroup
            subgroup = subgroup_map.get(q_num, "Basic Maneuvers")
            new_lines.append(f"Sub-group: {subgroup}\n")
        
        i += 1
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print(f"✓ Added subgroups to all 50 questions")
    print(f"✓ Basic Maneuvers: Q1-Q17 (17 questions)")
    print(f"✓ Advanced Techniques: Q18-Q34 (17 questions)")
    print(f"✓ Defensive Driving: Q35-Q50 (16 questions)")

if __name__ == "__main__":
    input_file = "qa_prompts_clean_no_emotion/4_Driving.txt"
    output_file = "qa_prompts_clean_no_emotion/4_Driving.txt"
    add_subgroups_to_all(input_file, output_file)
