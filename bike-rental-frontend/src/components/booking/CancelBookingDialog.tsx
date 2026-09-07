import React, { useState, useEffect } from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter } from "@/components/common/Modal";
import { AlertTriangle, XCircle, Loader2, Check } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isOwner?: boolean;
  loading?: boolean;
  bookingTitle?: string;
}

const CUSTOMER_REASONS = [
  "Change of plans",
  "Found another bike",
  "Booking mistake",
  "Personal reason",
  "Other",
];

const OWNER_REASONS = [
  "Bike unavailable",
  "Bike maintenance",
  "Bike issue/damage",
  "Emergency",
  "Owner unavailable",
  "Other",
];

const CancelBookingDialog: React.FC<Props> = ({
  open,
  onClose,
  onConfirm,
  isOwner = false,
  loading = false,
  bookingTitle,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");

  useEffect(() => {
    if (open) {
      setSelectedReason("");
      setCustomReason("");
    }
  }, [open]);

  const reasons = isOwner ? OWNER_REASONS : CUSTOMER_REASONS;

  const getFinalReason = (): string => {
    if (selectedReason === "Other") {
      return customReason.trim();
    }
    return selectedReason.trim();
  };

  const isConfirmDisabled =
    loading ||
    !selectedReason ||
    (selectedReason === "Other" && !customReason.trim());

  const handleConfirm = () => {
    const finalReason = getFinalReason();
    if (finalReason) {
      onConfirm(finalReason);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={loading ? () => {} : onClose}
      size="md"
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
    >
      <ModalHeader
        onClose={loading ? undefined : onClose}
        showCloseButton={!loading}
      >
        <div className="flex items-center gap-2 text-foreground font-bold">
          <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive">
            <XCircle className="h-5 w-5" />
          </div>
          <span>
            Cancel Booking {bookingTitle ? `(${bookingTitle})` : ""}
          </span>
        </div>
      </ModalHeader>

      <ModalBody className="space-y-4 text-foreground">
        {/* Warning Callout */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs leading-relaxed">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Cancellation Confirmation</p>
            <p className="text-muted-foreground mt-0.5">
              {isOwner
                ? "Cancelling this booking will release the bike back to inventory and notify the customer."
                : "Cancelling your booking will immediately release your vehicle reservation."}
            </p>
          </div>
        </div>

        {/* Quick Reason Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
            Select Reason <span className="text-destructive">*</span>
          </label>

          <div className="flex flex-wrap gap-2">
            {reasons.map((r) => {
              const isSelected = selectedReason === r;
              return (
                <button
                  key={r}
                  type="button"
                  disabled={loading}
                  onClick={() => setSelectedReason(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-destructive text-white border border-destructive shadow-xs"
                      : "bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5" />}
                  <span>{r}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Alternative */}
        <div className="space-y-1.5">
          <label
            htmlFor="cancellation-reason-select"
            className="text-xs font-semibold text-muted-foreground block"
          >
            Or choose from dropdown:
          </label>
          <select
            id="cancellation-reason-select"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground shadow-xs outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive transition duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              -- Select a cancellation reason --
            </option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Reason input when 'Other' is chosen */}
        {selectedReason === "Other" && (
          <div className="space-y-1.5 animate-in fade-in duration-200">
            <label
              htmlFor="custom-cancellation-reason"
              className="text-xs font-bold text-foreground flex items-center justify-between"
            >
              <span>
                Specify Custom Reason <span className="text-destructive">*</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {customReason.length}/255
              </span>
            </label>
            <textarea
              id="custom-cancellation-reason"
              value={customReason}
              maxLength={255}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Please provide details regarding the cancellation..."
              rows={3}
              disabled={loading}
              autoFocus
              className="w-full rounded-xl border border-border bg-background p-3 text-xs sm:text-sm font-medium text-foreground placeholder:text-muted-foreground/60 shadow-xs outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive transition duration-200 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </ModalBody>

      <ModalFooter className="gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Keep Booking
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="w-full sm:w-auto px-4.5 py-2.5 rounded-xl bg-destructive hover:bg-destructive/90 text-white text-xs sm:text-sm font-bold shadow-md shadow-destructive/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Cancelling...</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              <span>Confirm Cancellation</span>
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
};

export default CancelBookingDialog;