import type { Bike } from "../../types/bike";
import { format12Hour } from "@/utils/timeUtils";

interface BikeSpecificationsProps {
  bike: Bike;
}

const BikeSpecifications = ({ bike }: BikeSpecificationsProps) => {
  const items = [
    { label: "Brand", value: bike.brand },
    { label: "Model", value: bike.model },
    {
      label: "Engine",
      value: bike.engineCapacity || bike.specifications?.engineCapacity,
    },
    { label: "Fuel", value: bike.fuelType },
    { label: "Mileage", value: bike.mileage || bike.specifications?.mileage },
    {
      label: "Transmission",
      value: bike.transmission || bike.specifications?.transmission,
    },
    {
      label: "Seats",
      value:
        bike.seatingCapacity ?? bike.specifications?.seatingCapacity ?? undefined,
    },
    {
      label: "Operational Hours",
      value:
        bike.availableStartTime || bike.availableEndTime
          ? `${format12Hour(bike.availableStartTime || "09:00")} – ${format12Hour(bike.availableEndTime || "21:00")}`
          : "Full Day (24 Hrs)",
    },
    {
      label: "Rental Mode",
      value: bike.rentalType ? `${bike.rentalType}${bike.hourlyRate ? ` (₹${bike.hourlyRate}/hr)` : ""}` : "DAILY",
    },
  ];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-lg font-semibold text-foreground">
        Specifications
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Technical details for this bike
      </p>

      <dl className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-border bg-background/60 px-4 py-3"
          >
            <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {item.value === undefined || item.value === ""
                ? "—"
                : String(item.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default BikeSpecifications;
