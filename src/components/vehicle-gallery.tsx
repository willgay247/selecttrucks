"use client";

import { useState } from "react";
import Image from "next/image";
import type { VehicleImage } from "@/lib/types";
import { imageUrl } from "@/lib/format";

export function VehicleGallery({
  images,
  title,
  sold,
}: {
  images: VehicleImage[];
  title: string;
  sold?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] grid place-items-center rounded-2xl bg-ink-soft text-muted-dark">
        No photos available
      </div>
    );
  }

  const main = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-soft cursor-zoom-in"
        onClick={() => setLightbox(true)}
      >
        <Image
          src={imageUrl(main.r2_key)}
          alt={main.alt ?? title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        {sold && (
          <div className="absolute inset-0 bg-ink/40 grid place-items-center pointer-events-none">
            <span className="rotate-[-6deg] rounded-md bg-sold px-6 py-2 font-display text-2xl font-extrabold uppercase tracking-wider text-white shadow-lg">
              Sold
            </span>
          </div>
        )}
        <span className="absolute bottom-3 right-3 rounded-md bg-ink/70 px-2.5 py-1 text-xs font-medium text-white">
          {active + 1} / {images.length}
        </span>
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden rounded-lg ring-2 transition ${
                i === active ? "ring-accent" : "ring-transparent hover:ring-line"
              }`}
            >
              <Image
                src={imageUrl(img.r2_key)}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-ink/95 p-4 sm:p-10 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <div className="relative h-full w-full max-w-5xl">
            <Image src={imageUrl(main.r2_key)} alt={main.alt ?? title} fill className="object-contain" sizes="100vw" />
          </div>
        </div>
      )}
    </div>
  );
}
