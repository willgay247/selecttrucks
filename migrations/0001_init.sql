-- Select Trucks — initial schema
-- Vehicles inventory + per-vehicle photos.

CREATE TABLE IF NOT EXISTS vehicles (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE,
  title         TEXT    NOT NULL,
  make          TEXT,
  model         TEXT,
  year          INTEGER,
  price         INTEGER,            -- pence-free GBP integer; NULL = POA
  mileage       INTEGER,
  fuel          TEXT,
  transmission  TEXT,
  body          TEXT,
  colour        TEXT,
  engine        TEXT,
  doors         INTEGER,
  drivetrain    TEXT,
  vat_status    TEXT,
  description   TEXT,
  status        TEXT    NOT NULL DEFAULT 'available',  -- available | sold | reserved
  featured      INTEGER NOT NULL DEFAULT 0,
  recency_rank  INTEGER,            -- lower = newer (legacy import ordering)
  source        TEXT,               -- legacy page the record came from
  created_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at    TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status   ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_make     ON vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_body     ON vehicles(body);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel     ON vehicles(fuel);
CREATE INDEX IF NOT EXISTS idx_vehicles_price    ON vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_year     ON vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_recency  ON vehicles(recency_rank);

CREATE TABLE IF NOT EXISTS vehicle_images (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id  INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  r2_key      TEXT    NOT NULL,     -- e.g. vehicles/<slug>/0.jpg
  position    INTEGER NOT NULL DEFAULT 0,
  alt         TEXT
);

CREATE INDEX IF NOT EXISTS idx_images_vehicle ON vehicle_images(vehicle_id, position);

-- Lead enquiries captured from vehicle pages / contact form.
CREATE TABLE IF NOT EXISTS enquiries (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id  INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  vehicle_slug TEXT,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  message     TEXT,
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
