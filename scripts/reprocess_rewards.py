import os
import sys
from brand_reward_images import process_reward_image

def main():
    source_dir = "/Users/Apple16/.gemini/antigravity-ide/brain/56393010-a813-4f18-8f2f-03b046024760"
    dest_dir = "public/rewards"
    logo_path = "public/brand/kwd-black_nobackground.png"
    
    mapping = [
        ("reward_notebook_v6_1780736248188.png", "notebook.webp"),
        ("reward_pencil_v6_1780736264869.png", "pencil.webp"),
        ("reward_pen_v6_1780736281738.png", "pen.webp"),
        ("reward_ruler_v5_1780736296036.png", "ruler.webp"),
        ("reward_eraser_v5_1780736311591.png", "eraser.webp"),
        ("reward_highlighter_v4_1780736327060.png", "highlighter.webp"),
        ("reward_sticky_notes_v4_1780736344095.png", "sticky_notes.webp"),
        ("reward_geometry_set_v4_1780736360473.png", "geometry_set.webp"),
        ("reward_study_planner_v4_1780736377887.png", "study_planner.webp")
    ]
    
    success_count = 0
    for src_name, dest_name in mapping:
        input_path = os.path.join(source_dir, src_name)
        output_path = os.path.join(dest_dir, dest_name)
        
        # Position can be top-right. Let's make size=32 for small/elegant, opacity=0.75 for subtlety
        success = process_reward_image(
            input_path=input_path,
            output_path=output_path,
            logo_path=logo_path,
            position='top-right',
            size=32,
            padding=24,
            opacity=0.75
        )
        if success:
            success_count += 1
            
    print(f"Reprocessing completed: {success_count}/{len(mapping)} files succeeded.")

if __name__ == '__main__':
    main()
