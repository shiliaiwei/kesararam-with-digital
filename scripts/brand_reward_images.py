import os
import sys
import argparse
from PIL import Image

def get_subtle_logo(logo, opacity=0.85):
    """
    Adjust the alpha channel of the logo to make it more subtle and elegant.
    """
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    r, g, b, a = logo.split()
    # Multiply the alpha channel by the opacity level
    a_new = a.point(lambda p: int(p * opacity))
    return Image.merge('RGBA', (r, g, b, a_new))

def process_reward_image(input_path, output_path, logo_path, position='top-right', size=40, padding=24, opacity=0.85):
    try:
        if not os.path.exists(input_path):
            print(f"Error: Input file does not exist: {input_path}")
            return False
        if not os.path.exists(logo_path):
            print(f"Error: Logo file does not exist: {logo_path}")
            return False

        # Load the raw generated image
        img = Image.open(input_path)
        img_w, img_h = img.size
        
        # Crop to 16:9 aspect ratio from center
        new_w = img_w
        new_h = int(img_w * 9 / 16)
        
        # In case the image height is less than 9/16 width, crop from height instead
        if new_h > img_h:
            new_h = img_h
            new_w = int(img_h * 16 / 9)
            
        left = (img_w - new_w) // 2
        top = (img_h - new_h) // 2
        right = left + new_w
        bottom = top + new_h
        
        img_cropped = img.crop((left, top, right, bottom))
        
        # Resize to standard width (e.g. 1920x1080 for web, or keep high resolution up to 1920 max dim)
        max_dim = 1920
        w, h = img_cropped.size
        if max(w, h) > max_dim:
            new_w = max_dim if w > h else int(w * max_dim / h)
            new_h = max_dim if h > w else int(h * max_dim / w)
            img_cropped = img_cropped.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Load the official logo
        logo = Image.open(logo_path)
        
        # Make the logo subtle using opacity adjustment
        logo_subtle = get_subtle_logo(logo, opacity)
        
        # Resize logo keeping aspect ratio
        logo_w, logo_h = logo_subtle.size
        scaled_logo_w = size
        scaled_logo_h = int(logo_h * size / logo_w)
        logo_resized = logo_subtle.resize((scaled_logo_w, scaled_logo_h), Image.Resampling.LANCZOS)
        
        # Position calculations
        final_w, final_h = img_cropped.size
        if position == 'top-right':
            lx = final_w - scaled_logo_w - padding
            ly = padding
        elif position == 'top-left':
            lx = padding
            ly = padding
        else:
            lx = final_w - scaled_logo_w - padding
            ly = padding
            
        # Paste logo onto cropped image with transparency mask
        img_cropped.paste(logo_resized, (lx, ly), logo_resized)
        
        # Ensure the destination folder exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Save as WebP with high quality
        img_cropped.save(output_path, 'WEBP', quality=95)
        print(f"Successfully processed: {os.path.basename(input_path)} -> {output_path} ({final_w}x{final_h})")
        return True
    except Exception as e:
        print(f"Error processing image {input_path}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Crop and brand reward store images with the KWD logo.")
    parser.add_argument('--input', required=True, help="Input raw PNG image path")
    parser.add_argument('--output', required=True, help="Output WebP image path")
    parser.add_argument('--logo', default='public/brand/kwd-black_nobackground.png', help="Path to KWD logo")
    parser.add_argument('--position', default='top-right', choices=['top-left', 'top-right'], help="Corner to place the logo")
    parser.add_argument('--size', type=int, default=32, help="Logo size in pixels (default: 32 for small and elegant)")
    parser.add_argument('--padding', type=int, default=24, help="Logo padding from edge (default: 24)")
    parser.add_argument('--opacity', type=float, default=0.75, help="Logo opacity (default: 0.75 for subtleness)")
    
    args = parser.parse_args()
    success = process_reward_image(
        input_path=args.input,
        output_path=args.output,
        logo_path=args.logo,
        position=args.position,
        size=args.size,
        padding=args.padding,
        opacity=args.opacity
    )
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
