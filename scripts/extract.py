#!/usr/bin/env python3
"""
Extract vehicle listings from the legacy Select Trucks (Duda) gallery pages.

Strategy:
- Each vehicle on a page is an <h3> title followed by a description paragraph
  (intro + spec list + price) and a set of photos. We segment the document at
  each <h3> boundary and pull title / description / price / photos / sold-flag
  from each segment.

Outputs:
  data/listings.json        normalised vehicle records
  data/images_manifest.json  flat list of {slug, idx, url} images to download
"""
import re, json, html, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw"

PAGES = [
    ("cars_rendered.html", "cars"),   # /gallery/usedcars  -> Jeeps, 4x4s, cars
    ("vans_rendered.html", "vans"),    # /mpvs/pickups/vans -> pickups & vans
]

MAKES = [
    "LAND ROVER", "RANGE ROVER", "GREAT WALL", "ALFA ROMEO", "ASTON MARTIN",
    "MERCEDES-BENZ", "MERCEDES", "VOLKSWAGEN", "MITSUBISHI", "SSANGYONG",
    "JEEP", "SUZUKI", "TOYOTA", "NISSAN", "ISUZU", "FORD", "BMW", "AUDI",
    "VAUXHALL", "RENAULT", "PEUGEOT", "CITROEN", "HYUNDAI", "HONDA", "MAZDA",
    "JAGUAR", "DACIA", "FIAT", "IVECO", "VOLVO", "SKODA", "SEAT", "KIA",
    "MINI", "DAF", "MAN", "VW", "GMC", "DODGE", "CHEVROLET", "JAGUAR",
    "PORSCHE", "LEXUS", "SUBARU", "SMART", "TESLA",
]

FUEL_HINTS = [
    # ordered by confidence; feature-text words like "electric windows" must NOT match
    (r"\b(fully electric|electric motor|\d+\s*kwh|\bev\b)\b", "Electric"),
    (r"\b(plug-?in hybrid|hybrid electric|\bphev\b|\bhev\b)\b", "Hybrid"),
    (r"\b(diesel|crd|tdi|hdi|dci|cdti|tdci|bluetec|d-?4d|dtci|di-?d|td4|d4d)\b", "Diesel"),
    (r"\b(petrol|vvt|vti|tsi|tfsi|gti|i-?vtec|vvt-?i)\b", "Petrol"),
]

BODY_HINTS = [
    (r"\b(double\s*cab|double-cab|d/cab|dcb|crew\s*cab|king\s*cab|extra\s*cab|single\s*cab|pick[\s-]?up|pickup)\b", "Pickup"),
    (r"\b(panel\s*van|van|luton|dropside|tipper|chassis\s*cab|minibus)\b", "Van"),
    (r"\bconvertible\b", "Convertible"),
    (r"\b(estate|station\s*wagon)\b", "Estate"),
    (r"\bhatch(back)?\b", "Hatchback"),
    (r"\b(saloon|sedan)\b", "Saloon"),
    (r"\bcoupe\b", "Coupe"),
    (r"\b(suv|4x4|4wd|awd|jeep|wrangler|jimny|landcruiser)\b", "SUV / 4x4"),
    (r"\bmpv\b", "MPV"),
]


def clean(s: str) -> str:
    s = html.unescape(s or "")
    s = re.sub(r"<[^>]+>", " ", s)
    s = s.replace("\xa0", " ")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def slugify(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-zA-Z0-9]+", "-", s).strip("-").lower()
    return re.sub(r"-+", "-", s)


def base_of(url):
    """Return the stable image basename (e.g. 'a13-223f6512') from any variant URL."""
    m = re.search(r"/multi/(?:opt/)?(.+?)(?:-(\d+)w)?\.(?:jpg|jpeg|png|webp)(?:\?|$)", url, re.I)
    if not m:
        return None, 0
    return m.group(1), (int(m.group(2)) if m.group(2) else 0)


