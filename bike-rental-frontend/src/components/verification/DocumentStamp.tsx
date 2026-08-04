import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  label: string | null;
  color: string | null; // "green" | "red" (from backend constants)
  message?: string | null;
}

const THEME: Record<
  string,
  { ring: string; text: string; border: string; glow: string; Icon: typeof CheckCircle2 }
> = {
  green: {
    ring: "animate-stamp-ring",
    text: "text-verified",
    border: "border-verified",
    glow: "shadow-[0_0_0_4px_rgba(30,127,77,0.08)]",
    Icon: CheckCircle2,
  },
  red: {
    ring: "animate-stamp-ring-rejected",
    text: "text-crimson",
    border: "border-crimson",
    glow: "shadow-[0_0_0_4px_rgba(179,38,30,0.08)]",
    Icon: XCircle,
  },
};

// Renders the backend's verdict as a rotated ink-stamp seal that
// slams into place, mirroring how a physical document gets stamped
// at a verification counter. `key`-driven remount at the call site
// is what re-triggers the slam animation on each new result.
const DocumentStamp = ({ label, color, message }: Props) => {
  const theme = THEME[color ?? ""] ?? THEME.red;
  const { Icon } = theme;

  return (
    <div className="flex flex-col items-center gap-4 py-2 text-center">
      <div
        className={`animate-stamp-slam flex h-28 w-28 shrink-0 rotate-[-7deg] items-center justify-center rounded-full border-[3px] ${theme.border} ${theme.ring} ${theme.glow} bg-white/70`}
      >
        <div className={`flex flex-col items-center gap-1 ${theme.text}`}>
          <Icon size={26} strokeWidth={2} />
          <span className="font-display text-[11px] font-bold uppercase tracking-[0.12em]">
            {label ?? "Unknown"}
          </span>
        </div>
      </div>

      {message && (
        <p className="max-w-sm text-sm leading-relaxed text-slate-500">{message}</p>
      )}
    </div>
  );
};

export default DocumentStamp;
