#!/usr/bin/env python3
"""Render a schematic three-view drawing straight from an engineering spec.

This runs before any geometry exists: it reads ``part.spec.md``, extracts the
declared envelope and feature dimensions, and draws an A4 first-angle sheet so
the user can review the design intent before the model is written.

Usage: specdraw.py <spec-dir> <output.svg>
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SHEET_W, SHEET_H = 297.0, 210.0
BORDER = 10.0
BLOCK_W, BLOCK_H = 112.0, 32.0

SPEC_NAMES = ("part.spec.md", "part.md", "SPEC.md", ".model3d/spec.md")


def read_spec(directory: Path) -> str:
    for name in SPEC_NAMES:
        path = directory / name
        try:
            text = path.read_text(encoding="utf-8")
            if text.strip():
                return text
        except Exception:
            continue
    return ""


def _numbers(text: str) -> list:
    return [float(m) for m in re.findall(r"\d+(?:\.\d+)?", text)]


def parse_spec(text: str) -> dict:
    """Extract the dimensions a schematic drawing can honestly show."""
    out = {"length": 0.0, "width": 0.0, "height": 0.0, "title": "", "material": ""}

    lines = text.splitlines()
    for index, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("#") and not out["title"]:
            out["title"] = stripped.lstrip("#").strip()[:40]
            continue
        plain = stripped.lstrip("-*# ").strip()
        if plain.startswith("材料") and not out["material"]:
            remainder = re.split(r"[：:]", plain, maxsplit=1)
            if len(remainder) == 2 and remainder[1].strip():
                out["material"] = remainder[1].strip()[:24]
            else:
                for follow in lines[index + 1:]:
                    value = follow.strip().lstrip("-*# ").strip()
                    if value:
                        out["material"] = value[:24]
                        break

    # Envelope: prefer a dedicated size line, else the first explicit triple.
    triple_re = r"(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)\s*[×xX]\s*(\d+(?:\.\d+)?)"
    envelope = None
    for line in lines:
        if not re.search(r"总体尺寸|外形|包络|尺寸", line):
            continue
        match = re.search(triple_re, line)
        if match:
            envelope = tuple(float(g) for g in match.groups())
            break
    if envelope is None:
        match = re.search(triple_re, text)
        if match:
            envelope = tuple(float(g) for g in match.groups())
    if envelope:
        out["length"], out["width"], out["height"] = envelope

    def find(pattern: str) -> float:
        match = re.search(pattern, text)
        return float(match.group(1)) if match else 0.0

    out["wall"] = find(r"壁厚[：:\s*]*(\d+\.?\d*)")
    out["corner"] = find(r"(?:外)?圆角[：:\s*Rr]*(\d+\.?\d*)")
    out["diameter"] = find(r"Ø\s*(\d+\.?\d*)")
    out["hole_count"] = int(find(r"(\d+)\s*[×xX]\s*Ø")) or 0
    pitch = re.search(r"孔距[：:\s]*(\d+\.?\d*)\s*[×xX]\s*(\d+\.?\d*)", text)
    if pitch:
        out["pitch_x"], out["pitch_y"] = float(pitch.group(1)), float(pitch.group(2))
    else:
        out["pitch_x"] = out["pitch_y"] = 0.0

    if not out["length"] or not out["width"] or not out["height"]:
        out["length"] = out["length"] or 100.0
        out["width"] = out["width"] or 60.0
        out["height"] = out["height"] or 20.0
    return out


def _num(value: float) -> str:
    return f"{value:.2f}".rstrip("0").rstrip(".")


def _esc(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _dim_h(parts, x1, x2, y, value, above=True):
    parts.append(f"<line class='dim' x1='{x1:.3f}' y1='{y:.3f}' x2='{x2:.3f}' y2='{y:.3f}'/>")
    size = 1.8
    parts.append(
        f"<polygon class='solid' points='{x1:.3f},{y:.3f} {x1 + size:.3f},{y + size * 0.32:.3f} "
        f"{x1 + size:.3f},{y - size * 0.32:.3f}'/>"
    )
    parts.append(
        f"<polygon class='solid' points='{x2:.3f},{y:.3f} {x2 - size:.3f},{y + size * 0.32:.3f} "
        f"{x2 - size:.3f},{y - size * 0.32:.3f}'/>"
    )
    ty = y - 2.2 if above else y + 6.2
    parts.append(
        f"<text class='t-dim' x='{(x1 + x2) / 2:.3f}' y='{ty:.3f}' text-anchor='middle'>{value}</text>"
    )


def _dim_v(parts, x, y1, y2, value, left=True):
    parts.append(f"<line class='dim' x1='{x:.3f}' y1='{y1:.3f}' x2='{x:.3f}' y2='{y2:.3f}'/>")
    size = 1.8
    parts.append(
        f"<polygon class='solid' points='{x:.3f},{y1:.3f} {x + size * 0.32:.3f},{y1 + size:.3f} "
        f"{x - size * 0.32:.3f},{y1 + size:.3f}'/>"
    )
    parts.append(
        f"<polygon class='solid' points='{x:.3f},{y2:.3f} {x + size * 0.32:.3f},{y2 - size:.3f} "
        f"{x - size * 0.32:.3f},{y2 - size:.3f}'/>"
    )
    tx = x - 2 if left else x + 2
    anchor = "end" if left else "start"
    parts.append(
        f"<text class='t-dim' x='{tx:.3f}' y='{(y1 + y2) / 2 + 1.5:.3f}' text-anchor='{anchor}'>{value}</text>"
    )


def render(dims: dict) -> str:
    L, W, H = dims["length"], dims["width"], dims["height"]
    T = dims.get("wall") or 0.0
    d = dims.get("diameter") or 0.0
    count = dims.get("hole_count") or 0
    px, py = dims.get("pitch_x") or 0.0, dims.get("pitch_y") or 0.0

    gap = 32.0
    span_w = L + max(W, L) + gap
    span_h = H + max(W, H) + gap
    scale = 1.0
    for candidate in (4.0, 3.0, 2.5, 2.0, 1.5, 1.0, 0.75, 0.5, 0.4, 0.25, 0.2):
        if (
            24.0 + span_w * candidate <= SHEET_W - BORDER - BLOCK_W
            and 24.0 + span_h * candidate <= SHEET_H - BORDER - BLOCK_H
        ):
            scale = candidate
            break

    ox, oy = BORDER + 14.0, BORDER + 16.0
    parts = [
        "<?xml version='1.0' encoding='utf-8'?>",
        f"<svg xmlns='http://www.w3.org/2000/svg' width='{SHEET_W}mm' height='{SHEET_H}mm' "
        f"viewBox='0 0 {SHEET_W} {SHEET_H}'>",
        "<style>",
        ".frame{fill:none;stroke:#191919;stroke-width:.8}",
        ".rule{fill:none;stroke:#191919;stroke-width:.2}",
        ".vis{fill:none;stroke:#111;stroke-width:.42}",
        ".thin{fill:none;stroke:#555;stroke-width:.26;stroke-dasharray:2.4 1.6}",
        ".dim{stroke:#111;stroke-width:.22;fill:none}",
        ".solid{fill:#111;stroke:none}",
        "text{font-family:'Helvetica Neue',Arial,'PingFang SC','Noto Sans SC',sans-serif;fill:#121212}",
        ".t-cap{font-size:4.6;font-weight:600}",
        ".t-dim{font-size:4.2}",
        ".t-note{font-size:3.6;fill:#3d3d3d}",
        ".t-title{font-size:7.2;font-weight:700}",
        ".t-field{font-size:3.4;fill:#4a4a4a}",
        ".t-fieldv{font-size:4.4}",
        "</style>",
        f"<rect class='frame' x='{BORDER}' y='{BORDER}' width='{SHEET_W - 2 * BORDER}' height='{SHEET_H - 2 * BORDER}'/>",
        f"<rect class='rule' x='{BORDER + 3}' y='{BORDER + 3}' width='{SHEET_W - 2 * BORDER - 6}' height='{SHEET_H - 2 * BORDER - 6}'/>",
    ]

    def rect(x, y, w, h, cls="vis"):
        parts.append(
            f"<rect class='{cls}' x='{x:.3f}' y='{y:.3f}' width='{w:.3f}' height='{h:.3f}'/>"
        )

    def circle(cx, cy, r, cls="vis"):
        parts.append(f"<circle class='{cls}' cx='{cx:.3f}' cy='{cy:.3f}' r='{r:.3f}'/>")

    def frame(x, y, w, h, inset):
        rect(x, y, w, h)
        if inset > 0 and w > 2 * inset + 0.4 and h > 2 * inset + 0.4:
            rect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, "thin")

    # 主视图 (front): width L × height H, wall inset
    fw, fh = L * scale, H * scale
    parts.append(f"<text class='t-cap' x='{ox}' y='{oy - 5}'>{'主视图'}</text>")
    frame(ox, oy, fw, fh, T * scale)
    _dim_h(parts, ox, ox + fw, oy + fh + 9, _num(L))
    _dim_v(parts, ox - 9, oy, oy + fh, _num(H))

    # 俯视图 (top): width L × depth W
    tx, ty = ox, oy + fh + gap
    tw, th = L * scale, W * scale
    parts.append(f"<text class='t-cap' x='{tx}' y='{ty - 5}'>{'俯视图'}</text>")
    frame(tx, ty, tw, th, T * scale)
    if count and d and px and py:
        step_x, step_y = px / 2 * scale, py / 2 * scale
        cx0, cy0 = tx + tw / 2, ty + th / 2
        for sx in (-1, 1):
            for sy in (-1, 1):
                circle(cx0 + sx * step_x, cy0 + sy * step_y, d / 2 * scale)
    _dim_h(parts, tx, tx + tw, ty + th + 9, _num(L))

    # 左视图 (left): depth W × height H
    lx, ly = ox + fw + gap, oy
    lw, lh = W * scale, H * scale
    parts.append(f"<text class='t-cap' x='{lx}' y='{ly - 5}'>{'左视图'}</text>")
    frame(lx, ly, lw, lh, T * scale)
    _dim_h(parts, lx, lx + lw, ly + lh + 9, _num(W))

    notes = []
    if T:
        notes.append(f"壁厚 {_num(T)}")
    if count and d:
        notes.append(f"{count} × Ø{_num(d)}")
    if px and py:
        notes.append(f"孔距 {_num(px)} × {_num(py)}")
    if dims.get("corner"):
        notes.append(f"圆角 R{_num(dims['corner'])}")
    notes.append("示意图，最终以模型为准")
    for index, note in enumerate(notes):
        parts.append(
            f"<text class='t-note' x='{ox}' y='{oy + fh + gap + th + 20 + index * 5}'>{_esc(note)}</text>"
        )

    # title block
    bx = SHEET_W - BORDER - BLOCK_W
    by = SHEET_H - BORDER - BLOCK_H
    parts.append(f"<rect class='rule' x='{bx}' y='{by}' width='{BLOCK_W}' height='{BLOCK_H}'/>")
    for offset in (12.0, 23.0):
        parts.append(f"<line class='rule' x1='{bx}' y1='{by + offset}' x2='{bx + BLOCK_W}' y2='{by + offset}'/>")
    parts.append(f"<line class='rule' x1='{bx + 66}' y1='{by + 12}' x2='{bx + 66}' y2='{by + BLOCK_H}'/>")
    title = dims.get("title") or "零件设计草图"
    parts.append(f"<text class='t-title' x='{bx + 3}' y='{by + 8.4}'>{_esc(title)}</text>")
    parts.append(f"<text class='t-field' x='{bx + 3}' y='{by + 11}'>图名</text>")
    parts.append(
        f"<text class='t-field' x='{bx + 3}' y='{by + 18}'>比例</text>"
        f"<text class='t-fieldv' x='{bx + 14}' y='{by + 18}'>{_num(scale)} : 1</text>"
    )
    parts.append(
        f"<text class='t-field' x='{bx + 40}' y='{by + 18}'>单位</text>"
        f"<text class='t-fieldv' x='{bx + 50}' y='{by + 18}'>mm</text>"
    )
    parts.append(
        f"<text class='t-field' x='{bx + 3}' y='{by + 29}'>材料</text>"
        f"<text class='t-fieldv' x='{bx + 14}' y='{by + 29}'>{_esc(dims.get('material') or '未指定')}</text>"
    )
    parts.append(f"<text class='t-field' x='{bx + 69}' y='{by + 18}'>规格草图（未建模）</text>")
    parts.append(f"<text class='t-field' x='{bx + 69}' y='{by + 29}'>按 part.spec.md 推定</text>")
    parts.append("</svg>")
    return "\n".join(parts)


def main() -> int:
    if len(sys.argv) < 3:
        print("usage: specdraw.py <spec-dir> <output.svg>", file=sys.stderr)
        return 2
    directory = Path(sys.argv[1]).resolve()
    target = Path(sys.argv[2]).resolve()
    text = read_spec(directory)
    if not text.strip():
        return 1
    target.write_text(render(parse_spec(text)), encoding="utf-8")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
