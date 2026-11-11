#!/usr/bin/env python3
"""Headless build123d model runner for the Model3D Studio plugin.

The generated script is imported in an isolated process, its resulting shape is
exported as binary STL and STEP, and one JSON line is printed on stdout. All
diagnostics go to stdout/stderr so the Host can return a useful error to the UI.
"""

from __future__ import annotations

import importlib.util
import json
import math
import os
import sys
import traceback
from pathlib import Path


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def find_shape(module):
    from build123d import Shape

    candidate = getattr(module, "part", None)
    if candidate is None:
        candidate = getattr(module, "model", None)
    if candidate is None:
        candidate = getattr(module, "result", None)
    if candidate is not None and hasattr(candidate, "part"):
        candidate = candidate.part
    if isinstance(candidate, Shape):
        return candidate

    for value in vars(module).values():
        if isinstance(value, Shape):
            return value
        nested = getattr(value, "part", None)
        if isinstance(nested, Shape):
            return nested
    return None


"""Engineering drawing sheet rendered as SVG, independent of the viewer."""

SHEET_W, SHEET_H = 297.0, 210.0  # A4 landscape, millimetres
BORDER = 10.0
VIEW_SPECS = (
    ("front", (0.0, -1.0, 0.0), (0.0, 0.0, 1.0), "主视图"),
    ("top", (0.0, 0.0, 1.0), (0.0, 1.0, 0.0), "俯视图"),
    ("left", (-1.0, 0.0, 0.0), (0.0, 0.0, 1.0), "左视图"),
)


def _num(value: float, digits: int = 1) -> str:
    return f"{value:.{digits}f}".rstrip("0").rstrip(".")


