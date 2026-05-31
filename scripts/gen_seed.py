#!/usr/bin/env python3
"""Generate data/seed.sql from the selected 100 listings + downloaded images."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
vehicles = json.loads((ROOT / "data" / "listings_selected.json").read_text())
images = json.loads((ROOT / "data" / "images_downloaded.json").read_text())


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, bool):
        return "1" if v else "0"
    if isinstance(v, int):
        return str(v)
    return "'" + str(v).replace("'", "''") + "'"


lines = ["-- Auto-generated seed: 100 most-recent Select Trucks listings",
         "DELETE FROM vehicle_images;", "DELETE FROM vehicles;", ""]

for v in vehicles:
    status = "sold" if v["sold"] else "available"
    cols = ["slug", "title", "make", "model", "year", "price", "mileage",
            "fuel", "transmission", "body", "description", "status",
            "recency_rank", "source"]
    vals = [v["slug"], v["title"], v["make"], v["model"], v["year"], v["price"],
            v["mileage"], v["fuel"], v["transmission"], v["body"],
            v["description"], status, v["recency_rank"], v["source"]]
    lines.append(
        f"INSERT INTO vehicles ({', '.join(cols)}) VALUES "
        f"({', '.join(q(x) for x in vals)});"
    )
    for pos, key in enumerate(images.get(v["slug"], [])):
        lines.append(
            "INSERT INTO vehicle_images (vehicle_id, r2_key, position, alt) "
            f"SELECT id, {q(key)}, {pos}, {q(v['title'])} FROM vehicles "
            f"WHERE slug = {q(v['slug'])};"
        )
    lines.append("")

out = ROOT / "data" / "seed.sql"
out.write_text("\n".join(lines))
n_img = sum(len(images.get(v["slug"], [])) for v in vehicles)
print(f"Wrote {out} — {len(vehicles)} vehicles, {n_img} image rows")
