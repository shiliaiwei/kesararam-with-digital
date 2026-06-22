import os
import sys
from PIL import Image

def paste_logo(bg_path, logo_path, out_path, logo_w, pos_x_pct, pos_y_pct, opacity=0.75):
    if not os.path.exists(bg_path):
        print(f"Error: {bg_path} not found")
        return False
    try:
        img = Image.open(bg_path)
        w, h = img.size
        
        # Crop to 16:9
        new_h = int(w * 9 / 16)
        if new_h > h:
            new_h = h
            new_w = int(h * 16 / 9)
        else:
            new_w = w
            
        left = (w - new_w) // 2
        top = (h - new_h) // 2
        img_cropped = img.crop((left, top, left + new_w, top + new_h))
        
        final_w, final_h = img_cropped.size
        
        # Load logo
        logo = Image.open(logo_path)
        if logo.mode != 'RGBA':
            logo = logo.convert('RGBA')
            
        lw, lh = logo.size
        logo_h = int(lh * logo_w / lw)
        logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
        
        # Adjust opacity
        r, g, b, a = logo_resized.split()
        a_new = a.point(lambda p: int(p * opacity))
        logo_resized = Image.merge('RGBA', (r, g, b, a_new))
        
        # Position
        px = int(final_w * pos_x_pct - logo_w / 2)
        py = int(final_h * pos_y_pct - logo_h / 2)
        
        img_cropped.paste(logo_resized, (px, py), logo_resized)
        
        os.makedirs(os.path.dirname(out_path), exist_ok=True)
        img_cropped.save(out_path, 'WEBP', quality=95)
        print(f"Successfully branded: {os.path.basename(bg_path)} -> {out_path}")
        return True
    except Exception as e:
        print(f"Error branding {bg_path}: {e}")
        return False

def main():
    source_dir = "/Users/Apple16/.gemini/antigravity-ide/brain/56393010-a813-4f18-8f2f-03b046024760"
    dest_dir = "public/rewards"
    
    white_logo = "public/brand/kwd-white_nobackground.png"
    black_logo = "public/brand/kwdblacknobackground.png"
    
    # We place the KWD logo directly on the item inside the image
    items = [
        {
            "src": "reward_notebook_v7_1780736869839.png",
            "dest": "notebook.webp",
            "logo": white_logo,
            "width": 60,
            "x": 0.45,
            "y": 0.54,
            "opacity": 0.55
        },
        {
            "src": "reward_pencil_v7_1780736890860.png",
            "dest": "pencil.webp",
            "logo": white_logo,
            "width": 30,
            "x": 0.54,
            "y": 0.525,
            "opacity": 0.65
        }
    ]
    
    for item in items:
        src_path = os.path.join(source_dir, item["src"])
        dest_path = os.path.join(dest_dir, item["dest"])
        paste_logo(
            bg_path=src_path,
            logo_path=item["logo"],
            out_path=dest_path,
            logo_w=item["width"],
            pos_x_pct=item["x"],
            pos_y_pct=item["y"],
            opacity=item["opacity"]
        )

if __name__ == '__main__':
    main()
