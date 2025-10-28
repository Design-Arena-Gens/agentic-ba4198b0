'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

type ProductImageGalleryProps = {
  images: Array<{ id: number; url: string; alt: string }>;
  title: string;
};

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  if (!activeImage) {
    return (
      <div className="flex h-96 items-center justify-center rounded-3xl bg-slate-100 text-muted">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        key={activeImage.id}
        className="relative h-96 overflow-hidden rounded-3xl bg-slate-100"
        initial={{ opacity: 0.7, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Image
          src={activeImage.url}
          alt={activeImage.alt || title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 480px"
        />
      </motion.div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 ${
              activeIndex === index ? 'border-brand' : 'border-transparent'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50`}
            aria-label={`View image ${index + 1}`}
          >
            <Image src={image.url} alt={image.alt || title} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </div>
  );
}
