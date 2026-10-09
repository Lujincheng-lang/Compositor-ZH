from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
image = Image.new('RGBA', (256, 256), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
draw.rounded_rectangle((8, 8, 248, 248), radius=40, fill='#65a7e2')
font = ImageFont.truetype('C:/Windows/Fonts/segoeuib.ttf', 140)
box = draw.textbbox((0, 0), 'Co', font=font)
draw.text(((256 - (box[2] - box[0])) / 2, (256 - (box[3] - box[1])) / 2 - box[1]), 'Co', fill='#152332', font=font)
image.save(root / 'electron' / 'icon.png')
image.save(root / 'electron' / 'icon.ico', sizes=[(16,16), (24,24), (32,32), (48,48), (64,64), (128,128), (256,256)])
