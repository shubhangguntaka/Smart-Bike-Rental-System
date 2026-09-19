import React from "react";
import { X } from "lucide-react";

interface DetailItem {
  label: string;
  value?: React.ReactNode;
}

interface AdminDetailModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  items: DetailItem[];
  badges?: React.ReactNode;
  headerImage?: string;
  onClose: () => void;
}

export default function AdminDetailModal({
  isOpen,
  title,
  subtitle,
  items,
  badges,
  headerImage,
  onClose,
}: AdminDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border border-border bg-card shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-4 sm:p-5 gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {headerImage && (
              <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={headerImage}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground truncate">{title}</h3>
                {badges}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 gap-2.5 sm:gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/20 p-3 min-w-0"
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {item.label}
                </p>
                <div className="mt-1 text-xs font-semibold text-foreground break-words">
                  {item.value ?? <span className="text-muted-foreground italic">—</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-muted/10 p-3.5 sm:p-4 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-muted px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted/80 transition cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
