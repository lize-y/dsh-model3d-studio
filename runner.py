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

        bbox = shape.bounding_box()
        size = bbox.size
        meta = {
            "ok": True,
            "files": {
                "stl": stl_path.name,
                "step": step_path.name,
                "python": script_path.name,
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
