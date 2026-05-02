import os
import re
import textwrap

directory = '/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/data-content/qa_image_prompts'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove the dashes and ensure proper spacing
    content = re.sub(r'\n-{70}', '', content)
    
    def prompt_replacer(match):
        prompt_text = match.group(1)
        # Extract Scene
        scene_match = re.search(r'Scene: (.*?)(?=\s*Visual context|\s*Show road)', prompt_text, flags=re.DOTALL)
        if scene_match:
            scene = scene_match.group(1).replace('\n', ' ').strip()
            scene = re.sub(r'\s+', ' ', scene)
            if not scene.endswith('.'):
                scene += '.'
        else:
            scene = "general Cambodian road safety awareness scene, diverse road users — pedestrians, cyclists and motorists — Cambodian urban or suburban environment, daytime."
            
        new_prompt = (
            f"Professional, 4K ultra-HD photorealistic image representing Cambodian road traffic safety. "
            f"Scene: {scene} "
            f"Show road markings, traffic signs (symbols only, absolutely no text), and personnel/people. "
            f"Cambodian characters (driver / pedestrian / officer) in authentic Khmer attire. "
            f"Cambodian setting, Khmer cultural identity, traditional Cambodian architecture visible, "
            f"authentic Southeast Asian tropical atmosphere, realistic Cambodian characters in typical Khmer clothing, "
            f"4K, professional, cinematic lighting, sharp details."
        )
        
        wrapped_prompt = textwrap.fill(new_prompt, width=100, initial_indent='  ', subsequent_indent='  ')
        return f"IMAGE PROMPT:\n{wrapped_prompt}"
        
    # The prompt block starts with IMAGE PROMPT:\n and ends before an empty line
    content = re.sub(r'IMAGE PROMPT:\n(.*?)(?=\n\n|\Z)', prompt_replacer, content, flags=re.DOTALL)
    
    # Cleanup multiple blank lines
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for filename in os.listdir(directory):
    if filename.endswith('.txt'):
        filepath = os.path.join(directory, filename)
        process_file(filepath)
        print(f"Processed {filename}")

