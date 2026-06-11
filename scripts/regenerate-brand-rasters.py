#!/usr/bin/env python3
"""Regenerate favicon / PWA / OG raster assets without stretching source logos."""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND = ROOT / "apps/web/public/brand"
TARGETS = [
    ROOT / "apps/web/public",
    ROOT / "apps/admin/public",
]
APP_TARGETS = [
    (ROOT / "apps/web/app", ROOT / "apps/web/public"),
    (ROOT / "apps/admin/app", ROOT / "apps/admin/public"),
]


def fit_on_canvas(
    src_path: Path,
    canvas_w: int,
    canvas_h: int,
    *,
    bg: tuple[int, int, int] = (255, 255, 255),
    padding_ratio: float = 0.08,
) -> Image.Image:
    src = Image.open(src_path).convert("RGBA")
    pad_w = int(canvas_w * padding_ratio)
    pad_h = int(canvas_h * padding_ratio)
    max_w = max(1, canvas_w - pad_w * 2)
    max_h = max(1, canvas_h - pad_h * 2)
    fitted = src.copy()
    fitted.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (canvas_w, canvas_h), (*bg, 255))
    x = (canvas_w - fitted.width) // 2
    y = (canvas_h - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas.convert("RGB")


def square_icon(src_path: Path, size: int, *, rgba: bool = False) -> Image.Image:
    src = Image.open(src_path).convert("RGBA")
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    fitted = src.copy()
    fitted.thumbnail((size, size), Image.Resampling.LANCZOS)
    x = (size - fitted.width) // 2
    y = (size - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas if rgba else canvas.convert("RGB")


def write_favicon(target_dir: Path, src_path: Path) -> None:
    sizes = [16, 32, 48, 64]
    images = [square_icon(src_path, size, rgba=True) for size in sizes]
    images[-1].save(
        target_dir / "favicon.ico",
        format="ICO",
        sizes=[(image.width, image.height) for image in images],
        append_images=images[:-1],
    )


def main() -> None:
    horizontal_logo = BRAND / "in-app-logo.png"
    app_icon = BRAND / "app-icon.png"

    og_image = fit_on_canvas(horizontal_logo, 1200, 630)
    icon_png = square_icon(app_icon, 64)
    icon_192 = square_icon(app_icon, 192)
    icon_512 = square_icon(app_icon, 512)

    for target_dir in TARGETS:
        target_dir.mkdir(parents=True, exist_ok=True)
        og_image.save(target_dir / "og-image.png", optimize=True)
        icon_png.save(target_dir / "icon.png", optimize=True)
        icon_192.save(target_dir / "icon-192.png", optimize=True)
        icon_512.save(target_dir / "icon-512.png", optimize=True)
        write_favicon(target_dir, app_icon)

    for app_dir, public_dir in APP_TARGETS:
        app_dir.mkdir(parents=True, exist_ok=True)
        # Next.js file metadata: icon.png updates the browser tab reliably.
        shutil.copy2(public_dir / "icon.png", app_dir / "icon.png")
        stale_favicon = app_dir / "favicon.ico"
        if stale_favicon.exists():
            stale_favicon.unlink()

    print("Regenerated brand rasters for web/admin public + app metadata icons.")


if __name__ == "__main__":
    main()
