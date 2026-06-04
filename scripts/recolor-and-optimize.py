import os
from PIL import Image

def recolor_green_to_dark_gray(img_path, dest_path, x_range=None, y_range=None, max_dim=1000, quality=80):
    if not os.path.exists(img_path):
        print(f"Error: Source file does not exist: {img_path}")
        return False
    
    try:
        with Image.open(img_path) as img:
            # Convert to RGBA for pixel manipulation
            rgba_img = img.convert("RGBA")
            pixels = rgba_img.load()
            width, height = rgba_img.size
            
            recolored_count = 0
            for y in range(height):
                for x in range(width):
                    # Check bounding box restrictions if provided
                    if x_range and not (x_range[0] <= x <= x_range[1]):
                        continue
                    if y_range and not (y_range[0] <= y <= y_range[1]):
                        continue
                    
                    r, g, b, a = pixels[x, y]
                    
                    # Detect KWD Brand Green: Green is dominant, Red is low (to exclude yellows/lime), Green is bright enough
                    # R: ~34, G: ~197, B: ~94
                    if g > r * 1.3 and g > b * 1.1 and r < 120 and g > 50:
                        # Convert to grayscale representation and scale down to make it dark gray/black
                        # while preserving any highlights/shading
                        val = int((r + g + b) / 3 * 0.22)
                        # Ensure it matches the dark KWD text (RGB around 30-40)
                        val = max(20, min(val, 45))
                        pixels[x, y] = (val, val, val, a)
                        recolored_count += 1
            
            print(f"Recolored {recolored_count} green pixels in {os.path.basename(img_path)}")
            
            # Convert back to RGB for saving (WebP)
            final_img = rgba_img.convert("RGB")
            
            # Resize for web performance
            w, h = final_img.size
            if max(w, h) > max_dim:
                new_w = max_dim if w > h else int(w * max_dim / h)
                new_h = max_dim if h > w else int(h * max_dim / w)
                final_img = final_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            final_img.save(dest_path, "WEBP", quality=quality)
            return True
    except Exception as e:
        print(f"Error recoloring {img_path}: {e}")
        return False

def optimize_direct_webp(src_path, dest_path, max_dim=1000, quality=80):
    try:
        with Image.open(src_path) as img:
            rgb_img = img.convert("RGB")
            w, h = rgb_img.size
            if max(w, h) > max_dim:
                new_w = max_dim if w > h else int(w * max_dim / h)
                new_h = max_dim if h > w else int(h * max_dim / w)
                rgb_img = rgb_img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            rgb_img.save(dest_path, "WEBP", quality=quality)
            print(f"Direct optimized {os.path.basename(src_path)} -> {os.path.basename(dest_path)}")
            return True
    except Exception as e:
        print(f"Error optimizing {src_path}: {e}")
        return False

def main():
    dest_dir = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/public/rewards"
    os.makedirs(dest_dir, exist_ok=True)
    
    # 1. Direct WebP optimization for v2 premium items (Notebook, Pencil, Pen)
    v2_items = [
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_notebook_v2_1780604799015.png", "notebook.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_pencil_v2_1780604816286.png", "pencil.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_pen_v2_1780604834798.png", "pen.webp")
    ]
    for src, dest_name in v2_items:
        dest_path = os.path.join(dest_dir, dest_name)
        optimize_direct_webp(src, dest_path)
        
    # 2. Recolor green-to-black/gray and save to WebP for remaining items
    recolor_items = [
        # (src, dest_name, x_range, y_range)
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_ruler_1780604503287.png", "ruler.webp", None, None),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_eraser_1780604520461.png", "eraser.webp", None, None),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_highlighter_1780604539023.png", "highlighter.webp", (300, 700), (400, 600)),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_sticky_notes_1780604557472.png", "sticky_notes.webp", (500, 1024), (0, 500)),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_geometry_set_1780604578981.png", "geometry_set.webp", None, None),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/reward_study_planner_1780604598837.png", "study_planner.webp", None, None)
    ]
    
    for src, dest_name, x_range, y_range in recolor_items:
        dest_path = os.path.join(dest_dir, dest_name)
        recolor_green_to_dark_gray(src, dest_path, x_range, y_range)

if __name__ == "__main__":
    main()
