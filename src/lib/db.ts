import { getDB } from "./cf";
import type {
  Vehicle,
  VehicleImage,
  VehicleWithImages,
  VehicleFilters,
  Facets,
} from "./types";

export const PAGE_SIZE = 24;

/* ----------------------------- internal utils ---------------------------- */

async function attachImages(rows: Vehicle[], coverOnly = false): Promise<VehicleWithImages[]> {
  if (rows.length === 0) return [];
  const db = await getDB();
  const ids = rows.map((r) => r.id);
  const placeholders = ids.map(() => "?").join(",");
  const sql = `SELECT * FROM vehicle_images WHERE vehicle_id IN (${placeholders}) ORDER BY vehicle_id, position`;
  const { results } = await db
    .prepare(sql)
    .bind(...ids)
    .all<VehicleImage>();

  const byVehicle = new Map<number, VehicleImage[]>();
  for (const img of results) {
    const list = byVehicle.get(img.vehicle_id) ?? [];
    if (!coverOnly || list.length === 0) list.push(img);
    byVehicle.set(img.vehicle_id, list);
  }
  return rows.map((r) => ({ ...r, images: byVehicle.get(r.id) ?? [] }));
}

function buildWhere(f: VehicleFilters): { clause: string; args: unknown[] } {
  const conds: string[] = [];
  const args: unknown[] = [];

  const status = f.status ?? "available";
  if (status !== "all") {
    conds.push("status = ?");
    args.push(status);
  }
  if (f.make) {
    conds.push("make = ?");
    args.push(f.make);
  }
  if (f.body) {
    conds.push("body = ?");
    args.push(f.body);
  }
  if (f.fuel) {
    conds.push("fuel = ?");
    args.push(f.fuel);
  }
  if (f.transmission) {
    conds.push("transmission = ?");
    args.push(f.transmission);
  }
  if (f.minPrice != null) {
    conds.push("price >= ?");
    args.push(f.minPrice);
  }
  if (f.maxPrice != null) {
    conds.push("(price <= ? AND price > 0)");
    args.push(f.maxPrice);
  }
  if (f.minYear != null) {
    conds.push("year >= ?");
    args.push(f.minYear);
  }
  if (f.maxYear != null) {
    conds.push("year <= ?");
    args.push(f.maxYear);
  }
  if (f.q && f.q.trim()) {
    conds.push("(title LIKE ? OR make LIKE ? OR model LIKE ? OR description LIKE ?)");
    const like = `%${f.q.trim()}%`;
    args.push(like, like, like, like);
  }

  return { clause: conds.length ? "WHERE " + conds.join(" AND ") : "", args };
}

function orderBy(sort: VehicleFilters["sort"]): string {
  switch (sort) {
    case "price-asc":
      return "ORDER BY price IS NULL, price ASC, recency_rank ASC";
    case "price-desc":
      return "ORDER BY price DESC, recency_rank ASC";
    case "year-desc":
      return "ORDER BY year IS NULL, year DESC, recency_rank ASC";
    case "mileage-asc":
      return "ORDER BY mileage IS NULL, mileage ASC, recency_rank ASC";
    case "newest":
    default:
      return "ORDER BY featured DESC, recency_rank ASC, id ASC";
  }
}

/* ------------------------------- public API ------------------------------ */

export interface VehicleQueryResult {
  vehicles: VehicleWithImages[];
  total: number;
  page: number;
  pageCount: number;
}

export async function queryVehicles(f: VehicleFilters): Promise<VehicleQueryResult> {
  const db = await getDB();
  const { clause, args } = buildWhere(f);
  const page = Math.max(1, f.page ?? 1);
  const offset = (page - 1) * PAGE_SIZE;

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS n FROM vehicles ${clause}`)
    .bind(...args)
    .first<{ n: number }>();
  const total = countRow?.n ?? 0;

  const { results } = await db
    .prepare(`SELECT * FROM vehicles ${clause} ${orderBy(f.sort)} LIMIT ? OFFSET ?`)
    .bind(...args, PAGE_SIZE, offset)
    .all<Vehicle>();

  const vehicles = await attachImages(results, false);
  return {
    vehicles,
    total,
    page,
    pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getVehicleBySlug(slug: string): Promise<VehicleWithImages | null> {
  const db = await getDB();
  const v = await db.prepare("SELECT * FROM vehicles WHERE slug = ?").bind(slug).first<Vehicle>();
  if (!v) return null;
  const [withImages] = await attachImages([v], false);
  return withImages;
}

export async function getFeatured(limit = 6): Promise<VehicleWithImages[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT * FROM vehicles WHERE status='available'
       ORDER BY featured DESC, price IS NULL, price DESC, recency_rank ASC LIMIT ?`
    )
    .bind(limit)
    .all<Vehicle>();
  return attachImages(results, false);
}

