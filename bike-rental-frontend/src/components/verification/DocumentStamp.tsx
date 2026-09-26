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
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-600 dark:border-emerald-400",
    glow: "shadow-[0_0_0_4px_rgba(34,197,94,0.12)]",
    Icon: CheckCircle2,
  },
  red: {
    ring: "animate-stamp-ring-rejected",
    text: "text-destructive",
    border: "border-destructive",
    glow: "shadow-[0_0_0_4px_rgba(239,68,68,0.12)]",
    Icon: XCircle,
  },
};

const DocumentStamp = ({ label, color, message }: Props) => {
  const theme = THEME[color ?? ""] ?? THEME.red;
  const { Icon } = theme;

  return (
    <div className="flex flex-col items-center gap-3 sm:gap-4 py-2 text-center w-full">
      <div
        className={`animate-stamp-slam flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 rotate-[-7deg] items-center justify-center rounded-full border-[3px] ${theme.border} ${theme.ring} ${theme.glow} bg-card/90 backdrop-blur-sm shadow-md`}
      >
        <div className={`flex flex-col items-center gap-1 ${theme.text}`}>
          <Icon size={24} strokeWidth={2.5} className="sm:h-7 sm:w-7" />
          <span className="font-serif text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em]">
            {label ?? "UNKNOWN"}
          </span>
        </div>
      </div>

      {message && (
        <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-muted-foreground px-2">
          {message}
        </p>
      )}
    </div>
  );
};

export default DocumentStamp;
