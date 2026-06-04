import os
import sys
import glob
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

def find_latest_file(source_dir, pattern):
    """
    Search for files matching the pattern in source_dir and return the path of the latest one.
    Pattern can be e.g. "*notebook*.png".
    """
    search_pattern = os.path.join(source_dir, pattern)
    files = glob.glob(search_pattern)
    if not files:
        # Try case-insensitive fallback or search recursively
        search_pattern_lower = os.path.join(source_dir, pattern.lower())
        files = glob.glob(search_pattern_lower)
        
    if not files:
        return None
        
    # Return the file with the latest modification time
    return max(files, key=os.path.getmtime)

def main():
    # 1. Parse command-line argument for source directory
    source_dir = None
    if len(sys.argv) > 1:
        source_dir = sys.argv[1]
    else:
        # Try to locate the current active brain directory dynamically
        possible_dirs = [
            "/Users/Apple16/.gemini/antigravity/brain/0791ea33-be41-4c3b-a571-99b1142459d7",
            "/Users/Apple16/.gemini/antigravity-ide/brain/0791ea33-be41-4c3b-a571-99b1142459d7",
            "/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365",
            "/Users/Apple16/.gemini/antigravity/brain/9d45657a-b273-4530-9391-4d0494a7e365"
        ]
        for d in possible_dirs:
            if os.path.exists(d):
                source_dir = d
                break
                
    if not source_dir or not os.path.exists(source_dir):
        print("Error: Source directory containing generated images not found.")
        print("Please provide the source directory path as an argument:")
        print("  python scripts/recolor-and-optimize.py /path/to/generated/images")
        sys.exit(1)
        
    print(f"Using source directory: {source_dir}")
    dest_dir = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/public/rewards"
    os.makedirs(dest_dir, exist_ok=True)
    
    # Define mapping of items
    # Format: (search_pattern, dest_name, should_recolor, x_range, y_range)
    items_mapping = [
        # Premium items (Direct WebP)
        ("*notebook*.png", "notebook.webp", False, None, None),
        ("*pencil*.png", "pencil.webp", False, None, None),
        ("*pen*.png", "pen.webp", False, None, None),
        
        # Remaining items
        ("*ruler*.png", "ruler.webp", True, None, None),
        ("*eraser*.png", "eraser.webp", True, None, None),
        ("*highlighter*.png", "highlighter.webp", True, (300, 700), (400, 600)),
        ("*sticky*.png", "sticky_notes.webp", True, (500, 1024), (0, 500)),
        ("*geometry*.png", "geometry_set.webp", True, None, None),
        ("*planner*.png", "study_planner.webp", True, None, None),
    ]
    
    success_count = 0
    for pattern, dest_name, should_recolor, x_range, y_range in items_mapping:
        src_path = find_latest_file(source_dir, pattern)
        if not src_path:
            # Try matching without underscores or slightly different patterns
            alt_pattern = pattern.replace("_", "")
            src_path = find_latest_file(source_dir, alt_pattern)
            
        if not src_path:
            print(f"Warning: No source file found matching pattern '{pattern}' in {source_dir}")
            continue
            
        dest_path = os.path.join(dest_dir, dest_name)
        print(f"Found source: {os.path.basename(src_path)} for {dest_name}")
        
        if should_recolor:
            success = recolor_green_to_dark_gray(src_path, dest_path, x_range, y_range)
        else:
            success = optimize_direct_webp(src_path, dest_path)
            
        if success:
            success_count += 1
            
    print(f"Completed! Successfully processed {success_count}/{len(items_mapping)} items.")

if __name__ == "__main__":
    main()
