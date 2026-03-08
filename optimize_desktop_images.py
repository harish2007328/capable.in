import os
from PIL import Image

# Directories
PUBLIC_DIR = r"c:\Users\Admin\OneDrive\Desktop\capable\public"

# Images to optimize (Desktop versions)
IMAGES = [
    "feature_lightning.webp",
    "feature_market.webp",
    "feature_roadmaps.webp",
    "feature_ai.webp",
    "1.webp",
    "2.webp",
    "bauhaus_last_gen.webp",
    "market_analysis_vector.webp",
    "action_roadmap_vector.webp"
]

def optimize_desktop():
    print(f"Starting desktop image optimization...")
    for img_name in IMAGES:
        src_path = os.path.join(PUBLIC_DIR, img_name)
        if not os.path.exists(src_path):
            continue
        
        try:
            with Image.open(src_path) as img:
                # Keep original dimensions but compress much more
                # WebP is already compressed, but let's re-save with lower quality (60)
                # and higher effort (method 6)
                img.save(src_path, "WEBP", quality=60, method=6)
                print(f"  Optimized {img_name} in place.")
                
        except Exception as e:
            print(f"  Error processing {img_name}: {e}")

if __name__ == "__main__":
    optimize_desktop()
