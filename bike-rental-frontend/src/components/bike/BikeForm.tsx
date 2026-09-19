import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  MapPin,
  Navigation,
  Map,
  Plus,
  Trash2,
  ZoomIn,
  Star,
  Sparkles,
  ShieldCheck,
  Clock,
  SlidersHorizontal,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  Gauge,
  Fuel,
  Users,
  Compass,
  Edit3,
} from "lucide-react";
import toast from "react-hot-toast";
import type { Bike, BikeStatus } from "../../types/bike";
import { BIKE_STATUSES } from "../../types/bike";
import LocationPickerModal from "./LocationPickerModal";

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
  submitLabel = "Save & Proceed to RC Verification →",
  loading = false,
  onSubmit,
  onCancel,
  onOpenMapPicker,
}: BikeFormProps) => {
  const [bike, setBike] = useState<Bike>({ ...initial });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
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
      rcNumber: name === "registrationNumber" ? value : (prev.rcNumber || (name === "registrationNumber" ? value : prev.registrationNumber)),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      delete next.rcNumber;
      return next;
    });
  };

  const [newUrlInput, setNewUrlInput] = useState("");
  const [zoomedUrl, setZoomedUrl] = useState<string | null>(null);

  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    const url = newUrlInput.trim();
    setBike((prev) => {
      const list = [...(prev.imageUrls || [])];
      if (!list.includes(url)) list.unshift(url);
      return {
        ...prev,
        imageUrl: url,
        imageUrls: list,
      };
    });
    setNewUrlInput("");
    toast.success("Photo added as primary bike image");
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
          const list = [...(prev.imageUrls || [])];
          if (!list.includes(dataUrl)) list.unshift(dataUrl);
          return {
            ...prev,
            imageUrl: dataUrl,
            imageUrls: list,
          };
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) uploaded successfully!`);
  };

  const validate = (draftBike: Bike): { valid: boolean; prepared: Bike; errors: Record<string, string> } => {
    const prepared: Bike = { ...draftBike };
    prepared.rcNumber = prepared.registrationNumber;

    const rate = Number(prepared.hourlyRate);
    prepared.hourlyRate = rate > 0 ? rate : 80;
    prepared.rentalType = "HOURLY";
    prepared.rentalPrice = prepared.hourlyRate * 8;
    prepared.availableStartTime = prepared.availableStartTime || "09:00";
    prepared.availableEndTime = prepared.availableEndTime || "21:00";
    prepared.availableDate = prepared.availableDate || new Date().toISOString().split("T")[0];

    const next: Record<string, string> = {};
    if (!prepared.bikeName?.trim()) next.bikeName = "Bike Name is required";
    if (!prepared.brand?.trim()) next.brand = "Brand is required";
    if (!prepared.model?.trim()) next.model = "Model is required";
    if (!prepared.fuelType?.trim()) next.fuelType = "Fuel Type is required";
    if (!prepared.registrationNumber?.trim()) next.registrationNumber = "Registration Number is required";
    if (!prepared.location?.trim()) next.location = "Location is required";
    if (!prepared.hourlyRate || prepared.hourlyRate <= 0) next.hourlyRate = "Rental rate is required";

    const hasPhoto = Boolean(
      (prepared.imageUrl && prepared.imageUrl.trim()) ||
      (prepared.imageUrls && prepared.imageUrls.length > 0 && prepared.imageUrls.some((u) => u.trim()))
    );

    if (!hasPhoto) {
      next.imageUrl = "Vehicle photo is required. Please upload or attach at least 1 photo.";
    }

    setErrors(next);
    return { valid: Object.keys(next).length === 0, prepared, errors: next };
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const result = validate(bike);
      if (!result.valid) {
        toast.error("Please fill in all mandatory fields marked with * to proceed.");
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
      async (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));

        let resolvedLocation = bike.location || "Hyderabad";
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data && data.display_name) {
            const addr = data.address || {};
            const neighbourhood =
              addr.suburb ||
              addr.neighbourhood ||
              addr.commercial ||
              addr.residential ||
              addr.road;
            const city = addr.city || addr.town || "Hyderabad";
            if (neighbourhood && neighbourhood !== city) {
              resolvedLocation = `${neighbourhood}, ${city}`;
            } else {
              resolvedLocation = data.display_name.split(",").slice(0, 2).join(",").trim();
            }
          }
        } catch {
          // safe fallback
        }

        setBike((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          location: resolvedLocation,
        }));
        toast.success(`Live GPS attached: ${resolvedLocation} (${lat}, ${lng})`);
        setDetectingGps(false);
      },
      () => {
        toast.error("Could not fetch GPS location. Please check browser permissions.");
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const inputClass = (name: string) =>
    `w-full rounded-2xl border bg-background/90 px-4 py-3 text-sm font-medium text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${errors[name] ? "border-destructive/60 bg-destructive/5 ring-2 ring-destructive/10" : "border-border/80"
    } ${lockIdentityFields && (name === "registrationNumber" || name === "rcNumber") ? "bg-muted/50 text-muted-foreground cursor-not-allowed" : ""}`;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SECTION 1: Vehicle Specifications */}
      <Section
        icon={<Sparkles className="h-4 w-4 text-primary" />}
        badge="Step 1 of 3"
        title="Vehicle Basic Specifications"
        subtitle="Provide vehicle name, brand, model, and fuel type as customers will see it."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Bike Display Name" required error={errors.bikeName}>
            <input
              name="bikeName"
              value={bike.bikeName}
              onChange={handleChange}
              className={inputClass("bikeName")}
              placeholder="e.g. Royal Enfield Classic 350"
            />
          </Field>

          <Field label="Brand / Manufacturer" required error={errors.brand}>
            <input
              name="brand"
              value={bike.brand}
              onChange={handleChange}
              className={inputClass("brand")}
              placeholder="e.g. Royal Enfield"
            />
          </Field>

          <Field label="Vehicle Model" required error={errors.model}>
            <input
              name="model"
              value={bike.model}
              onChange={handleChange}
              className={inputClass("model")}
              placeholder="e.g. Classic 350"
            />
          </Field>

          <Field label="Fuel Category" required error={errors.fuelType}>
            <select
              name="fuelType"
              value={bike.fuelType}
              onChange={handleChange}
              className={inputClass("fuelType")}
            >
              <option value="">Select Fuel Category</option>
              <option value="Petrol">Petrol</option>
              <option value="Electric">Electric</option>
              <option value="Diesel">Diesel</option>
              <option value="CNG">CNG</option>
            </select>
          </Field>
        </div>
      </Section>

      {/* SECTION 2: Identity & Registration */}
      <Section
        icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />}
        badge="RC OCR Match"
        title="Vehicle Registration Identity"
        subtitle="Enter valid Registration Number. It will be verified against your uploaded RC document."
      >
        <div className="grid grid-cols-1 gap-5">
          <Field label="Registration Number" required error={errors.registrationNumber}>
            <input
              name="registrationNumber"
              value={bike.registrationNumber}
              onChange={handleChange}
              readOnly={lockIdentityFields}
              className={inputClass("registrationNumber")}
              placeholder="e.g. TS09AB1234"
            />
          </Field>
        </div>
      </Section>

      {/* SECTION 3: Pricing, Hours & Location */}
      <Section
        icon={<Clock className="h-4 w-4 text-primary" />}
        badge="Live Shift Settings"
        title="Rental Rate, Operational Shift & City Location"
        subtitle="Set hourly pricing rate, operating shift hours, and pickup city location."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Hourly Rental Rate (₹ / hr)" required error={errors.hourlyRate}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                name="hourlyRate"
                min={1}
                value={bike.hourlyRate || ""}
                onChange={handleChange}
                className={`${inputClass("hourlyRate")} pl-8`}
                placeholder="80"
              />
            </div>
          </Field>

          <Field label="Listing Availability Status">
            <select
              name="bikeStatus"
              value={bike.bikeStatus || "AVAILABLE"}
              onChange={handleChange}
              className={inputClass("bikeStatus")}
            >
              {BIKE_STATUSES.map((s: BikeStatus) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </select>
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

          <div className="sm:col-span-2 space-y-3">
            <Field label="City Pickup Location" required error={errors.location}>
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      name="location"
                      value={bike.location}
                      onChange={handleChange}
                      className={`${inputClass("location")} pl-10`}
                      placeholder="e.g. Madhapur, Hitech City, Hyderabad"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-3 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95 shrink-0"
                    title="Set Location on Map"
                  >
                    <Map className="h-4 w-4" />
                    <span>Set on Map</span>
                  </button>

                  <button
                    type="button"
                    disabled={detectingGps}
                    onClick={handleDetectGps}
                    title="Detect Live GPS Coordinates"
                    className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted px-4 py-3 text-xs font-bold text-foreground transition shrink-0 cursor-pointer active:scale-95"
                  >
                    <Navigation className={`h-4 w-4 text-emerald-600 ${detectingGps ? "animate-spin" : ""}`} />
                    <span>{detectingGps ? "Detecting..." : "Live GPS"}</span>
                  </button>
                </div>

                {bike.latitude && bike.longitude ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 shrink-0">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <span>Station Coordinates: </span>
                        <span className="font-mono text-[11px] font-extrabold bg-background/80 px-2 py-0.5 rounded-md border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                          {bike.latitude}, {bike.longitude}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLocationPickerOpen(true)}
                      className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline inline-flex items-center gap-1 cursor-pointer font-bold ml-auto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Change Pin on Map</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span>Click <strong>Set on Map</strong> to drag/search your exact station pin, or <strong>Live GPS</strong> to detect your current spot.</span>
                  </p>
                )}
              </div>
            </Field>
          </div>
        </div>
      </Section>

      {/* SECTION 4: Technical Specs */}
      <Section
        icon={<SlidersHorizontal className="h-4 w-4 text-primary" />}
        badge="Optional Specs"
        title="Engine Capacity, Mileage & Seating"
        subtitle="Provide technical specs to help customers choose your vehicle."
      >
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <Field label="Engine CC">
            <input
              name="engineCapacity"
              value={bike.engineCapacity || ""}
              onChange={handleChange}
              className={inputClass("engineCapacity")}
              placeholder="e.g. 350cc"
            />
          </Field>
          <Field label="Mileage">
            <input
              name="mileage"
              value={bike.mileage || ""}
              onChange={handleChange}
              className={inputClass("mileage")}
              placeholder="e.g. 45 km/l"
            />
          </Field>
          <Field label="Transmission">
            <select
              name="transmission"
              value={bike.transmission || ""}
              onChange={handleChange}
              className={inputClass("transmission")}
            >
              <option value="">Select</option>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </Field>
          <Field label="Seating Capacity">
            <input
              type="number"
              name="seatingCapacity"
              min={1}
              value={bike.seatingCapacity ?? 2}
              onChange={handleChange}
              className={inputClass("seatingCapacity")}
            />
          </Field>
        </div>

        <Field label="Vehicle Description">
          <textarea
            name="description"
            rows={3}
            value={bike.description || ""}
            onChange={handleChange}
            className={inputClass("description")}
            placeholder="Describe vehicle condition, key features, or special instructions..."
          />
        </Field>
      </Section>

      {/* SECTION 5: Bike Gallery Photos */}
      <Section
        icon={<ImagePlus className="h-4 w-4 text-primary" />}
        badge="Mandatory Photo"
        title="Vehicle Photo Gallery"
        subtitle="Upload at least 1 clear photo or paste an image URL to list your vehicle."
      >
        <Field label="Upload Vehicle Photo" required error={errors.imageUrl}>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
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
                placeholder="Paste image URL (Unsplash, Imgur) and click Add Photo"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-muted px-4 py-3 text-xs font-bold text-foreground transition hover:bg-muted/80 shrink-0"
              >
                <Plus className="h-4 w-4 text-primary" /> Add Photo URL
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-xs font-bold text-primary transition hover:bg-primary/10 shrink-0"
              >
                <ImagePlus className="h-4 w-4" /> Upload Files
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImageFile} className="hidden" />
            </div>

            {/* Photo Gallery Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 pt-2">
              {(bike.imageUrls && bike.imageUrls.length > 0 ? bike.imageUrls : [bike.imageUrl]).filter(Boolean).map((url, idx) => (
                <div
                  key={idx}
                  className="group relative h-32 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition hover:border-primary/50"
                >
                  <img
                    src={url}
                    alt={`Vehicle photo ${idx + 1}`}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  {url === bike.imageUrl && (
                    <div className="absolute top-2 left-2 rounded-lg bg-primary px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-primary-foreground shadow-xs">
                      Primary
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 backdrop-blur-xs transition duration-200 group-hover:opacity-100">
                    {url !== bike.imageUrl && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(url)}
                        title="Set as Primary Image"
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs transition hover:scale-105"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      title="Remove Photo"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-destructive text-white shadow-xs transition hover:scale-105"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-sm"
          onClick={() => setZoomedUrl(null)}
        >
          <div className="relative max-w-4xl max-w-[calc(100vw-1.5rem)] max-h-[90dvh] overflow-hidden rounded-2xl sm:rounded-3xl bg-card p-1.5 sm:p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={zoomedUrl} alt="Zoomed preview" className="max-h-[80dvh] w-auto max-w-full rounded-xl sm:rounded-2xl object-contain mx-auto" />
            <button
              type="button"
              onClick={() => setZoomedUrl(null)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black/90 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Submit Action Bar */}
      <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border/80 bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-border px-6 py-3 text-xs font-bold text-foreground transition hover:bg-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-xs font-extrabold uppercase tracking-wider text-primary-foreground shadow-md transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60 cursor-pointer sm:w-auto ml-auto"
        >
          <span>{loading ? "Saving Specs..." : submitLabel}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {/*Style Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        initialLat={bike.latitude}
        initialLng={bike.longitude}
        initialLocationName={bike.location}
        onSelectLocation={(data) => {
          setBike((prev) => ({
            ...prev,
            location: data.locationName,
            latitude: data.latitude,
            longitude: data.longitude,
          }));
          toast.success(`Location set to ${data.locationName} (${data.latitude}, ${data.longitude})`);
        }}
      />
    </form>
  );
};

const Section = ({
  icon,
  badge,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) => (
  <section className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xs space-y-6 transition duration-300 hover:border-primary/30">
    <div className="flex items-start justify-between border-b border-border/60 pb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          {icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <span className="hidden sm:inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-primary border border-primary/20">
        {badge}
      </span>
    </div>
    {children}
  </section>
);

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
      <span>{label}</span>
      {required && <span className="text-destructive font-black text-xs">*</span>}
    </span>
    {children}
    {error && <span className="block text-xs font-bold text-destructive animate-shake">{error}</span>}
  </label>
);

export default BikeForm;