export async function getRecentlySold(limit = 8): Promise<VehicleWithImages[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(`SELECT * FROM vehicles WHERE status='sold' ORDER BY recency_rank ASC, id ASC LIMIT ?`)
    .bind(limit)
    .all<Vehicle>();
  return attachImages(results, false);
}

export async function getRelated(v: Vehicle, limit = 4): Promise<VehicleWithImages[]> {
  const db = await getDB();
  const { results } = await db
    .prepare(
      `SELECT * FROM vehicles
       WHERE id != ? AND status='available' AND (make = ? OR body = ?)
       ORDER BY (make = ?) DESC, recency_rank ASC LIMIT ?`
    )
    .bind(v.id, v.make, v.body, v.make, limit)
    .all<Vehicle>();
  return attachImages(results, false);
}

export async function getAllSlugs(): Promise<string[]> {
  const db = await getDB();
  const { results } = await db.prepare("SELECT slug FROM vehicles").all<{ slug: string }>();
  return results.map((r) => r.slug);
}

export async function getFacets(): Promise<Facets> {
  const db = await getDB();
  const facetOf = async (col: string) => {
    const { results } = await db
      .prepare(
        `SELECT ${col} AS value, COUNT(*) AS count FROM vehicles
         WHERE ${col} IS NOT NULL AND ${col} != '' GROUP BY ${col} ORDER BY count DESC`
      )
      .all<{ value: string; count: number }>();
    return results;
  };

  const [makes, bodies, fuels, transmissions, ranges, counts] = await Promise.all([
    facetOf("make"),
    facetOf("body"),
    facetOf("fuel"),
    facetOf("transmission"),
    db
      .prepare(
        `SELECT MIN(NULLIF(price,0)) minp, MAX(price) maxp, MIN(NULLIF(year,0)) miny, MAX(year) maxy FROM vehicles`
      )
      .first<{ minp: number; maxp: number; miny: number; maxy: number }>(),
    db
      .prepare(
        `SELECT COUNT(*) all_n,
          SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) avail_n,
          SUM(CASE WHEN status='sold' THEN 1 ELSE 0 END) sold_n FROM vehicles`
      )
      .first<{ all_n: number; avail_n: number; sold_n: number }>(),
  ]);

  return {
    makes,
    bodies,
    fuels,
    transmissions,
    priceRange: { min: ranges?.minp ?? 0, max: ranges?.maxp ?? 0 },
    yearRange: { min: ranges?.miny ?? 0, max: ranges?.maxy ?? 0 },
    counts: {
      all: counts?.all_n ?? 0,
      available: counts?.avail_n ?? 0,
      sold: counts?.sold_n ?? 0,
    },
  };
}

/* ------------------------------- enquiries ------------------------------- */

