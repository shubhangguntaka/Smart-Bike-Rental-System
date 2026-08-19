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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <h3 className="text-lg font-bold text-foreground">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50 ${
              actionType === "danger"
                ? "bg-destructive"
                : "bg-green-600"
            }`}
          >
            {loading ? "Processing..." : actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}