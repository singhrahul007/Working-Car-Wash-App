from PIL import Image, ImageDraw, ImageFont
import os

# Create assets folder
os.makedirs('assets', exist_ok=True)

# Create icon.png (1024x1024)
icon = Image.new('RGB', (1024, 1024), color='#4A90E2')
draw = ImageDraw.Draw(icon)
draw.ellipse([250, 250, 774, 774], fill='white', outline='white')
draw.text((512, 512), 'CW', fill='#4A90E2', anchor='mm', font_size=200)
icon.save('assets/icon.png')

# Create adaptive-icon.png (1024x1024)
adaptive = Image.new('RGB', (1024, 1024), color='#4A90E2')
draw_adaptive = ImageDraw.Draw(adaptive)
draw_adaptive.ellipse([250, 250, 774, 774], fill='white', outline='white')
draw_adaptive.text((512, 512), '🚗', fill='#4A90E2', anchor='mm', font_size=300)
adaptive.save('assets/adaptive-icon.png')

# Create splash.png (1242x2436)
splash = Image.new('RGB', (1242, 2436), color='#4A90E2')
draw_splash = ImageDraw.Draw(splash)
logo_size = 600
logo_pos = (1242//2 - logo_size//2, 2436//2 - logo_size//2)
draw_splash.ellipse([logo_pos[0], logo_pos[1], logo_pos[0]+logo_size, logo_pos[1]+logo_size], 
                    fill='white', outline='white')
draw_splash.text((1242//2, 2436//2), 'CarWash\nIndia', fill='white', 
                 anchor='mm', font_size=120, align='center')
draw_splash.text((1242//2, 2436//2 + 400), 'Premium Car Care', fill='white', 
                 anchor='mm', font_size=60)
splash.save('assets/splash.png')

print("✅ Created all icon files in assets folder!")