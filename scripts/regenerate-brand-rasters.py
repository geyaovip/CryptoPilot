#!/usr/bin/env python3
"""Regenerate PNG / ICO brand assets from app-icon.svg."""

from __future__ import annotations

import platform
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BRAND_WEB = ROOT / "apps/web/public/brand"
SVG_ICON = BRAND_WEB / "app-icon.svg"
PUBLIC_TARGETS = [ROOT / "apps/web/public", ROOT / "apps/admin/public"]
BRAND_TARGETS = [BRAND_WEB, ROOT / "apps/admin/public/brand"]
APP_TARGETS = [
    (ROOT / "apps/web/app", ROOT / "apps/web/public"),
    (ROOT / "apps/admin/app", ROOT / "apps/admin/public"),
]

ICON_PATHS = (
    (
        "M161.941620,314.119446 C131.599670,295.747314 112.360001,269.499481 106.592880,234.959122 "
        "C98.962646,189.260208 114.819237,151.737091 150.623489,122.781143 C176.475922,101.873512 "
        "206.433517,94.379982 239.154114,98.736008 C266.470093,102.372528 288.970856,115.735939 "
        "307.902008,135.392319 C312.852142,140.532104 312.151978,146.077774 306.524200,150.268219 "
        "C304.266022,151.949661 302.155640,153.854370 300.120819,155.806320 C294.091034,161.590500 "
        "289.095184,161.732819 283.325378,155.663864 C272.298645,144.065536 258.671875,137.328934 "
        "243.456223,133.069244 C202.874893,121.708313 155.725082,144.821518 141.575699,189.860016 "
        "C126.689369,237.244293 155.790878,286.831665 204.452408,296.488434 C213.703430,298.324280 "
        "222.931290,298.784912 232.171906,296.641052 C237.021851,295.515808 240.394897,297.408081 "
        "242.321884,301.705292 C244.565430,306.708405 246.597626,311.819611 248.446838,316.982300 "
        "C250.089920,321.569427 246.813126,327.207642 242.038437,328.065186 C213.789764,333.138916 "
        "187.024002,329.458832 161.941620,314.119446z"
    ),
    (
        "M271.801544,275.195831 C270.694855,267.759033 265.471191,265.419067 259.549805,263.422638 "
        "C249.937592,260.181763 240.475708,256.497040 230.928955,253.059174 C226.561401,251.486389 "
        "222.919617,249.034805 222.911545,244.008316 C222.903229,238.834839 226.403900,235.972336 "
        "231.065414,234.505295 C252.163345,227.865433 273.276215,221.273041 294.374237,214.633514 "
        "C303.892822,211.638000 313.415985,208.652359 322.881256,205.494965 C326.198151,204.388519 "
        "329.072571,204.432556 331.603455,207.037994 C334.256622,209.769318 334.370117,212.951157 "
        "333.134583,216.318314 C322.310913,245.815796 311.490723,275.314606 300.634247,304.800049 "
        "C298.634827,310.230347 295.227936,312.614288 290.220612,312.251129 C285.019012,311.873871 "
        "283.127045,308.374512 281.693634,303.868103 C278.669464,294.360504 275.208221,284.991943 "
        "271.801544,275.195831z"
    ),
)


def rasterize_svg(svg_path: Path, size: int) -> Image.Image:
    if platform.system() != "Darwin":
        raise RuntimeError("SVG rasterization currently requires macOS qlmanage.")

    with tempfile.TemporaryDirectory() as temp_dir:
        output_dir = Path(temp_dir)
        subprocess.run(
            ["qlmanage", "-t", "-s", str(size), "-o", str(output_dir), str(svg_path.resolve())],
            check=True,
            capture_output=True,
            text=True,
        )
        rendered = output_dir / f"{svg_path.name}.png"
        if not rendered.exists():
            rendered = next(output_dir.glob("*.png"))
        return Image.open(rendered).convert("RGBA")


