# Eli's Athletic Lab icon: deep navy square, an orange lightning-bolt figure (a running stick athlete reduced to
# a bolt shape) over a lime arc. Distinct from Dugout Dad (green) and Dugout Lab (navy diamond). Drawn at 4x then downsampled.
from PIL import Image, ImageDraw
import sys, os
out = sys.argv[1]
NAVY = (31, 42, 68); ORANGE = (255, 122, 26); LIME = (232, 255, 71); WHITE = (255, 255, 255)

def icon(size, pad_ratio, rounded):
    S = size * 4
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if rounded: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=S * 0.225, fill=NAVY)
    else: d.rectangle([0, 0, S - 1, S - 1], fill=NAVY)
    p = pad_ratio * S
    # lime arc (an ascending curve)
    w = max(4, int(S * 0.05))
    d.arc([p + S * 0.12, p + S * 0.30, S - p - S * 0.12, S - p + S * 0.55], start=200, end=340, fill=LIME, width=w)
    # bolt
    cx = S / 2
    top, bot = p + S * 0.16, S - p - S * 0.16
    bolt = [(cx + S * 0.06, top), (cx - S * 0.16, cx + S * 0.02), (cx - S * 0.02, cx + S * 0.02), (cx - S * 0.08, bot), (cx + S * 0.16, cx - S * 0.06), (cx + S * 0.02, cx - S * 0.06)]
    d.polygon(bolt, fill=ORANGE)
    # small white dot (head) above the bolt
    r = S * 0.045
    d.ellipse([cx + S * 0.12 - r, top - S * 0.02 - r, cx + S * 0.12 + r, top - S * 0.02 + r], fill=WHITE)
    return img.resize((size, size), Image.LANCZOS)

for name, size, pad, rounded in [('icon-192.png', 192, 0.03, True), ('icon-512.png', 512, 0.03, True), ('icon-512-maskable.png', 512, 0.12, False), ('apple-touch-icon.png', 180, 0.04, False), ('favicon.png', 64, 0.03, True)]:
    icon(size, pad, rounded).save(os.path.join(out, name))
print('ok')
