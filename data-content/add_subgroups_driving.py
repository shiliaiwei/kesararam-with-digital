#!/usr/bin/env python3
"""
Script to add subgroups to Driving category questions and add new questions
"""

# Define subgroup assignments based on question content
subgroup_assignments = {
    # Basic Maneuvers (Q1-Q20)
    range(1, 21): "Basic Maneuvers",
    # Advanced Techniques (Q21-Q40)
    range(21, 41): "Advanced Techniques",
    # Defensive Driving (Q41-Q50)
    range(41, 51): "Defensive Driving",
}

# Additional questions for each subgroup
additional_questions = {
    "Basic Maneuvers": [
        {
            "id": 51,
            "km_q": "តើការចាប់ផ្ដើមបើកបរត្រូវធ្វើអ្វីខ្លះ?",
            "km_a": "ត្រូវពិនិត្យកញ្ចក់ មើលសញ្ញា និងចាប់ផ្ដើមយឺតៗ",
            "en_q": "What should you do when starting to drive?",
            "en_a": "Check mirrors, give signals, and start slowly"
        },
        {
            "id": 52,
            "km_q": "តើការឈប់រថយន្តត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវបន្ថយល្បឿនជាបន្តបន្ទាប់ ចាប់ហ្វ្រាំងថ្នមៗ និងឈប់ត្រង់",
            "en_q": "How should you stop a vehicle properly?",
            "en_a": "Gradually reduce speed, apply brakes gently, and stop straight"
        },
        {
            "id": 53,
            "km_q": "តើការបត់ត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវឱ្យសញ្ញា បន្ថយល្បឿន និងបត់យឺតៗ",
            "en_q": "How should you make a turn?",
            "en_a": "Give signal, reduce speed, and turn slowly"
        },
        {
            "id": 54,
            "km_q": "តើការថយក្រោយត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវមើលខាងក្រោយឱ្យច្បាស់ ឱ្យសញ្ញា និងថយយឺតៗ",
            "en_q": "How should you reverse properly?",
            "en_a": "Look behind clearly, give signal, and reverse slowly"
        },
        {
            "id": 55,
            "km_q": "តើការចតត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវរកកន្លែងសមស្រប ឱ្យសញ្ញា និងចតត្រង់",
            "en_q": "How should you park properly?",
            "en_a": "Find suitable place, give signal, and park straight"
        },
    ],
    "Advanced Techniques": [
        {
            "id": 56,
            "km_q": "តើការបើកបរនៅលើផ្លូវភ្នំត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវប្រើលេខទាប រក្សាល្បឿនសមស្រប និងប្រុងប្រយ័ត្នខ្ពស់",
            "en_q": "How should you drive on mountain roads?",
            "en_a": "Use low gear, maintain appropriate speed, and be highly cautious"
        },
        {
            "id": 57,
            "km_q": "តើការបើកបរកាត់ទឹកជ្រៅត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវបើកយឺត រក្សាល្បឿនថេរ និងមិនឈប់កណ្ដាល",
            "en_q": "How should you drive through deep water?",
            "en_a": "Drive slowly, maintain steady speed, and don't stop in the middle"
        },
        {
            "id": 58,
            "km_q": "តើការបើកបរពេលយប់ត្រូវប្រុងប្រយ័ត្នអ្វីខ្លះ?",
            "km_a": "ត្រូវប្រើភ្លើងត្រឹមត្រូវ បន្ថយល្បឿន និងរក្សាចម្ងាយសុវត្ថិភាព",
            "en_q": "What precautions for night driving?",
            "en_a": "Use proper lights, reduce speed, and maintain safety distance"
        },
        {
            "id": 59,
            "km_q": "តើការបើកបរពេលភ្លៀងធ្លាក់ត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវបន្ថយល្បឿន បើកភ្លើង និងរក្សាចម្ងាយឆ្ងាយ",
            "en_q": "How should you drive in rain?",
            "en_a": "Reduce speed, turn on lights, and keep longer distance"
        },
        {
            "id": 60,
            "km_q": "តើការបើកបរលើផ្លូវរអិលត្រូវធ្វើដូចម្ដេច?",
            "km_a": "ត្រូវបើកយឺតៗ មិនចាប់ហ្វ្រាំងរំលោះ និងកាច់ចង្កូតថ្នមៗ",
            "en_q": "How should you drive on slippery roads?",
            "en_a": "Drive slowly, don't brake suddenly, and steer gently"
        },
    ],
    "Defensive Driving": [
        {
            "id": 61,
            "km_q": "តើការបើកបរការពារគឺជាអ្វី?",
            "km_a": "ជាការបើកបរដោយព្យាករណ៍គ្រោះថ្នាក់ និងរៀបចំការពារ",
            "en_q": "What is defensive driving?",
            "en_a": "Driving by predicting dangers and preparing protection"
        },
        {
            "id": 62,
            "km_q": "តើត្រូវរក្សាចម្ងាយសុវត្ថិភាពយ៉ាងដូចម្ដេច?",
            "km_a": "ត្រូវរក្សាចម្ងាយគ្រប់គ្រាន់ដើម្បីឈប់បានទាន់ពេល",
            "en_q": "How to maintain safety distance?",
            "en_a": "Keep sufficient distance to stop in time"
        },
        {
            "id": 63,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលឃើញគ្រោះថ្នាក់?",
            "km_a": "ត្រូវបន្ថយល្បឿន ឱ្យសញ្ញា និងជៀសវាង",
            "en_q": "What to do when seeing danger?",
            "en_a": "Reduce speed, give signal, and avoid"
        },
        {
            "id": 64,
            "km_q": "តើត្រូវប្រុងប្រយ័ត្នអ្វីខ្លះនៅផ្លូវប្រសព្វ?",
            "km_a": "ត្រូវបន្ថយល្បឿន មើលគ្រប់ទិស និងឱ្យសិទ្ធិអាទិភាព",
            "en_q": "What precautions at intersections?",
            "en_a": "Reduce speed, look all directions, and give priority"
        },
        {
            "id": 65,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលអ្នកដទៃបើកបរមិនត្រឹមត្រូវ?",
            "km_a": "ត្រូវរក្សាចម្ងាយ ប្រុងប្រយ័ត្ន និងជៀសវាង",
            "en_q": "What to do when others drive incorrectly?",
            "en_a": "Keep distance, be cautious, and avoid"
        },
        {
            "id": 66,
            "km_q": "តើត្រូវមើលកញ្ចក់ញឹកញាប់ប៉ុន្មាន?",
            "km_a": "ត្រូវមើលជារៀងរាល់ ៥-៨ វិនាទី",
            "en_q": "How often should you check mirrors?",
            "en_a": "Check every 5-8 seconds"
        },
        {
            "id": 67,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលអ្នកដទៃបើកបរឆ្គង?",
            "km_a": "ត្រូវឱ្យផ្លូវ បន្ថយល្បឿន និងរក្សាសុវត្ថិភាព",
            "en_q": "What to do when others drive aggressively?",
            "en_a": "Give way, reduce speed, and stay safe"
        },
        {
            "id": 68,
            "km_q": "តើត្រូវប្រុងប្រយ័ត្នអ្វីខ្លះនៅពេលបើកបរក្បែរកុមារ?",
            "km_a": "ត្រូវបន្ថយល្បឿន ប្រុងប្រយ័ត្នខ្ពស់ និងរៀបចំឈប់",
            "en_q": "What precautions when driving near children?",
            "en_a": "Reduce speed, be highly alert, and prepare to stop"
        },
        {
            "id": 69,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលអស់កម្លាំង?",
            "km_a": "ត្រូវឈប់សម្រាក មិនបង្ខំបើកបរ",
            "en_q": "What to do when tired?",
            "en_a": "Stop and rest, don't force driving"
        },
        {
            "id": 70,
            "km_q": "តើត្រូវរៀបចំអ្វីខ្លះមុនធ្វើដំណើរឆ្ងាយ?",
            "km_a": "ត្រូវពិនិត្យរថយន្ត រៀបចំផែនការ និងសម្រាកគ្រប់គ្រាន់",
            "en_q": "What to prepare before long journey?",
            "en_a": "Check vehicle, plan route, and rest sufficiently"
        },
        {
            "id": 71,
            "km_q": "តើត្រូវប្រុងប្រយ័ត្នអ្វីខ្លះនៅពេលបើកបរក្បែរមូតូ?",
            "km_a": "ត្រូវរក្សាចម្ងាយ ប្រុងប្រយ័ត្ន និងឱ្យផ្លូវគ្រប់គ្រាន់",
            "en_q": "What precautions when driving near motorcycles?",
            "en_a": "Keep distance, be cautious, and give enough space"
        },
        {
            "id": 72,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលឃើញរថយន្តសង្គ្រោះបន្ទាន់?",
            "km_a": "ត្រូវឱ្យផ្លូវ ចត ឬបន្ថយល្បឿន",
            "en_q": "What to do when seeing emergency vehicles?",
            "en_a": "Give way, park, or reduce speed"
        },
        {
            "id": 73,
            "km_q": "តើត្រូវប្រុងប្រយ័ត្នអ្វីខ្លះនៅតំបន់សាលារៀន?",
            "km_a": "ត្រូវបើកយឺត ប្រុងប្រយ័ត្នខ្ពស់ និងរៀបចំឈប់",
            "en_q": "What precautions in school zones?",
            "en_a": "Drive slowly, be highly alert, and prepare to stop"
        },
        {
            "id": 74,
            "km_q": "តើត្រូវធ្វើដូចម្ដេចនៅពេលមើលមិនច្បាស់?",
            "km_a": "ត្រូវបន្ថយល្បឿន បើកភ្លើង និងប្រុងប្រយ័ត្ន",
            "en_q": "What to do when visibility is poor?",
            "en_a": "Reduce speed, turn on lights, and be cautious"
        },
        {
            "id": 75,
            "km_q": "តើត្រូវរក្សាអារម្មណ៍ដូចម្ដេចពេលបើកបរ?",
            "km_a": "ត្រូវរក្សាអារម្មណ៍ស្ងប់ស្ងាត់ មិនខឹង និងមានការអត់ធ្មត់",
            "en_q": "How to maintain emotions while driving?",
            "en_a": "Stay calm, don't get angry, and be patient"
        },
    ]
}

