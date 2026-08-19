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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex items-center gap-3">
            {headerImage && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20">
                <img
                  src={headerImage}
                  alt={title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">{title}</h3>
                {badges}
              </div>
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-muted/20 p-3"
              >
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
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
        <div className="border-t border-border bg-muted/10 p-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-muted px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted/80 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