export async function createEnquiry(data: {
  vehicle_id?: number | null;
  vehicle_slug?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `INSERT INTO enquiries (vehicle_id, vehicle_slug, name, email, phone, message)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      data.vehicle_id ?? null,
      data.vehicle_slug ?? null,
      data.name,
      data.email,
      data.phone ?? null,
      data.message
    )
    .run();
}

export interface Enquiry {
  id: number;
  vehicle_id: number | null;
  vehicle_slug: string | null;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export async function listEnquiries(limit = 200): Promise<Enquiry[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM enquiries ORDER BY created_at DESC, id DESC LIMIT ?")
    .bind(limit)
    .all<Enquiry>();
  return results;
}

export async function countEnquiries(): Promise<number> {
  const db = await getDB();
  const row = await db.prepare("SELECT COUNT(*) AS n FROM enquiries").first<{ n: number }>();
  return row?.n ?? 0;
}

/* --------------------------------- admin --------------------------------- */

/** All vehicles for the admin list — newest first, cover image only. */
export async function adminListVehicles(): Promise<VehicleWithImages[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT * FROM vehicles ORDER BY recency_rank ASC, id DESC")
    .all<Vehicle>();
  return attachImages(results, true);
}

export async function getVehicleById(id: number): Promise<VehicleWithImages | null> {
  const db = await getDB();
  const v = await db.prepare("SELECT * FROM vehicles WHERE id = ?").bind(id).first<Vehicle>();
  if (!v) return null;
  const [withImages] = await attachImages([v], false);
  return withImages;
}

export type VehicleInput = {
  slug: string;
  title: string;
  make: string | null;
  model: string | null;
  year: number | null;
  price: number | null;
  mileage: number | null;
  fuel: string | null;
  transmission: string | null;
  body: string | null;
  colour: string | null;
  engine: string | null;
  doors: number | null;
  drivetrain: string | null;
  vat_status: string | null;
  description: string | null;
  status: Vehicle["status"];
  featured: number;
};

export async function insertVehicle(v: VehicleInput): Promise<number> {
  const db = await getDB();
  const row = await db
    .prepare(
      `INSERT INTO vehicles
        (slug, title, make, model, year, price, mileage, fuel, transmission, body,
         colour, engine, doors, drivetrain, vat_status, description, status, featured,
         recency_rank, source, created_at, updated_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,
         (SELECT COALESCE(MIN(recency_rank),0) - 1 FROM vehicles), 'admin',
         datetime('now'), datetime('now'))
       RETURNING id`
    )
    .bind(
      v.slug, v.title, v.make, v.model, v.year, v.price, v.mileage, v.fuel,
      v.transmission, v.body, v.colour, v.engine, v.doors, v.drivetrain,
      v.vat_status, v.description, v.status, v.featured
    )
    .first<{ id: number }>();
  return row!.id;
}

export async function updateVehicle(id: number, v: VehicleInput): Promise<void> {
  const db = await getDB();
  await db
    .prepare(
      `UPDATE vehicles SET
         slug=?, title=?, make=?, model=?, year=?, price=?, mileage=?, fuel=?,
         transmission=?, body=?, colour=?, engine=?, doors=?, drivetrain=?,
         vat_status=?, description=?, status=?, featured=?, updated_at=datetime('now')
       WHERE id=?`
    )
    .bind(
      v.slug, v.title, v.make, v.model, v.year, v.price, v.mileage, v.fuel,
      v.transmission, v.body, v.colour, v.engine, v.doors, v.drivetrain,
      v.vat_status, v.description, v.status, v.featured, id
    )
    .run();
}

export async function setVehicleStatus(id: number, status: Vehicle["status"]): Promise<void> {
  const db = await getDB();
  await db
    .prepare("UPDATE vehicles SET status=?, updated_at=datetime('now') WHERE id=?")
    .bind(status, id)
    .run();
}

export async function deleteVehicle(id: number): Promise<string[]> {
  const db = await getDB();
  const { results } = await db
    .prepare("SELECT r2_key FROM vehicle_images WHERE vehicle_id=?")
    .bind(id)
    .all<{ r2_key: string }>();
  await db.prepare("DELETE FROM vehicle_images WHERE vehicle_id=?").bind(id).run();
  await db.prepare("DELETE FROM vehicles WHERE id=?").bind(id).run();
  return results.map((r) => r.r2_key);
}

export async function slugExists(slug: string, exceptId?: number): Promise<boolean> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT id FROM vehicles WHERE slug=? AND id != ?")
    .bind(slug, exceptId ?? -1)
    .first<{ id: number }>();
  return !!row;
}

export async function addVehicleImage(
  vehicleId: number,
  r2Key: string,
  alt: string | null
): Promise<void> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT COALESCE(MAX(position),-1) AS p FROM vehicle_images WHERE vehicle_id=?")
    .bind(vehicleId)
    .first<{ p: number }>();
  const nextPos = (row?.p ?? -1) + 1;
  await db
    .prepare("INSERT INTO vehicle_images (vehicle_id, r2_key, position, alt) VALUES (?,?,?,?)")
    .bind(vehicleId, r2Key, nextPos, alt)
    .run();
}

export async function deleteVehicleImage(imageId: number): Promise<string | null> {
  const db = await getDB();
  const row = await db
    .prepare("SELECT r2_key FROM vehicle_images WHERE id=?")
    .bind(imageId)
    .first<{ r2_key: string }>();
  if (!row) return null;
  await db.prepare("DELETE FROM vehicle_images WHERE id=?").bind(imageId).run();
  return row.r2_key;
}