def get_subgroup(question_num):
    """Get subgroup for a question number"""
    for q_range, subgroup in subgroup_assignments.items():
        if question_num in q_range:
            return subgroup
    # Default for new questions
    if question_num >= 51 and question_num <= 55:
        return "Basic Maneuvers"
    elif question_num >= 56 and question_num <= 60:
        return "Advanced Techniques"
    else:
        return "Defensive Driving"

def add_subgroups_to_file(input_file, output_file):
    """Add subgroups to existing questions and append new ones"""
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Split by question delimiter
    sections = content.split('----------------------------------------------------------------------')
    
    new_content = []
    new_content.append(sections[0])  # Header
    
    # Process existing questions (skip header)
    for i, section in enumerate(sections[1:], 1):
        if section.strip():
            lines = section.strip().split('\n')
            if lines and lines[0].startswith('DRV-Q'):
                # Extract question number
                q_num = int(lines[0].replace('DRV-Q', ''))
                subgroup = get_subgroup(q_num)
                
                # Check if subgroup already exists
                has_subgroup = any('Sub-group:' in line for line in lines)
                
                if has_subgroup:
                    # Just keep as is
                    new_section = '\n' + '\n'.join(lines)
                else:
                    # Add subgroup line after question code
                    new_section = f"\n{lines[0]}\nSub-group: {subgroup}\n" + '\n'.join(lines[1:])
                
                new_content.append(new_section)
                new_content.append('\n----------------------------------------------------------------------')
    
    # Add new questions
    for subgroup, questions in additional_questions.items():
        for q in questions:
            new_q = f"""
DRV-Q{q['id']:03d}
Sub-group: {subgroup}
{q['km_q']}
{q['km_a']}
{q['en_q']}
{q['en_a']}
----------------------------------------------------------------------"""
            new_content.append(new_q)
    
    # Write output
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(''.join(new_content))
    
    print(f"✓ Updated file written to: {output_file}")
    print(f"✓ Total questions: 75")
    print(f"✓ Subgroups added to all questions")

if __name__ == "__main__":
    input_file = "qa_prompts_clean_no_emotion/4_Driving.txt"
    output_file = "qa_prompts_clean_no_emotion/4_Driving_UPDATED.txt"
    add_subgroups_to_file(input_file, output_file)
