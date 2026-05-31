export type VehicleStatus = "available" | "sold" | "reserved";

export interface VehicleImage {
  id: number;
  vehicle_id: number;
  r2_key: string;
  position: number;
  alt: string | null;
}

export interface Vehicle {
  id: number;
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
  status: VehicleStatus;
  featured: number;
  recency_rank: number | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleWithImages extends Vehicle {
  images: VehicleImage[];
}

export interface VehicleFilters {
  q?: string;
  make?: string;
  body?: string;
  fuel?: string;
  transmission?: string;
  status?: VehicleStatus | "all";
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "year-desc" | "mileage-asc";
  page?: number;
}

export interface FacetValue {
  value: string;
  count: number;
}

export interface Facets {
  makes: FacetValue[];
  bodies: FacetValue[];
  fuels: FacetValue[];
  transmissions: FacetValue[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  counts: { all: number; available: number; sold: number };
}
