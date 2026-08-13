import { getShiftState, type ShiftState } from "@/utils/timeUtils";

interface BikeAvailabilityProps {
  status?: string;
  compact?: boolean;
  availableStartTime?: string;
  availableEndTime?: string;
  isShiftPosted?: boolean;
}

const STATUS_META: Record<
  ShiftState,
  { label: string; dot: string; text: string; bg: string }
> = {
  AVAILABLE: {
    label: "Available Now",
    dot: "bg-emerald-500",
    text: "text-emerald-800 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20",
  },
  YET_TO_START: {
    label: "Shift Yet to Start",
    dot: "bg-blue-500",
    text: "text-blue-800 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/40 border border-blue-500/20",
  },
  SHIFT_CLOSED: {
    label: "Shift Closed",
    dot: "bg-amber-500",
    text: "text-amber-800 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/40 border border-amber-500/20",
  },
  BOOKED: {
    label: "Booked for current slot (Available after return)",
    dot: "bg-rose-500",
    text: "text-rose-800 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/40 border border-rose-500/20",
  },
  MAINTENANCE: {
    label: "Maintenance",
    dot: "bg-slate-500",
    text: "text-slate-700 dark:text-slate-300",
    bg: "bg-slate-100 dark:bg-slate-800/50 border border-slate-500/20",
  },
};

const BikeAvailability = ({
  status = "AVAILABLE",
  compact = false,
  availableStartTime,
  availableEndTime,
}: BikeAvailabilityProps) => {
  const shiftState = getShiftState(availableStartTime, availableEndTime, status);
  const meta = STATUS_META[shiftState] || STATUS_META.AVAILABLE;

  return (
    <span
      className={`inline-flex items-center gap-1.5 ${meta.bg} ${meta.text} ${
        compact ? "rounded-md px-2 py-0.5 text-[10px]" : "rounded-lg px-2.5 py-1 text-xs"
      } font-extrabold tracking-wide shadow-xs`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} animate-pulse`} />
      {meta.label}
    </span>
  );
};

export default BikeAvailability;
