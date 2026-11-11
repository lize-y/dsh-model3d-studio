#!/usr/bin/env python3
"""Headless build123d model runner for the Model3D Studio plugin.

The generated script is imported in an isolated process, its resulting shape is
exported as binary STL and STEP, and one JSON line is printed on stdout. All
diagnostics go to stdout/stderr so the Host can return a useful error to the UI.
"""

from __future__ import annotations

import importlib.util
import json
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


VIEWS = (
    ("front", (0.0, -1.0, 0.0), (0.0, 0.0, 1.0)),
    ("top", (0.0, 0.0, 1.0), (0.0, 1.0, 0.0)),
    ("right", (1.0, 0.0, 0.0), (0.0, 0.0, 1.0)),
)


def export_drawings(shape, out_dir: Path) -> dict:
    """Project orthographic views to SVG so the Spec tab can show a drawing.

    Returns a dict of written file names. Any failure is non-fatal: the model
    still exports, and the UI simply hides the drawing section.
    """
    try:
        from build123d.exporters import Drawing, ExportSVG, LineType  # noqa: PLC0415
    except Exception:
        return {}

    files = {}
    try:
        for name, look_from, look_up in VIEWS:
            drawing = Drawing(
                shape, look_from=look_from, look_up=look_up, with_hidden=True
            )
            svg = ExportSVG(scale=2)
            svg.add_layer("visible", line_weight=0.4, line_color=(24, 24, 24))
            svg.add_layer(
                "hidden",
                line_weight=0.25,
                line_color=(140, 140, 140),
                line_type=LineType.DASHED,
            )
            svg.add_shape(drawing.visible_lines, layer="visible")
            try:
                svg.add_shape(drawing.hidden_lines, layer="hidden")
            except Exception:
                pass
            path = out_dir / f"drawing-{name}.svg"
            svg.write(str(path))
            files[name] = path.name

        # One combined sheet: front / top / right laid out left to right.
        gap = 12.0
        projections = []
        for name, look_from, look_up in VIEWS:
            drawing = Drawing(
                shape, look_from=look_from, look_up=look_up, with_hidden=True
            )
            bb = drawing.visible_lines.bounding_box()
            projections.append((name, drawing, bb))

        widths = [bb.max.X - bb.min.X for _, _, bb in projections]
        total_width = sum(widths) + gap * (len(projections) - 1)
        max_height = max(bb.max.Y - bb.min.Y for _, _, bb in projections)

        sheet = ExportSVG(scale=2)
        sheet.add_layer("visible", line_weight=0.4, line_color=(24, 24, 24))
        sheet.add_layer(
            "hidden",
            line_weight=0.25,
            line_color=(140, 140, 140),
            line_type=LineType.DASHED,
        )
        cursor = -total_width / 2.0
        from build123d import Location, Vector  # noqa: PLC0415

        for (_name, drawing, bb), width in zip(projections, widths):
            dx = cursor + width / 2.0 - (bb.min.X + bb.max.X) / 2.0
            dy = -max_height / 2.0 - (bb.min.Y + bb.max.Y) / 2.0
            offset = Location(Vector(dx, dy, 0.0))
            try:
                visible = drawing.visible_lines.moved(offset)
            except Exception:
                visible = drawing.visible_lines
            sheet.add_shape(visible, layer="visible")
            try:
                hidden = drawing.hidden_lines.moved(offset)
                sheet.add_shape(hidden, layer="hidden")
            except Exception:
                pass
            cursor += width + gap

        sheet_path = out_dir / "drawing.svg"
        sheet.write(str(sheet_path))
        files["sheet"] = sheet_path.name
    except Exception:
        return files
    return files


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

        drawings = export_drawings(shape, out_dir)

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
