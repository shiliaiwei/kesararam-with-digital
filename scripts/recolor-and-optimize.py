import os
from PIL import Image

def optimize_to_webp(src_path, dest_path, max_dim=1000, quality=80):
    if not os.path.exists(src_path):
        print(f"Error: Source file does not exist: {src_path}")
        return False
    try:
        with Image.open(src_path) as img:
            rgb_img = img.convert("RGB")
            w, h = rgb_img.size
            if max(w, h) > max_dim:
                new_w = max_dim if w > h else int(w * max_dim / h)
                new_h = max_dim if h > w else int(h * max_dim / w)
                rgb_img = rgb_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            rgb_img.save(dest_path, "WEBP", quality=quality)
            print(f"Optimized {os.path.basename(src_path)} -> {os.path.basename(dest_path)}: {os.path.getsize(dest_path)/1024:.1f} KB")
            return True
    except Exception as e:
        print(f"Error optimizing {src_path}: {e}")
        return False

def main():
    dest_dir = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/public/rewards"
    os.makedirs(dest_dir, exist_ok=True)
    
    mapping = [
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_notebook_v5_1780606680872.png", "notebook.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_pencil_v5_1780606694164.png", "pencil.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_pen_v5_1780606708954.png", "pen.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_ruler_v4_1780606592435.png", "ruler.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_eraser_v4_1780606626724.png", "eraser.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_highlighter_v3_1780606023284.png", "highlighter.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_sticky_notes_v3_1780606049771.png", "sticky_notes.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_geometry_set_v3_1780606074919.png", "geometry_set.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_study_planner_v3_1780606102940.png", "study_planner.webp")
    ]
    
    for src_path, dest_name in mapping:
        dest_path = os.path.join(dest_dir, dest_name)
        optimize_to_webp(src_path, dest_path)

if __name__ == "__main__":
    main()
