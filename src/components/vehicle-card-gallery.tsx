"use client";

import { useState } from "react";
import Image from "next/image";
import type { VehicleImage } from "@/lib/types";
import { imageUrl } from "@/lib/format";

/**
 * Image carousel for a vehicle card. Lives inside the card's <Link>, so the
 * arrow/dot controls call preventDefault + stopPropagation to cycle photos
 * without navigating into the listing.
 */
export function VehicleCardGallery({
  images,
  alt,
  priority = false,
  sizes,
}: {
  images: VehicleImage[];
  alt: string;
  priority?: boolean;
  sizes: string;
}) {
  const [i, setI] = useState(0);
  const n = images.length;

  if (n === 0) {
    return (
      <div className="grid h-full place-items-center text-muted-dark text-sm">No photo</div>
    );
  }

  const step = (e: React.MouseEvent, dir: number) => {
    e.preventDefault();
    e.stopPropagation();
    setI((p) => (p + dir + n) % n);
  };
  const goto = (e: React.MouseEvent, idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    setI(idx);
  };

  return (
    <>
      <Image
        key={images[i].id}
        src={imageUrl(images[i].r2_key)}
        alt={images[i].alt ?? alt}
        fill
        sizes={sizes}
        className="card-zoom object-cover"
        priority={priority && i === 0}
      />

      {n > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => step(e, -1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/55 text-white opacity-0 transition group-hover:opacity-100 hover:bg-ink/80 focus:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <button
            type="button"
            onClick={(e) => step(e, 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 z-20 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-ink/55 text-white opacity-0 transition group-hover:opacity-100 hover:bg-ink/80 focus:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
          </button>

          <div className="absolute inset-x-0 bottom-2 z-20 flex justify-center gap-1.5 opacity-0 transition group-hover:opacity-100">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={(e) => goto(e, idx)}
                aria-label={`Photo ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-4 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
