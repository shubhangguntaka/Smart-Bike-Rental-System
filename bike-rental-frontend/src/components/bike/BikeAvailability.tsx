interface BikeAvailabilityProps {
  status: string;
  compact?: boolean;
}

const STATUS_META: Record<
  string,
  { label: string; dot: string; text: string; bg: string }
> = {
  AVAILABLE: {
    label: "Available",
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    bg: "bg-emerald-50",
  },
  BOOKED: {
    label: "Booked",
    dot: "bg-rose-500",
    text: "text-rose-800",
    bg: "bg-rose-50",
  },
  UNDER_MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-500",
    text: "text-amber-900",
    bg: "bg-amber-50",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-amber-500",
    text: "text-amber-900",
    bg: "bg-amber-50",
  },
  NOT_AVAILABLE: {
    label: "Unavailable",
    dot: "bg-slate-400",
    text: "text-slate-700",
    bg: "bg-slate-100",
  },
};

const BikeAvailability = ({ status, compact = false }: BikeAvailabilityProps) => {
  const key = (status || "").toUpperCase().replace(/\s+/g, "_");
  const meta = STATUS_META[key] || {
    label: status?.replace(/_/g, " ") || "Unknown",
    dot: "bg-slate-400",
    text: "text-slate-700",
    bg: "bg-slate-100",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${meta.bg} ${meta.text} ${
        compact ? "rounded-md px-2 py-0.5 text-[10px]" : "rounded-lg px-2.5 py-1 text-xs"
      } font-semibold tracking-wide`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

export default BikeAvailability;
