import { useState } from "react";
import { Trash2, Upload } from "lucide-react";

interface BikeImagesProps {
  images: string[];
  onChange?: (images: string[]) => void;
  editable?: boolean;
}

const BikeImages = ({ images, onChange, editable = false }: BikeImagesProps) => {
  const placeholder =
    "https://via.placeholder.com/700x450?text=No+Image";
  const list = images.length > 0 ? images : [placeholder];
  const [selectedImage, setSelectedImage] = useState(list[0]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onChange) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result || "");
      const next = [...images, url];
      onChange(next);
      setSelectedImage(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (url: string) => {
    if (!onChange) return;
    const next = images.filter((img) => img !== url);
    onChange(next);
    setSelectedImage(next[0] || placeholder);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg font-semibold text-foreground">
            Photos
          </h2>
          <p className="text-xs text-muted-foreground">
            Preview and manage bike images
          </p>
        </div>
        {editable && (
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">
            <Upload className="h-3.5 w-3.5" />
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-muted">
        <img
          src={selectedImage}
          alt="Bike"
          className="h-[360px] w-full object-cover sm:h-[420px]"
        />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5">
        {(images.length > 0 ? images : [placeholder]).map((image, index) => (
          <div key={`${image}-${index}`} className="group relative">
            <button
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`w-full overflow-hidden rounded-lg border ${
                selectedImage === image
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border"
              }`}
            >
              <img
                src={image}
                alt={`Thumb ${index + 1}`}
                className="h-20 w-full object-cover"
              />
            </button>
            {editable && images.length > 0 && (
              <button
                type="button"
                onClick={() => handleDelete(image)}
                className="absolute right-1 top-1 rounded-md bg-destructive p-1 text-destructive-foreground opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BikeImages;
