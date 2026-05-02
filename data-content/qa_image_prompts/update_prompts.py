import os
import re
import textwrap

directory = '/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/data-content/qa_image_prompts'

def clean_text(text):
    replacements = {
        r'\baccident(s)?\b': 'incident',
        r'\bvictim(s)?\b': 'person',
        r'\bblood(ing)?\b': 'injury',
        r'\bwound(s)?\b': 'affected area',
        r'\bdead\b': 'unresponsive',
        r'\bdeath(s)?\b': 'severe condition',
        r'\bkill(s|ed|ing)?\b': 'injure',
        r'\bcrash(es|ed)?\b': 'collision incident',
        r'\bHIV\b': 'health condition',
        r'\bAIDS\b': 'health condition',
        r'\bsex(ual(ly)?)?\b': 'intimate contact',
        r'\bprostitute(s)?\b': 'individuals',
        r'\bprostitution\b': 'adult entertainment',
        r'\balcohol\b': 'beverage',
        r'\bdrunk\b': 'intoxicated',
        r'\bweapon(s)?\b': 'items',
        r'\bblood\b': 'injury',
        r'\bbone break\b': 'fracture',
        r'\bslap\b': 'touch',
        r'\bbite\b': 'touch',
    }
    for pattern, rep in replacements.items():
        text = re.sub(pattern, rep, text, flags=re.IGNORECASE)
    
    # remove double spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We will find all blocks separated by "----------------------------------------------------------------------"
    blocks = content.split('----------------------------------------------------------------------')
    new_blocks = []
    
    for block in blocks:
        if 'IMAGE PROMPT:' not in block:
            new_blocks.append(block)
            continue
            
        # extract Q (EN)
        q_en_match = re.search(r'Q \(EN\):\s*(.*?)\n', block)
        question = q_en_match.group(1).strip() if q_en_match else ""
        
        # extract Answer (EN)
        # It's after Q (EN): and before IMAGE PROMPT:
        # Looking for the line ending with ✓ or containing ✓
        en_part = block.split('Q (EN):')[1].split('IMAGE PROMPT:')[0]
        answer_match = re.search(r'\d\.\s*(.*?)✓', en_part)
        answer = answer_match.group(1).strip() if answer_match else ""
        
        # extract Scene from existing prompt
        scene_match = re.search(r'Scene:\s*(.*?)\.\s*Depict the correct behavior', block, flags=re.DOTALL)
        if scene_match:
            scene = scene_match.group(1).strip()
            # clean scene text (newlines)
            scene = re.sub(r'\s+', ' ', scene)
        else:
            scene = "general Cambodian road safety awareness scene, diverse road users — pedestrians, cyclists and motorists — Cambodian urban or suburban environment, daytime"
            
        # Clean them
        c_question = clean_text(question)
        c_answer = clean_text(answer)
        c_scene = clean_text(scene)
        
        new_prompt = (
            f"Professional, 4K ultra-HD photorealistic image representing Cambodian road traffic safety. "
            f"Scene: {c_scene}. "
            f"Visual context involves a situation where: {c_question} The focus is on the appropriate action: {c_answer}. "
            f"Show road markings and traffic signs with English text labels ONLY (absolutely no Khmer text, no Khmer script in the image). "
            f"Cambodian characters (driver / pedestrian / officer) in authentic Khmer attire. "
            f"Cambodian setting, Khmer cultural identity, traditional Cambodian architecture visible, "
            f"authentic Southeast Asian tropical atmosphere, realistic Cambodian characters in typical Khmer clothing, "
            f"4K, professional, cinematic lighting, sharp details."
        )
        
        wrapped_prompt = textwrap.fill(new_prompt, width=100, initial_indent='  ', subsequent_indent='  ')
        new_image_prompt = f"IMAGE PROMPT:\n{wrapped_prompt}\n"
        
        # replace the old IMAGE PROMPT block
        # we will regex replace from IMAGE PROMPT: to the end of the block
        new_block = re.sub(r'IMAGE PROMPT:.*', new_image_prompt, block, flags=re.DOTALL)
        new_blocks.append(new_block)

    new_content = '----------------------------------------------------------------------'.join(new_blocks)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

for filename in os.listdir(directory):
    if filename.endswith('.txt'):
        filepath = os.path.join(directory, filename)
        process_file(filepath)
        print(f"Processed {filename}")