def build_signed_map(page_html):
    """Map every image basename -> its highest-resolution downloadable signed URL."""
    smap = {}
    for u in re.findall(r"https://le-cdn\.website-editor\.net/[^\"')\s]+\.(?:jpg|jpeg|png|webp)[^\"')\s]*", page_html):
        base, width = base_of(u)
        if not base:
            continue
        if base not in smap or width > smap[base][0]:
            smap[base] = (width, u)
    return {b: v[1] for b, v in smap.items()}


def parse_title(title):
    t = title.strip()
    ym = re.search(r"\b(19|20)\d{2}\b", t)
    year = None
    if ym:
        y = int(ym.group(0))
        if 1980 <= y <= 2026:
            year = y
    make = None
    up = " " + t.upper() + " "
    for mk in MAKES:
        if " " + mk + " " in up or up.strip().startswith(mk + " "):
            make = mk.title().replace("Bmw", "BMW").replace("Daf", "DAF").replace("Gmc", "GMC").replace("Vw", "Volkswagen")
            break
    # model = text after the make token (strip year + reg in parens)
    model = None
    if make:
        idx = up.find(" " + make.upper() + " ")
        after = up[idx + len(make) + 2:].strip().title()
        after = re.sub(r"\(\d+\)", "", after)
        after = re.sub(r'["“”*]', "", after)
        model = re.sub(r"\s+", " ", after).strip() or None
    return year, make, model


def detect_sold(desc):
    head = desc[:160].upper()
    return bool(re.search(r"\bSOLD\b", head))


def derive(desc, title):
    text = (desc + " " + title)
    low = text.lower()
    trans = None
    if re.search(r"\bauto(matic)?\b", low):
        trans = "Automatic"
    elif re.search(r"\bmanual\b", low):
        trans = "Manual"
    fuel = None
    for pat, val in FUEL_HINTS:
        if re.search(pat, low):
            fuel = val
            break
    body = None
    for pat, val in BODY_HINTS:
        if re.search(pat, low):
            body = val
            break
    # mileage: capture "89,000 miles", "89.000 miles", "47k miles"
    mileage = None
    mm = re.search(r"([0-9][0-9.,]{2,})\s*miles", low)
    if mm:
        digits = re.sub(r"[.,\s]", "", mm.group(1))
        if digits.isdigit() and int(digits) < 500000:
            mileage = int(digits)
    else:
        km = re.search(r"\b(\d{1,3})\s*k\s*miles", low)
        if km:
            mileage = int(km.group(1)) * 1000
    return trans, fuel, body, mileage


def dedup_best(urls):
    """Dedup signed image URLs by basename, keeping the highest-resolution variant."""
    by_base, order = {}, []
    for u in urls:
        b, w = base_of(u)
        if not b:
            continue
        if b not in by_base:
            order.append(b)
            by_base[b] = (w, u)
        elif w > by_base[b][0]:
            by_base[b] = (w, u)
    return [by_base[b][1] for b in order]


def parse_page(file, source):
    h = (RAW / file).read_text(encoding="utf-8", errors="ignore")
    # per-vehicle image lists captured from the live DOM, indexed by <h3> order
    img_json = json.loads((RAW / f"{source}_images.json").read_text())
    # positions of every <h3> title
    h3s = [(m.start(), m.end(), clean(m.group(1)))
           for m in re.finditer(r"<h3[^>]*>(.*?)</h3>", h, re.S)]
    vehicles = []
    for i, (s, e, title) in enumerate(h3s):
        seg_end = h3s[i + 1][0] if i + 1 < len(h3s) else len(h)
        seg = h[e:seg_end]
        if not title or len(title) < 4:
            continue
        year, make, model = parse_title(title)
        price_m = re.search(r"&pound;\s*([0-9][0-9,]*)", seg) or re.search(r"£\s*([0-9][0-9,]*)", seg)
        price = int(price_m.group(1).replace(",", "")) if price_m else None
        # a vehicle must have a year or a recognised make or a price
        if not (year or make or price):
            continue
        # description: paragraph blocks in segment
        para_blocks = re.findall(r'class="[^"]*dmNewParagraph[^"]*"[^>]*>(.*?)</div>', seg, re.S)
        desc = clean(" ".join(para_blocks)) if para_blocks else clean(seg)[:1200]
        # images: taken from the live-DOM capture, matched by <h3> index
        raw_imgs = img_json[i]["images"] if i < len(img_json) else []
        images = dedup_best(raw_imgs)
        sold = detect_sold(desc)
        trans, fuel, body, mileage = derive(desc, title)
        vehicles.append({
            "title": title,
            "year": year,
            "make": make,
            "model": model,
            "price": price,
            "mileage": mileage,
            "transmission": trans,
            "fuel": fuel,
            "body": body,
            "sold": sold,
            "description": desc,
            "source": source,
            "position": i,
            "images": images,
        })
    return vehicles