def write_temp_svg(fill: str) -> Path:
    paths = "\n".join(f'  <path fill="{fill}" d="{d}"/>' for d in ICON_PATHS)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">'
        f"{paths}</svg>"
    )
    temp = Path(tempfile.mkstemp(suffix=".svg")[1])
    temp.write_text(svg, encoding="utf-8")
    return temp


def center_on_canvas(
    src: Image.Image,
    canvas_size: tuple[int, int],
    *,
    background: tuple[int, int, int, int] = (0, 0, 0, 0),
    max_scale: float = 0.82,
) -> Image.Image:
    canvas = Image.new("RGBA", canvas_size, background)
    max_w = int(canvas_size[0] * max_scale)
    max_h = int(canvas_size[1] * max_scale)
    fitted = src.copy()
    fitted.thumbnail((max_w, max_h), Image.Resampling.LANCZOS)
    x = (canvas_size[0] - fitted.width) // 2
    y = (canvas_size[1] - fitted.height) // 2
    canvas.paste(fitted, (x, y), fitted)
    return canvas


def center_on_square(src: Image.Image, size: int) -> Image.Image:
    return center_on_canvas(src, (size, size))


def write_favicon(target_dir: Path, src: Image.Image) -> None:
    sizes = [16, 32, 48, 64]
    images = [center_on_square(src, size) for size in sizes]
    images[-1].save(
        target_dir / "favicon.ico",
        format="ICO",
        sizes=[(image.width, image.height) for image in images],
        append_images=images[:-1],
    )


def write_og_image(target_dir: Path, src: Image.Image) -> None:
    canvas = center_on_canvas(src, (1200, 630), background=(252, 252, 249, 255), max_scale=0.42)
    canvas.convert("RGB").save(target_dir / "og-image.png", optimize=True)


def write_brand_pack(brand_dir: Path, icon: Image.Image, reversed_icon: Image.Image) -> None:
    brand_dir.mkdir(parents=True, exist_ok=True)
    center_on_square(icon, 400).save(brand_dir / "app-icon.png", optimize=True)
    center_on_canvas(icon, (450, 450)).save(brand_dir / "social-avatar.png", optimize=True)
    center_on_canvas(icon, (770, 290), max_scale=0.78).save(brand_dir / "in-app-logo.png", optimize=True)
    center_on_canvas(icon, (810, 290), max_scale=0.78).save(brand_dir / "website-logo.png", optimize=True)
    center_on_canvas(icon, (950, 330), max_scale=0.72).save(brand_dir / "mono-logo.png", optimize=True)
    center_on_canvas(reversed_icon, (1070, 410), max_scale=0.72).save(brand_dir / "reversed-logo.png", optimize=True)


def main() -> None:
    if not SVG_ICON.exists():
        raise FileNotFoundError(f"Missing source SVG: {SVG_ICON}")

    icon = rasterize_svg(SVG_ICON, 400)
    reversed_svg = write_temp_svg("#FFFFFF")
    try:
        reversed_icon = rasterize_svg(reversed_svg, 400)
    finally:
        reversed_svg.unlink(missing_ok=True)

    for brand_dir in BRAND_TARGETS:
        write_brand_pack(brand_dir, icon, reversed_icon)

    for target_dir in PUBLIC_TARGETS:
        target_dir.mkdir(parents=True, exist_ok=True)
        center_on_square(icon, 64).save(target_dir / "icon.png", optimize=True)
        center_on_square(icon, 192).save(target_dir / "icon-192.png", optimize=True)
        center_on_square(icon, 512).save(target_dir / "icon-512.png", optimize=True)
        write_favicon(target_dir, icon)
        write_og_image(target_dir, icon)

    for app_dir, public_dir in APP_TARGETS:
        app_dir.mkdir(parents=True, exist_ok=True)
        shutil.copy2(public_dir / "icon.png", app_dir / "icon.png")

    print("Regenerated PNG / ICO assets from app-icon.svg.")


if __name__ == "__main__":
    main()
