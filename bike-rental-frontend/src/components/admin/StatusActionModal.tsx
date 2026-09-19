import React from "react";

interface StatusActionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel: string;
  actionType?: "danger" | "success";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function StatusActionModal({
  isOpen,
  title,
  description,
  actionLabel,
  actionType = "danger",
  loading = false,
  onClose,
  onConfirm,
}: StatusActionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3.5 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90dvh] flex flex-col overflow-y-auto rounded-2xl sm:rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-xl">
        <h3 className="text-base sm:text-lg font-bold text-foreground">
          {title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-5 sm:mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted disabled:opacity-50 cursor-pointer text-center"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`w-full sm:w-auto rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 cursor-pointer text-center ${
              actionType === "danger"
                ? "bg-destructive hover:bg-destructive/90"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading ? "Processing..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}