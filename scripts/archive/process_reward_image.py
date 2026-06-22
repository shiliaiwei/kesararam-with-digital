import argparse
import sys
from PIL import Image, ImageOps

def get_white_logo(logo):
    if logo.mode == 'RGBA':
        r, g, b, a = logo.split()
        # Create a solid white image of the same size
        white_img = Image.new('RGB', logo.size, (255, 255, 255))
        w_r, w_g, w_b = white_img.split()
        return Image.merge('RGBA', (w_r, w_g, w_b, a))
    else:
        return ImageOps.invert(logo)

def process_image(input_path, output_path, center_color, center_size, y_offset):
    try:
        # Load generated image
        img = Image.open(input_path)
        img_w, img_h = img.size
        
        # Crop to 16:9 aspect ratio from center
        new_w = img_w
        new_h = int(img_w * 9 / 16)
        top = (img_h - new_h) // 2
        bottom = top + new_h
        img_cropped = img.crop((0, top, new_w, bottom))
        
        # Load official KWD logo
        logo_path = 'public/brand/kwd-black_nobackground.png'
        logo = Image.open(logo_path)
        
        # 1. Center Logo Overlay
        if center_color == 'white':
            center_logo = get_white_logo(logo)
        else:
            center_logo = logo
            
        center_logo_resized = center_logo.resize((center_size, center_size), Image.Resampling.LANCZOS)
        
        cx = (new_w - center_size) // 2
        cy = ((new_h - center_size) // 2) + y_offset
        
        # Paste center logo with transparency mask
        img_cropped.paste(center_logo_resized, (cx, cy), center_logo_resized)
        
        # 2. Corner Logo Overlay (Official Black KWD Logo, always black since background is light)
        corner_size = 40
        corner_logo_resized = logo.resize((corner_size, corner_size), Image.Resampling.LANCZOS)
        
        # Top-right corner with 24px padding
        rx = new_w - corner_size - 24
        ry = 24
        
        img_cropped.paste(corner_logo_resized, (rx, ry), corner_logo_resized)
        
        # Save as WebP
        img_cropped.save(output_path, 'WEBP', quality=95)
        print(f"Processed image saved to {output_path}")
        return True
    except Exception as e:
        print(f"Error processing image {input_path}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Crop and overlay KWD logo on reward store product images.")
    parser.add_argument('--input', required=True, help="Input PNG image path")
    parser.add_argument('--output', required=True, help="Output WebP image path")
    parser.add_argument('--color', default='white', choices=['white', 'black'], help="Center logo color")
    parser.add_argument('--size', type=int, default=75, help="Center logo size in pixels")
    parser.add_argument('--y-offset', type=int, default=0, help="Vertical offset for center logo")
    
    args = parser.parse_args()
    success = process_image(args.input, args.output, args.color, args.size, args.y_offset)
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