def _esc(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _polylines(compound) -> list:
    """Tessellate projected edges into 2D polylines in millimetres."""
    from build123d import GeomType  # noqa: PLC0415

    lines = []
    for edge in compound.edges():
        circular = getattr(edge, "geom_type", None) != GeomType.LINE
        samples = max(10, min(72, int(float(edge.length) * 2))) if circular else 2
        lines.append(
            [
                (
                    float(edge.position_at(i / (samples - 1)).X),
                    float(edge.position_at(i / (samples - 1)).Y),
                )
                for i in range(samples)
            ]
        )
    return lines


def _view(shape, look_from, look_up) -> dict:
    from build123d.exporters import Drawing  # noqa: PLC0415

    drawing = Drawing(shape, look_from=look_from, look_up=look_up, with_hidden=True)
    visible = _polylines(drawing.visible_lines)
    hidden = _polylines(drawing.hidden_lines)
    points = [p for line in visible + hidden for p in line] or [(0.0, 0.0)]
    circles = []
    try:
        from build123d import GeomType  # noqa: PLC0415

        for edge in drawing.visible_lines.edges():
            if edge.geom_type != GeomType.CIRCLE:
                continue
            center = edge.arc_center
            circles.append(
                (float(center.X), float(center.Y), float(edge.length) / (2 * math.pi))
            )
    except Exception:
        pass
    return {
        "visible": visible,
        "hidden": hidden,
        "min": (min(p[0] for p in points), min(p[1] for p in points)),
        "max": (max(p[0] for p in points), max(p[1] for p in points)),
        "circles": circles,
    }


def _arrow(x: float, y: float, dx: float, dy: float, size: float = 1.9) -> str:
    """Filled triangle whose tip sits at (x, y) and points along (dx, dy)."""
    nx, ny = -dy, dx
    return (
        f"<polygon class='solid' points="
        f"'{x:.3f},{y:.3f} {x - dx * size + nx * size * 0.32:.3f},{y - dy * size + ny * size * 0.32:.3f} "
        f"{x - dx * size - nx * size * 0.32:.3f},{y - dy * size - ny * size * 0.32:.3f}'/>"
    )


def export_drawings(shape, out_dir: Path, title: str, material: str) -> dict:
    """Render a first-angle three-view drawing sheet as one SVG file.

    Returns a dict of written file names; any failure is non-fatal and leaves
    the model export intact.
    """
    try:
        data = {
            name: _view(shape, look_from, look_up)
            for name, look_from, look_up, _label in VIEW_SPECS
        }
    except Exception:
        return {}

    try:
        front = data["front"]
        top = data["top"]
        left = data["left"]
        fw = front["max"][0] - front["min"][0]
        fh = front["max"][1] - front["min"][1]
        tw = top["max"][0] - top["min"][0]
        th = top["max"][1] - top["min"][1]
        lw = left["max"][0] - left["min"][0]

        gap = 30.0
        block_w, block_h = 112.0, 32.0
        avail_w = SHEET_W - 2 * BORDER - 16.0 - gap - lw * 0 + gap
        avail_h = SHEET_H - 2 * BORDER - 18.0 - block_h - gap
        fit = min(
            (SHEET_W - 2 * BORDER - 34.0 - (fw + lw + gap)) / max(fw + lw + gap, 1e-6) + 1.0,
            (SHEET_H - 2 * BORDER - 18.0 - block_h - (fh + th + gap)) / max(fh + th + gap, 1e-6) + 1.0,
        )
        scale = 1.0
        for candidate in (4.0, 3.0, 2.5, 2.0, 1.5, 1.0, 0.75, 0.5, 0.4, 0.25):
            span_w = fw + lw + gap
            span_h = fh + th + gap
            if (
                BORDER + 16.0 + span_w * candidate <= SHEET_W - BORDER - block_w - 8.0
                and BORDER + 16.0 + span_h * candidate <= SHEET_H - BORDER - block_h - 10.0
            ) or (
                BORDER + 16.0 + span_w * candidate <= SHEET_W - BORDER - 8.0
                and BORDER + 16.0 + span_h * candidate <= SHEET_H - BORDER - block_h - 10.0
            ):
                scale = candidate
                break

        parts = [
            "<?xml version='1.0' encoding='utf-8'?>",
            f"<svg xmlns='http://www.w3.org/2000/svg' width='{SHEET_W}mm' height='{SHEET_H}mm' "
            f"viewBox='0 0 {SHEET_W} {SHEET_H}'>",
            "<style>",
            ".frame{fill:none;stroke:#191919;stroke-width:.8}",
            ".rule{fill:none;stroke:#191919;stroke-width:.2}",
            ".vis{fill:none;stroke:#111;stroke-width:.42;stroke-linejoin:round;stroke-linecap:round}",
            ".hid{fill:none;stroke:#9a9a9a;stroke-width:.22;stroke-dasharray:2.2 1.4}",
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
        ]

        parts.append(
            f"<rect class='frame' x='{BORDER}' y='{BORDER}' "
            f"width='{SHEET_W - 2 * BORDER}' height='{SHEET_H - 2 * BORDER}'/>"
        )
        parts.append(
            f"<rect class='rule' x='{BORDER + 3}' y='{BORDER + 3}' "
            f"width='{SHEET_W - 2 * BORDER - 6}' height='{SHEET_H - 2 * BORDER - 6}'/>"
        )

        ox = BORDER + 14.0
        oy = BORDER + 14.0

        def draw_view(view: dict) -> tuple:
            s = scale
            vx = lambda x: ox_draw + (x - view["min"][0]) * s
            vy = lambda y: oy_draw + (view["max"][1] - y) * s
            out = []
            for line in view["hidden"]:
                pts = " ".join(f"{vx(x):.3f},{vy(y):.3f}" for x, y in line)
                out.append(f"<polyline class='hid' points='{pts}'/>")
            for line in view["visible"]:
                pts = " ".join(f"{vx(x):.3f},{vy(y):.3f}" for x, y in line)
                out.append(f"<polyline class='vis' points='{pts}'/>")
            return out, vx, vy

        # 主视图
        ox_draw, oy_draw = ox, oy
        parts.append(f"<text class='t-cap' x='{ox}' y='{oy - 4}'>{'主视图'}</text>")
        out_front, fx, fy = draw_view(front)
        parts.extend(out_front)
        fw_px, fh_px = fw * scale, fh * scale

        # 俯视图 (below, aligned on X)
        ox_draw, oy_draw = ox, oy + fh_px + gap
        parts.append(f"<text class='t-cap' x='{ox}' y='{oy_draw - 4}'>{'俯视图'}</text>")
        out_top, tx, ty = draw_view(top)
        parts.extend(out_top)

        # 左视图 (right, aligned on Y)
        ox_draw, oy_draw = ox + fw_px + gap, oy
        parts.append(f"<text class='t-cap' x='{ox_draw}' y='{oy_draw - 4}'>{'左视图'}</text>")
        out_left, lx, ly = draw_view(left)
        parts.extend(out_left)

        # ---- dimensions: overall width / height / depth ----
        y_dim = oy + fh_px + 8
        x1, x2 = fx(front["min"][0]), fx(front["max"][0])
        parts.append(f"<line class='dim' x1='{x1}' y1='{y_dim + 6}' x2='{x1}' y2='{y_dim + 6}'/>")
        parts.append(f"<line class='dim' x1='{x1}' y1='{y_dim}' x2='{x2}' y2='{y_dim}'/>")
        parts.append(
            f"<line class='dim' x1='{x1}' y1='{oy + fh_px + 2}' x2='{x1}' y2='{y_dim + 1.6}'/>"
        )
        parts.append(
            f"<line class='dim' x1='{x2}' y1='{oy + fh_px + 2}' x2='{x2}' y2='{y_dim + 1.6}'/>"
        )
        parts.append(_arrow(x1, y_dim, -1.0, 0.0))
        parts.append(_arrow(x2, y_dim, 1.0, 0.0))
        parts.append(
            f"<text class='t-dim' x='{(x1 + x2) / 2}' y='{y_dim - 2.2}' text-anchor='middle'>"
            f"{_num(fw)}</text>"
        )

        x_dim = ox - 9
        y1, y2 = fy(front["max"][1]), fy(front["min"][1])
        parts.append(f"<line class='dim' x1='{x_dim}' y1='{y1}' x2='{x_dim}' y2='{y2}'/>")
        parts.append(_arrow(x_dim, y1, 0.0, -1.0))
        parts.append(_arrow(x_dim, y2, 0.0, 1.0))
        parts.append(
            f"<text class='t-dim' x='{x_dim - 2}' y='{(y1 + y2) / 2 + 1.5}' "
            f"text-anchor='end'>{_num(fh)}</text>"
        )

        depth_x = tx(top["max"][0]) + 9
        dy1, dy2 = ty(top["max"][1]), ty(top["min"][1])
        parts.append(f"<line class='dim' x1='{depth_x}' y1='{dy1}' x2='{depth_x}' y2='{dy2}'/>")
        parts.append(_arrow(depth_x, dy1, 0.0, -1.0))
        parts.append(_arrow(depth_x, dy2, 0.0, 1.0))
        parts.append(
            f"<text class='t-dim' x='{depth_x + 2}' y='{(dy1 + dy2) / 2 + 1.5}'>{_num(th)}</text>"
        )

        # ---- hole callouts ----
        circles = [c for c in top["circles"] if c[2] > 0.05]
        if len(circles) >= 2:
            radii = sorted({round(c[2], 3) for c in circles})
            if len(radii) == 1:
                count = len(circles)
                parts.append(
                    f"<text class='t-note' x='{tx(top['min'][0])}' "
                    f"y='{ty(top['min'][1]) + 12}'>"
                    f"{count} × Ø{_num(radii[0] * 2)} 通孔</text>"
                )
                xs = [c[0] for c in circles]
                ys = [c[1] for c in circles]
                pitch_x = max(xs) - min(xs)
                pitch_y = max(ys) - min(ys)
                if pitch_x > 1e-6 and pitch_y > 1e-6:
                    parts.append(
                        f"<text class='t-note' x='{tx(top['min'][0])}' "
                        f"y='{ty(top['min'][1]) + 17}'>"
                        f"孔距 {_num(pitch_x)} × {_num(pitch_y)}</text>"
                    )

        # ---- title block ----
        tb_x = SHEET_W - BORDER - block_w
        tb_y = SHEET_H - BORDER - block_h
        parts.append(
            f"<rect class='rule' x='{tb_x}' y='{tb_y}' width='{block_w}' height='{block_h}'/>"
        )
        for offset in (12.0, 23.0):
            parts.append(
                f"<line class='rule' x1='{tb_x}' y1='{tb_y + offset}' "
                f"x2='{tb_x + block_w}' y2='{tb_y + offset}'/>"
            )
        parts.append(
            f"<line class='rule' x1='{tb_x + 66}' y1='{tb_y + 12}' "
            f"x2='{tb_x + 66}' y2='{tb_y + block_h}'/>"
        )
        parts.append(f"<text class='t-title' x='{tb_x + 3}' y='{tb_y + 8.4}'>{_esc(title)}</text>")
        parts.append(f"<text class='t-field' x='{tb_x + 3}' y='{tb_y + 11}'>图名</text>")
        parts.append(
            f"<text class='t-field' x='{tb_x + 3}' y='{tb_y + 18}'>比例</text>"
            f"<text class='t-fieldv' x='{tb_x + 14}' y='{tb_y + 18}'>"
            f"{_num(scale, 2)} : 1</text>"
        )
        parts.append(
            f"<text class='t-field' x='{tb_x + 40}' y='{tb_y + 18}'>单位</text>"
            f"<text class='t-fieldv' x='{tb_x + 50}' y='{tb_y + 18}'>mm</text>"
        )
        parts.append(
            f"<text class='t-field' x='{tb_x + 3}' y='{tb_y + 29}'>材料</text>"
            f"<text class='t-fieldv' x='{tb_x + 14}' y='{tb_y + 29}'>{_esc(material or '未指定')}</text>"
        )
        parts.append(
            f"<text class='t-field' x='{tb_x + 69}' y='{tb_y + 18}'>视图 三视图（第一角）</text>"
        )
        parts.append(
            f"<text class='t-field' x='{tb_x + 69}' y='{tb_y + 29}'>由 3D 模型自动生成</text>"
        )

        parts.append("</svg>")
        sheet_path = out_dir / "drawing.svg"
        sheet_path.write_text("\n".join(parts), encoding="utf-8")
        return {"sheet": sheet_path.name}
    except Exception:
        return {}


def spec_dir() -> Path:
    """Directory holding part.spec.md: the modeling session folder."""
    if len(sys.argv) > 2:
        candidate = Path(sys.argv[2]).resolve()
        if candidate.is_dir():
            return candidate
    return Path(sys.argv[1]).resolve().parent


def _spec_candidates():
    root = spec_dir()
    return [root / "part.spec.md", root / "part.md", root / ".model3d" / "spec.md", root / "SPEC.md"]


def drawing_title() -> str:
    """Title shown in the drawing's title block, from the session spec file."""
    for path in _spec_candidates():
        try:
            for line in path.read_text(encoding="utf-8").splitlines():
                stripped = line.strip().lstrip("#").strip()
                if stripped:
                    return stripped[:40]
        except Exception:
            continue
    return "零件图"


def drawing_material() -> str:
    for path in _spec_candidates():
        try:
            text = path.read_text(encoding="utf-8")
        except Exception:
            continue
        for line in text.splitlines():
            stripped = line.strip().lstrip("-*").strip()
            if stripped.startswith("材料"):
                return stripped.split("：", 1)[-1].split(":", 1)[-1].strip()[:24]
    return ""


def main() -> int:
    if len(sys.argv) < 2:
        emit({"ok": False, "error": "runner.py requires the generated script path"})
        return 2

    script_path = Path(sys.argv[1]).resolve()
    out_dir = Path.cwd().resolve()

    try:
        from build123d import export_step, export_stl  # noqa: PLC0415
    except Exception:  # pragma: no cover - environment failure is reported verbatim
        emit(
            {
                "ok": False,
                "error": "build123d could not be imported in the configured Python environment:\n"
                + traceback.format_exc(limit=6),
            }
        )
        return 1

    try:
        spec = importlib.util.spec_from_file_location("model3d_generated", script_path)
        if spec is None or spec.loader is None:
            raise RuntimeError("could not create an import spec for the generated script")
        module = importlib.util.module_from_spec(spec)
        sys.modules[spec.name] = module
        spec.loader.exec_module(module)

        shape = find_shape(module)
        if shape is None:
            raise RuntimeError(
                "the script did not leave a build123d shape in `part` (or `model` / `result`)"
            )

        stl_path = out_dir / "model.stl"
        step_path = out_dir / "model.step"
        export_stl(shape, str(stl_path), tolerance=0.18, angular_tolerance=0.22)
        export_step(shape, str(step_path))

        drawings = export_drawings(shape, out_dir, drawing_title(), drawing_material())

        bbox = shape.bounding_box()
        size = bbox.size
        meta = {
            "ok": True,
            "files": {
                "stl": stl_path.name,
                "step": step_path.name,
                "python": script_path.name,
                **({"drawing": "drawing.svg"} if drawings.get("sheet") else {}),
                **({"views": list(drawings.keys())} if drawings else {}),
            },
            "bytes": {
                "stl": stl_path.stat().st_size,
                "step": step_path.stat().st_size,
            },
            "bbox": {
                "min": [float(bbox.min.X), float(bbox.min.Y), float(bbox.min.Z)],
                "max": [float(bbox.max.X), float(bbox.max.Y), float(bbox.max.Z)],
                "size": [float(size.X), float(size.Y), float(size.Z)],
            },
            "volume": abs(float(shape.volume)),
            "area": float(shape.area),
            "faces": len(shape.faces()),
            "edges": len(shape.edges()),
            "solids": len(shape.solids()),
            "valid": bool(shape.is_valid() if callable(shape.is_valid) else shape.is_valid),
            "generatedAt": int(__import__("time").time() * 1000),
        }
        (out_dir / "meta.json").write_text(
            json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        emit({"ok": True, "meta": meta})
        return 0
    except Exception:
        emit(
            {
                "ok": False,
                "error": traceback.format_exc(limit=10),
                "stl": (out_dir / "model.stl").exists(),
            }
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
