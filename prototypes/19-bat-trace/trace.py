# Traces a figure on a white background into one clean outline. Usage: trace.py reference.png out.json
# Anything connected to the image's edge through light pixels is background; everything else, including inner highlights, is the figure.
import sys, json
from collections import deque
import numpy as np, potrace
from PIL import Image, ImageFilter
SCALE, LEVEL = 4, 128
src = Image.open(sys.argv[1]).convert("RGB")
big = src.resize((src.width * SCALE, src.height * SCALE), Image.BICUBIC).filter(ImageFilter.GaussianBlur(SCALE * 0.6))
lum = np.asarray(big).min(axis=2)
light = lum >= LEVEL
h, w = light.shape
bg = np.zeros((h, w), bool)
q = deque((y, x) for y, x in [(0, 0), (0, w-1), (h-1, 0), (h-1, w-1)] if light[y, x])
for p in q: bg[p] = True
while q:
    y, x = q.popleft()
    for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0 <= ny < h and 0 <= nx < w and light[ny,nx] and not bg[ny,nx]:
            bg[ny,nx] = True; q.append((ny,nx))
mask = ~bg
Image.fromarray((mask*255).astype('uint8')).resize((src.width, src.height)).save(sys.argv[2] + ".mask.png")
ys, xs = np.where(mask); print("bbox", xs.min()/SCALE, ys.min()/SCALE, xs.max()/SCALE, ys.max()/SCALE)
# Potrace keeps real corners sharp and fits curves everywhere else. Coordinates come back in source pixels.
pl = potrace.Bitmap(bg).trace(turdsize=SCALE*SCALE*6, alphamax=1.15, opticurve=True, opttolerance=4)
X0, Y0 = xs.min()/SCALE, ys.min()/SCALE
# Written relative and with one decimal, which is far finer than the figure is ever shown, to keep the file small.
def num(v):
    t = f"{v:.1f}".rstrip("0").rstrip(".")
    t = "0" if t in ("-0", "") else t
    return t.replace("0.", ".", 1) if t.startswith("0.") else t.replace("-0.", "-.", 1)
def seq(vals):
    out = ""
    for v in vals:
        n = num(v)
        out += n if not out or n.startswith("-") else " " + n
    return out
d, n = [], 0
for c in pl:
    n += 1
    cx, cy = c.start_point.x/SCALE - X0, c.start_point.y/SCALE - Y0
    d.append("M" + seq([round(cx, 1), round(cy, 1)]))
    cx, cy = round(cx, 1), round(cy, 1)
    for g in c.segments:
        pts = [g.c, g.end_point] if g.is_corner else [g.c1, g.c2, g.end_point]
        vals = []
        ex, ey = cx, cy
        for p in pts:
            px, py = round(p.x/SCALE - X0, 1), round(p.y/SCALE - Y0, 1)
            vals += [round(px - cx, 1), round(py - cy, 1)]
            ex, ey = px, py
        if g.is_corner:
            mx, my = vals[0], vals[1]
            d.append("l" + seq(vals[:2]) + "l" + seq([round(ex - (cx + mx), 1), round(ey - (cy + my), 1)]))
        else:
            d.append("c" + seq(vals))
        cx, cy = ex, ey
    d.append("z")
path = "".join(d)
print("curves", n, "segments", sum(len(c.segments) for c in pl), "bytes", len(path))
json.dump({"d": path, "w": round((xs.max()-xs.min())/SCALE,1), "h": round((ys.max()-ys.min())/SCALE,1), "x0": float(X0), "y0": float(Y0)}, open(sys.argv[2], "w"))
