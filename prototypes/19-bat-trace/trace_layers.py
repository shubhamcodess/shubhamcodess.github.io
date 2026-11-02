# Traces a flat-colored figure on white into stacked tone layers, with a slight stealth bend baked in, as one svg. Usage: trace_layers.py reference.png out.svg
# Each layer is a region of the reference. Lighter layers sit on darker ones, so edges always meet. Colors are CSS variables, so a theme sets them.
import sys, math
from collections import deque
import numpy as np, potrace
from PIL import Image, ImageFilter
SCALE, BLUR = 3, 0.7
src = Image.open(sys.argv[1]).convert("RGB")
big = src.resize((src.width * SCALE, src.height * SCALE), Image.BICUBIC).filter(ImageFilter.GaussianBlur(SCALE * BLUR))
rgb = np.asarray(big).astype(float)
lum, warmth = rgb.mean(axis=2), rgb[:, :, 0] - rgb[:, :, 2]
light = rgb.min(axis=2) >= 128
h, w = light.shape
bg = np.zeros((h, w), bool)
q = deque((y, x) for y, x in [(0, 0), (0, w-1), (h-1, 0), (h-1, w-1)] if light[y, x])
for p in q: bg[p] = True
while q:
    y, x = q.popleft()
    for ny, nx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
        if 0 <= ny < h and 0 <= nx < w and light[ny,nx] and not bg[ny,nx]:
            bg[ny,nx] = True; q.append((ny,nx))
fig = ~bg
ys, xs = np.where(fig)
X0, Y0, H = xs.min()/SCALE, ys.min()/SCALE, (ys.max()-ys.min())/SCALE

def smoothstep(a, b, v):
    t = min(1, max(0, (v-a)/(b-a))); return t*t*(3-2*t)
def bend(x, y):
    """A stealth stance, only from the knees: hips sink straight down and the knees ease forward, while the back stays upright and the feet stay planted. The cape's outer edges barely follow."""
    HIP, SINK, KNEE = 350, 40, 30
    if y < HIP:
        return x, y + SINK
    u = min(1, (y - HIP) / (H - HIP))
    legs = math.exp(-((x - 195) / 105) ** 2)
    return x + KNEE * legs * math.sin(math.pi * u ** 0.7), y + SINK * (1 - u)

# The 2.5D: no turn of the picture, only each layer set at its own small depth, which shows as a thin edge behind the figure.
SY = 0.1
def turned(x, y, z):
    return x + z * SY, y

num_ = lambda v: (lambda t: "0" if t in ("-0", "") else t.replace("0.", ".", 1) if t.startswith("0.") else t.replace("-0.", "-.", 1))(f"{round(v):d}")
def seq(vals):
    out = ""
    for v in vals:
        n = num_(v); out += n if not out or n.startswith("-") else " " + n
    return out
allx, ally = [], []
def trace(mask, turd, tol=6.0, z=0):
    pl = potrace.Bitmap(~mask).trace(turdsize=turd, alphamax=1.2, opticurve=True, opttolerance=tol)
    d = []
    def P(p):
        x, y = turned(*bend(p.x/SCALE - X0, p.y/SCALE - Y0), z); allx.append(x); ally.append(y); return x, y
    for c in pl:
        cx, cy = (round(v) for v in P(c.start_point))
        d.append("M" + seq([cx, cy]))
        for g in c.segments:
            if g.is_corner:
                ax, ay = (round(v) for v in P(g.c)); bx, by = (round(v) for v in P(g.end_point))
                d.append("l" + seq([round(ax-cx), round(ay-cy)]) + "l" + seq([round(bx-ax), round(by-ay)])); cx, cy = bx, by
            else:
                pts = [tuple(round(v) for v in P(q)) for q in (g.c1, g.c2, g.end_point)]
                d.append("c" + seq([v for p in pts for v in (round(p[0]-cx), round(p[1]-cy))])); cx, cy = pts[2]
        d.append("z")
    return "".join(d)

warm = warmth > 26
# The blurred edge against white passes through every gray, which would leave a thin ring of each tone around the figure. Inner tones stop a little short of the edge.
core = np.asarray(Image.fromarray((fig*255).astype("uint8")).filter(ImageFilter.MinFilter(9))) > 127
T = SCALE * SCALE
layers = {
 "back": [("f7", trace(fig, T*6, 5, -40)), ("f0", trace(fig, T*6, 4)), ("f1", trace(core & (lum > 24), T*10, 6, 4))],
 "front": [("f2", trace(core & (lum > 60), T*8, 6, 10)), ("f3", trace(core & (lum > 88) & ~warm, T*8, 6, 10)),
           ("f4", trace(core & warm & (lum < 165), T*5, 2, 10)), ("f5", trace(core & warm & (lum >= 165), T*3, 2, 10)),
           ("f6", trace(core & (lum > 225), T*1, 1, 10))],
}
minx, maxx, maxy, miny = min(allx), max(allx), max(ally), min(ally)
pad = 2
vb = f"{minx-pad:.1f} {miny-pad:.1f} {maxx-minx+pad*2:.1f} {maxy-miny+pad*2:.1f}"
g = "".join(f'<g id="{n}">' + "".join(f'<path fill="var(--{t},#000)" d="{d}"/>' for t, d in ps) + "</g>" for n, ps in layers.items())
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}">{g}</svg>\n'
open(sys.argv[2], "w").write(svg)
print("viewBox", vb, "bytes", len(svg), {t: len(d) for ps in layers.values() for t, d in ps})
