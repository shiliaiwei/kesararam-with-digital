import os
from PIL import Image

def optimize_and_save_webp(src_path, dest_path, max_dim=1400, quality=80):
    if not os.path.exists(src_path):
        print(f"Error: Source file does not exist: {src_path}")
        return False
    
    try:
        with Image.open(src_path) as img:
            # Convert RGBA to RGB if saving to WebP/JPEG (Pillow handles WebP transparent conversion but let's make sure it's clean)
            if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                # We can save RGBA as WebP directly, but converting to RGB with background if opaque makes sense
                # WebP supports alpha, so we keep mode if it has alpha, but for product mockups RGB is standard.
                pass
            
            # Resize if dimensions exceed max_dim
            w, h = img.size
            if max(w, h) > max_dim:
                if w > h:
                    new_w = max_dim
                    new_h = int((h * max_dim) / w)
                else:
                    new_h = max_dim
                    new_w = int((w * max_dim) / h)
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                print(f"Resized {src_path} from {w}x{h} to {new_w}x{new_h}")
            
            img.save(dest_path, "WEBP", quality=quality)
            orig_size = os.path.getsize(src_path)
            new_size = os.path.getsize(dest_path)
            print(f"Optimized {os.path.basename(src_path)} -> {os.path.basename(dest_path)}")
            print(f"  Size: {orig_size / 1024:.1f} KB -> {new_size / 1024:.1f} KB ({new_size/orig_size*100:.1f}%)")
            return True
    except Exception as e:
        print(f"Error processing {src_path}: {e}")
        return False

def main():
    dest_dir = "/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/brand-mockups"
    os.makedirs(dest_dir, exist_ok=True)
    
    mockups = [
        # (src, dest_name)
        ("/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/public/brand/tote_stationery_mockup.png", "tote_stationery.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/educational_blocks_1780603316602.png", "educational_blocks.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/mug_bottle_1780603333978.png", "mug_bottle.webp"),
        ("/Applications/XAMPP/xamppfiles/htdocs/KWD/kesararam/public/brand/apparel_brand_mockup.png", "apparel_brand.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/desktop_app_1780603604871.png", "desktop_app.webp"),
        ("/Users/Apple16/.gemini/antigravity-ide/brain/9d45657a-b273-4530-9391-4d0494a7e365/corporate_stationery_1780603366176.png", "corporate_stationery.webp")
    ]
    
    for src, dest_name in mockups:
        dest_path = os.path.join(dest_dir, dest_name)
        optimize_and_save_webp(src, dest_path)

if __name__ == "__main__":
    main()
