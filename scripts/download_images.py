#!/usr/bin/env python3
"""Download the signed vehicle photos for the selected 100 listings.

Saves to data/images/<slug>/<idx>.jpg and writes data/images_downloaded.json
mapping each vehicle slug -> ordered list of R2 keys (vehicles/<slug>/<idx>.jpg).
"""
import json, os, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / "data" / "images"
MANIFEST = json.loads((ROOT / "data" / "images_manifest.json").read_text())

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127 Safari/537.36",
    "Referer": "https://www.selecttrucks.co.uk/",
}


def fetch(item):
    slug, idx, url = item["slug"], item["idx"], item["url"]
    dest = IMG_DIR / slug / f"{idx}.jpg"
    key = f"vehicles/{slug}/{idx}.jpg"
    if dest.exists() and dest.stat().st_size > 1000:
        return slug, idx, key, dest.stat().st_size, True
    dest.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(3):
        try:
            req = Request(url, headers=HEADERS)
            with urlopen(req, timeout=30) as r:
                data = r.read()
            if len(data) < 1000:
                raise ValueError(f"tiny response {len(data)}")
            dest.write_bytes(data)
            return slug, idx, key, len(data), True
        except Exception as e:
            if attempt == 2:
                return slug, idx, key, str(e), False
            time.sleep(1.2 * (attempt + 1))


def main():
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    results, ok, fail = {}, 0, 0
    with ThreadPoolExecutor(max_workers=12) as ex:
        futs = [ex.submit(fetch, it) for it in MANIFEST]
        for f in as_completed(futs):
            slug, idx, key, info, success = f.result()
            if success:
                ok += 1
                results.setdefault(slug, []).append((idx, key))
            else:
                fail += 1
                print(f"  FAIL {slug}#{idx}: {info}")
    # order keys by idx
    downloaded = {s: [k for _, k in sorted(v)] for s, v in results.items()}
    (ROOT / "data" / "images_downloaded.json").write_text(json.dumps(downloaded, indent=2))
    total_bytes = sum(p.stat().st_size for p in IMG_DIR.rglob("*.jpg"))
    print(f"\nDownloaded OK: {ok}  failed: {fail}")
    print(f"Vehicles with images: {len(downloaded)}")
    print(f"Total size: {total_bytes/1024/1024:.1f} MB")


if __name__ == "__main__":
    main()
