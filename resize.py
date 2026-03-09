import os
from PIL import Image

def resize_image(file_in, scale, file_out):
    if not os.path.exists(file_in):
        print(f"Skipping {file_in}, not found")
        return
    with Image.open(file_in) as img:
        width, height = img.size
        new_size = (int(width * scale), int(height * scale))
        resized = img.resize(new_size, Image.Resampling.LANCZOS)
        resized.save(file_out, "WEBP", quality=85)
        print(f"Created {file_out} at {new_size}")

# Create @2x files for the logo
resize_image('images/logo_auto_shock.webp', 2.0, 'images/logo_auto_shock@2x.webp')

# Let's also create the @2x hero image for the index page as an example of srcset
resize_image('images/hero_bg.webp', 2.0, 'images/hero_bg@2x.webp')
