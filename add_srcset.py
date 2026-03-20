import os
import glob
import re

html_files = glob.glob('*.html')
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
        
    # Clean up first to avoid duplication
    content = content.replace('src="images/logo_auto_shock.webp" srcset="images/logo_auto_shock.webp 1x, images/logo_auto_shock@2x.webp 2x"', 'src="images/logo_auto_shock.webp"')
    content = content.replace('src="images/hero_bg.webp" srcset="images/hero_bg.webp 1x, images/hero_bg@2x.webp 2x"', 'src="images/hero_bg.webp"')
    
    content = content.replace(
        'src="images/logo_auto_shock.webp"',
        'src="images/logo_auto_shock.webp" srcset="images/logo_auto_shock.webp 1x, images/logo_auto_shock@2x.webp 2x"'
    )
    
    content = content.replace(
        'src="images/hero_bg.webp"',
        'src="images/hero_bg.webp" srcset="images/hero_bg.webp 1x, images/hero_bg@2x.webp 2x"'
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
print("Added srcset to logos successfully.")
