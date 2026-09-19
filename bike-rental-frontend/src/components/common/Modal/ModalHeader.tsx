import React from "react";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export interface ModalHeaderProps {
  /**
   * Title text or custom React element.
   */
  children?: React.ReactNode;
  /**
   * Show close icon button. Defaults to true if onClose is provided.
   */
  showCloseButton?: boolean;
  /**
   * Callback triggered when close icon button is clicked.
   */
  onClose?: () => void;
  /**
   * Custom CSS wrapper classes.
   */
  className?: string;
  /**
   * Id for accessibility.
   */
  id?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  showCloseButton = true,
  onClose,
  className,
  id,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-border bg-card text-foreground rounded-t-2xl sm:rounded-t-3xl shrink-0 gap-3",
        className
      )}
    >
      <h2 id={id} className="text-sm sm:text-base font-bold leading-6 truncate">
        {children}
      </h2>

      {showCloseButton && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className={cn(
            "p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 cursor-pointer",
            "focus:outline-none focus:ring-2 focus:ring-ring/25"
          )}
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