def main():
    all_v = []
    for file, source in PAGES:
        vs = parse_page(file, source)
        print(f"{file}: {len(vs)} vehicles, "
              f"{sum(len(v['images']) for v in vs)} images, "
              f"{sum(1 for v in vs if v['sold'])} sold")
        all_v.extend(vs)

    # assign unique slugs
    seen = {}
    for v in all_v:
        base = slugify(" ".join(filter(None, [
            str(v["year"]) if v["year"] else "",
            v["make"] or "",
            (v["model"] or v["title"])[:40],
        ]))) or slugify(v["title"])[:50] or "vehicle"
        slug = base
        n = seen.get(base, 0)
        if n:
            slug = f"{base}-{n+1}"
        seen[base] = n + 1
        v["slug"] = slug

    # ---- recency ordering & "100 most recent" selection ----
    # No timestamps exist on the legacy site, so position on the page is the
    # recency proxy (newest at the top). Round-robin merge the two pages so the
    # freshest stock from each category interleaves, then take the top 100.
    by_src = {"cars": [], "vans": []}
    for v in all_v:
        by_src[v["source"]].append(v)
    for s in by_src:
        by_src[s].sort(key=lambda v: v["position"])
    merged, ci, vi = [], 0, 0
    cars, vans = by_src["cars"], by_src["vans"]
    while ci < len(cars) or vi < len(vans):
        if ci < len(cars):
            merged.append(cars[ci]); ci += 1
        if vi < len(vans):
            merged.append(vans[vi]); vi += 1
    LIMIT = 100
    selected_ids = set()
    # always include current (available) stock, then fill with most-recent sold
    available = [v for v in merged if not v["sold"]]
    for v in available:
        selected_ids.add(id(v))
    for v in merged:
        if len(selected_ids) >= LIMIT:
            break
        selected_ids.add(id(v))
    for rank, v in enumerate(merged):
        v["recency_rank"] = rank
        v["selected"] = id(v) in selected_ids

    out = ROOT / "data" / "listings.json"
    out.write_text(json.dumps(merged, indent=2, ensure_ascii=False))

    selected = [v for v in merged if v["selected"]]
    (ROOT / "data" / "listings_selected.json").write_text(
        json.dumps(selected, indent=2, ensure_ascii=False))

    manifest = []
    for v in selected:
        for idx, url in enumerate(v["images"]):
            manifest.append({"slug": v["slug"], "idx": idx, "url": url})
    (ROOT / "data" / "images_manifest.json").write_text(json.dumps(manifest, indent=2))

    print(f"\nTOTAL parsed: {len(all_v)} vehicles")
    print(f"SELECTED (100 most recent): {len(selected)}  "
          f"(available={sum(1 for v in selected if not v['sold'])}, "
          f"sold={sum(1 for v in selected if v['sold'])})")
    print(f"Images to download (selected): {len(manifest)}")
    print(f"  with price: {sum(1 for v in all_v if v['price'])}")
    print(f"  with year:  {sum(1 for v in all_v if v['year'])}")
    print(f"  with make:  {sum(1 for v in all_v if v['make'])}")
    print(f"  with images:{sum(1 for v in all_v if v['images'])}")
    print(f"  sold:       {sum(1 for v in all_v if v['sold'])}")
    print(f"  no images:  {sum(1 for v in all_v if not v['images'])}")


if __name__ == "__main__":
    main()
