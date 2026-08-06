import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface BikeGalleryProps {
  images?: string[];
  bikes?: { bikeId?: number; imageUrl?: string; bikeName?: string }[];
}

const BikeGallery = ({ images, bikes }: BikeGalleryProps) => {
  const gallery = useMemo(() => {
    if (images?.length) return images.filter(Boolean);
    if (bikes?.length) {
      return bikes.map((b) => b.imageUrl).filter(Boolean) as string[];
    }
    return [];
  }, [images, bikes]);

  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (gallery.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card py-14 text-center text-sm text-muted-foreground">
        No images available
      </div>
    );
  }

  const current = gallery[index % gallery.length];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-muted">
        <img
          src={current}
          alt={`Bike ${index + 1}`}
          className="h-[380px] w-full object-cover sm:h-[440px]"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/55 to-transparent p-4">
          <button
            type="button"
            onClick={() =>
              setIndex((i) => (i - 1 + gallery.length) % gallery.length)
            }
            className="rounded-lg bg-white/95 p-2 text-foreground"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold"
          >
            <ZoomIn className="h-3.5 w-3.5" />
            Zoom
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % gallery.length)}
            className="rounded-lg bg-white/95 p-2 text-foreground"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {gallery.map((img, i) => (
          <button
            key={`${img}-${i}`}
            type="button"
            onClick={() => setIndex(i)}
            className={`overflow-hidden rounded-lg border transition ${
              i === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-border opacity-80 hover:opacity-100"
            }`}
          >
            <img src={img} alt="" className="h-16 w-full object-cover" />
          </button>
        ))}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white p-2"
            onClick={() => setZoomed(false)}
          >
            <X className="h-4 w-4" />
          </button>
          <img
            src={current}
            alt="Zoomed"
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default BikeGallery;
