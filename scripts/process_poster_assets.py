from pathlib import Path
from collections import deque

from PIL import Image


INPUT_DIR = Path("/Users/kzh/Documents/MyWorkspace/02_Projects/Cocktail/finished_cocktail/鸡尾酒成品")
OUTPUT_DIR = Path("/Users/kzh/Documents/Codex/2026-05-19/https-vcnbp2d74bm3-feishu-cn-wiki-q6h9wgx0aiiwctkwsgwcjak3ngh/cocktail-lab/images/finished-cocktails-webp")

# Poster preview uses these assets large on screen, so keep a larger canvas
# while reusing the same white-background removal workflow.
ICON_SIZE = 768
QUALITY = 75
WHITE_THRESHOLD = 245
BLACK_THRESHOLD = 22
GRAY_TOLERANCE = 18


def iter_source_images(root: Path):
    for img_path in root.rglob("*"):
        if img_path.suffix.lower() not in [".jpg", ".jpeg", ".png"]:
            continue
        if img_path.name.startswith("."):
            continue
        yield img_path


def is_near_white(pixel):
    r, g, b, _ = pixel
    return r >= WHITE_THRESHOLD and g >= WHITE_THRESHOLD and b >= WHITE_THRESHOLD


def is_near_black(pixel):
    r, g, b, _ = pixel
    darkest = min(r, g, b)
    brightest = max(r, g, b)
    return brightest <= BLACK_THRESHOLD or (
        brightest <= BLACK_THRESHOLD + GRAY_TOLERANCE
        and brightest - darkest <= GRAY_TOLERANCE
    )


def should_clear(pixel):
    return is_near_white(pixel) or is_near_black(pixel)


def remove_edge_background(img: Image.Image) -> Image.Image:
    img = img.convert("RGBA")
    pixels = img.load()
    width, height = img.size
    queue = deque()
    visited = set()

    def enqueue(x, y):
        if (x, y) in visited:
            return
        visited.add((x, y))
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        pixel = pixels[x, y]
        if not should_clear(pixel):
            continue

        pixels[x, y] = (255, 255, 255, 0)

        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and (nx, ny) not in visited:
                visited.add((nx, ny))
                queue.append((nx, ny))

    return img


def process_image(img_path: Path):
    relative_parent = img_path.parent.relative_to(INPUT_DIR)
    output_dir = OUTPUT_DIR / relative_parent
    output_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(img_path)
    img = remove_edge_background(img)
    img.thumbnail((ICON_SIZE, ICON_SIZE), Image.LANCZOS)

    canvas = Image.new("RGBA", (ICON_SIZE, ICON_SIZE), (0, 0, 0, 0))
    x = (ICON_SIZE - img.width) // 2
    y = (ICON_SIZE - img.height) // 2
    canvas.paste(img, (x, y), img)

    output_path = output_dir / f"{img_path.stem}.webp"
    canvas.save(output_path, "WEBP", quality=QUALITY, method=6)
    print(f"Saved: {output_path}")


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for img_path in iter_source_images(INPUT_DIR):
        try:
            process_image(img_path)
        except Exception as exc:
            print(f"Failed: {img_path.name}, {exc}")


if __name__ == "__main__":
    main()
