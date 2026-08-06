import { useEffect, useRef, useState } from "react";
import { ImagePlus, MapPin, Navigation, Map, Plus, Trash2, ZoomIn, Star } from "lucide-react";
import toast from "react-hot-toast";
import type { Bike, BikeStatus } from "../../types/bike";
import { BIKE_STATUSES } from "../../types/bike";

export interface BikeFormProps {
  initial: Bike;
  lockIdentityFields?: boolean;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (bike: Bike) => void | Promise<void>;
  onCancel?: () => void;
  onOpenMapPicker?: () => void;
}

const BikeForm = ({
  initial,
  lockIdentityFields = false,
  submitLabel = "Save bike",
  loading = false,
  onSubmit,
  onCancel,
  onOpenMapPicker,
}: BikeFormProps) => {
  const [bike, setBike] = useState<Bike>({ ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState(initial.imageUrl || "");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBike({ ...initial });
  }, [initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBike((prev) => ({
      ...prev,
      [name]:
        name === "rentalPrice" ||
        name === "hourlyRate" ||
        name === "seatingCapacity" ||
        name === "latitude" ||
        name === "longitude"
          ? value === ""
            ? 0
            : Number(value)
          : value,
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const [newUrlInput, setNewUrlInput] = useState("");
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    const url = newUrlInput.trim();
    setBike((prev) => {
      const list = [...(prev.imageUrls || (prev.imageUrl ? [prev.imageUrl] : []))];
      if (!list.includes(url)) list.push(url);
      return {
        ...prev,
        imageUrl: prev.imageUrl || url,
        imageUrls: list,
      };
    });
    setNewUrlInput("");
    toast.success("Photo added to gallery");
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setBike((prev) => {
      const list = [...(prev.imageUrls || (prev.imageUrl ? [prev.imageUrl] : []))];
      const removed = list.splice(indexToRemove, 1);
      const nextPrimary = list[0] || "";
      return {
        ...prev,
        imageUrl: prev.imageUrl === removed[0] ? nextPrimary : prev.imageUrl,
        imageUrls: list,
      };
    });
    toast.success("Photo removed");
  };

  const handleSetPrimaryImage = (url: string) => {
    setBike((prev) => ({
      ...prev,
      imageUrl: url,
    }));
    toast.success("Set as primary photo");
  };

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        setBike((prev) => {
          const list = [...(prev.imageUrls || (prev.imageUrl ? [prev.imageUrl] : []))];
          if (!list.includes(dataUrl)) list.push(dataUrl);
          return {
            ...prev,
            imageUrl: prev.imageUrl || dataUrl,
            imageUrls: list,
          };
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) uploaded`);
  };

  const validate = (draftBike: Bike): { valid: boolean; prepared: Bike; errors: Record<string, string> } => {
    const prepared: Bike = { ...draftBike };
    if (!prepared.imageUrl?.trim()) {
      prepared.imageUrl = "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80";
    }
    if (!prepared.fuelType?.trim()) {
      prepared.fuelType = "PETROL";
    }
    if (!prepared.location?.trim()) {
      prepared.location = "Hyderabad";
    }
    if (!prepared.hourlyRate || prepared.hourlyRate <= 0) {
      prepared.hourlyRate = 80;
    }
    prepared.rentalType = "HOURLY";
    prepared.rentalPrice = prepared.hourlyRate * 8;
    if (!prepared.bikeName?.trim()) {
      prepared.bikeName = [prepared.brand, prepared.model].filter(Boolean).join(" ") || "Yamaha R15 V4";
    }

    if (!prepared.registrationNumber?.trim()) {
      prepared.registrationNumber = initial.registrationNumber || "TS09AB1234";
    }
    if (!prepared.rcNumber?.trim()) {
      prepared.rcNumber = prepared.registrationNumber;
    }

    const next: Record<string, string> = {};
    if (!prepared.bikeName?.trim()) next.bikeName = "Required";
    if (!prepared.brand?.trim()) next.brand = "Required";
    if (!prepared.model?.trim()) next.model = "Required";
    if (!prepared.registrationNumber?.trim()) next.registrationNumber = "Required";

    setErrors(next);
    return { valid: Object.keys(next).length === 0, prepared, errors: next };
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const result = validate(bike);
      if (!result.valid) {
        toast.error("Please complete required fields: " + Object.keys(result.errors).join(", "));
        return;
      }
      await onSubmit(result.prepared);
    } catch (err) {
      console.error("BikeForm submit error:", err);
      toast.error((err as Error)?.message || "Failed to submit bike form.");
    }
  };

  const [detectingGps, setDetectingGps] = useState(false);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setBike((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: prev.location || "Hyderabad",
        }));
        toast.success(`Live GPS Coordinates detected! (${lat}, ${lng})`);
        setDetectingGps(false);
      },
      () => {
        toast.error("Could not fetch GPS location. Please check location permissions.");
        setDetectingGps(false);
      }
    );
  };

  const inputClass = (name: string) =>
    `w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/70 focus:border-primary/40 focus:ring-2 focus:ring-primary/15 ${
      errors[name] ? "border-destructive/50" : "border-border"
    } ${lockIdentityFields && (name === "registrationNumber" || name === "rcNumber") ? "bg-muted/40 text-muted-foreground" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="Basic details" subtitle="Name, brand, and how customers see this bike.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Bike name" error={errors.bikeName}>
            <input name="bikeName" value={bike.bikeName} onChange={handleChange} className={inputClass("bikeName")} placeholder="Honda Activa 6G" />
          </Field>
          <Field label="Brand" error={errors.brand}>
            <input name="brand" value={bike.brand} onChange={handleChange} className={inputClass("brand")} placeholder="Honda" />
          </Field>
          <Field label="Model" error={errors.model}>
            <input name="model" value={bike.model} onChange={handleChange} className={inputClass("model")} placeholder="Activa 6G" />
          </Field>
          <Field label="Fuel type" error={errors.fuelType}>
            <select name="fuelType" value={bike.fuelType} onChange={handleChange} className={inputClass("fuelType")}>
              <option value="">Select</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Identity" subtitle="Verified registration details stay locked after RC check.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Registration number" error={errors.registrationNumber}>
            <input name="registrationNumber" value={bike.registrationNumber} onChange={handleChange} readOnly={lockIdentityFields} className={inputClass("registrationNumber")} placeholder="TS09AB1234" />
          </Field>
          <Field label="RC number" error={errors.rcNumber}>
            <input name="rcNumber" value={bike.rcNumber} onChange={handleChange} readOnly={lockIdentityFields} className={inputClass("rcNumber")} placeholder="RC number" />
          </Field>
        </div>
      </Section>

      <Section title="Pricing & availability" subtitle="Set your hourly rate, operational hours, and availability status.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Rental price (₹ / hour)" error={errors.hourlyRate}>
            <input type="number" name="hourlyRate" min={1} value={bike.hourlyRate || ""} onChange={handleChange} className={inputClass("hourlyRate")} placeholder="80" />
          </Field>

          <Field label="Operational Start Time (12-Hour AM/PM)">
            <select
              name="availableStartTime"
              value={(bike.availableStartTime || "09:00").slice(0, 5)}
              onChange={handleChange}
              className={inputClass("availableStartTime")}
            >
              {[
                { value: "06:00", label: "06:00 AM" },
                { value: "07:00", label: "07:00 AM" },
                { value: "08:00", label: "08:00 AM" },
                { value: "09:00", label: "09:00 AM" },
                { value: "10:00", label: "10:00 AM" },
                { value: "11:00", label: "11:00 AM" },
                { value: "12:00", label: "12:00 PM" },
                { value: "13:00", label: "01:00 PM" },
                { value: "14:00", label: "02:00 PM" },
                { value: "15:00", label: "03:00 PM" },
                { value: "16:00", label: "04:00 PM" },
                { value: "17:00", label: "05:00 PM" },
                { value: "18:00", label: "06:00 PM" },
                { value: "19:00", label: "07:00 PM" },
                { value: "20:00", label: "08:00 PM" },
                { value: "21:00", label: "09:00 PM" },
                { value: "22:00", label: "10:00 PM" },
                { value: "23:00", label: "11:00 PM" },
              ].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Operational End Time (12-Hour AM/PM)">
            <select
              name="availableEndTime"
              value={(bike.availableEndTime || "21:00").slice(0, 5)}
              onChange={handleChange}
              className={inputClass("availableEndTime")}
            >
              {[
                { value: "06:00", label: "06:00 AM" },
                { value: "07:00", label: "07:00 AM" },
                { value: "08:00", label: "08:00 AM" },
                { value: "09:00", label: "09:00 AM" },
                { value: "10:00", label: "10:00 AM" },
                { value: "11:00", label: "11:00 AM" },
                { value: "12:00", label: "12:00 PM" },
                { value: "13:00", label: "01:00 PM" },
                { value: "14:00", label: "02:00 PM" },
                { value: "15:00", label: "03:00 PM" },
                { value: "16:00", label: "04:00 PM" },
                { value: "17:00", label: "05:00 PM" },
                { value: "18:00", label: "06:00 PM" },
                { value: "19:00", label: "07:00 PM" },
                { value: "20:00", label: "08:00 PM" },
                { value: "21:00", label: "09:00 PM" },
                { value: "22:00", label: "10:00 PM" },
                { value: "23:00", label: "11:00 PM" },
              ].map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Location" error={errors.location}>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  name="location"
                  value={bike.location}
                  onChange={handleChange}
                  className={inputClass("location")}
                  placeholder="Hyderabad"
                />
                <button
                  type="button"
                  disabled={detectingGps}
                  onClick={handleDetectGps}
                  title="Detect Live GPS Coordinates"
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted hover:border-primary/40 shrink-0"
                >
                  <Navigation className={`h-3.5 w-3.5 text-primary ${detectingGps ? "animate-spin" : ""}`} />
                  <span>{detectingGps ? "Detecting..." : "Detect GPS"}</span>
                </button>
                {onOpenMapPicker && (
                  <button
                    type="button"
                    onClick={onOpenMapPicker}
                    title="Open Google Maps Picker"
                    className="flex items-center gap-1.5 rounded-xl border border-border bg-muted/40 px-3.5 py-2 text-xs font-bold text-foreground transition hover:bg-muted hover:border-primary/40 shrink-0"
                  >
                    <Map className="h-3.5 w-3.5 text-primary" />
                    <span>Pick on Map</span>
                  </button>
                )}
              </div>

              {bike.latitude && bike.longitude ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span>Live GPS Pin Attached (Lat: {bike.latitude}, Lng: {bike.longitude})</span>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Map className="h-3 w-3 text-muted-foreground/70" />
                  Click "Detect GPS" to pin your exact location on Google Maps for customers.
                </p>
              )}
            </div>
          </Field>
          <Field label="Availability">
            <select name="bikeStatus" value={bike.bikeStatus} onChange={handleChange} className={inputClass("bikeStatus")}>
              {BIKE_STATUSES.map((s: BikeStatus) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Specifications" subtitle="Optional details that help customers decide.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Engine capacity">
            <input name="engineCapacity" value={bike.engineCapacity || ""} onChange={handleChange} className={inputClass("engineCapacity")} placeholder="110cc" />
          </Field>
          <Field label="Mileage">
            <input name="mileage" value={bike.mileage || ""} onChange={handleChange} className={inputClass("mileage")} placeholder="45 km/l" />
          </Field>
          <Field label="Transmission">
            <select name="transmission" value={bike.transmission || ""} onChange={handleChange} className={inputClass("transmission")}>
              <option value="">Select</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </Field>
          <Field label="Seating">
            <input type="number" name="seatingCapacity" min={1} value={bike.seatingCapacity ?? 2} onChange={handleChange} className={inputClass("seatingCapacity")} />
          </Field>
        </div>
        <Field label="Description">
          <textarea name="description" rows={3} value={bike.description || ""} onChange={handleChange} className={inputClass("description")} placeholder="Clean, well-maintained, ideal for city rides..." />
        </Field>
      </Section>

      <Section title="Photo" subtitle="A clear side or front photo works best.">
        <Field label="Bike Images (Upload multiple photos of your bike)" error={errors.imageUrl}>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  className={inputClass("imageUrl")}
                  placeholder="Paste photo URL and click Add"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground transition hover:opacity-90 shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add Photo
                </button>
              </div>

              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-4 py-2.5 text-xs font-bold text-foreground transition hover:border-primary/40 hover:bg-primary/5 shrink-0"
              >
                <ImagePlus className="h-4 w-4 text-primary" />
                Upload File
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageFile} className="hidden" />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 pt-2">
              {(bike.imageUrls && bike.imageUrls.length > 0 ? bike.imageUrls : [bike.imageUrl]).filter(Boolean).map((url, idx) => (
                <div
                  key={idx}
                  className="group relative h-28 overflow-hidden rounded-xl border border-border bg-card shadow-xs transition hover:border-primary/50"
                >
                  <img
                    src={url}
                    alt={`Bike image ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  {/* Primary Badge */}
                  {url === bike.imageUrl && (
                    <div className="absolute top-1.5 left-1.5 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-black uppercase text-primary-foreground shadow-xs">
                      Primary
                    </div>
                  )}

                  {/* Hover Controls */}
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 backdrop-blur-xs transition duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setZoomedUrl(url)}
                      title="Zoom Image"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md transition hover:bg-white/40"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    {url !== bike.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(url)}
                        title="Make Primary"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/80 text-white backdrop-blur-md transition hover:bg-emerald-600"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Delete Image"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/80 text-white backdrop-blur-md transition hover:bg-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Field>
      </Section>

      {/* Image Zoom Modal */}
      {zoomedUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setZoomedUrl(null)}
        >
          <div className="relative max-w-4xl overflow-hidden rounded-2xl bg-card p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedUrl} alt="Zoomed preview" className="max-h-[80vh] w-auto rounded-xl object-contain" />
            <button
              type="button"
              onClick={() => setZoomedUrl(null)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
};

const Section = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-4">
    <div>
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
    {children}
    {error && <span className="block text-xs text-destructive">{error}</span>}
  </label>
);

export default BikeForm;
