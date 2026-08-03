import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface ModalProps {
  /**
   * Toggles the visibility of the modal dialog.
   */
  isOpen: boolean;
  /**
   * Callback fired when closing is triggered (either ESC, overlay click, or close button).
   */
  onClose: () => void;
  /**
   * Closes the modal if user clicks on the backdrop overlay.
   * @default true
   */
  closeOnOverlayClick?: boolean;
  /**
   * Closes the modal if user presses the Escape keyboard button.
   * @default true
   */
  closeOnEsc?: boolean;
  /**
   * Size variation determining the maximum width.
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Custom CSS classes for the modal card container.
   */
  className?: string;
  /**
   * Main dialog content.
   */
  children?: React.ReactNode;
  /**
   * ID for title element for ARIA descriptors (falls back to a generated or auto ID).
   */
  ariaLabelledBy?: string;
  /**
   * ID for description element for ARIA descriptors.
   */
  ariaDescribedBy?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  size = "md",
  className,
  children,
  ariaLabelledBy,
  ariaDescribedBy,
}) => {
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Lock scrolling on document body when open
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Listen to Escape key events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEsc && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEsc, onClose]);

  // Trap Focus Logic: Keep Tab navigation bounded inside the Modal
  useEffect(() => {
    if (!isOpen) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const modalEl = modalContainerRef.current;
      if (!modalEl) return;

      // Find all focusable elements
      const focusableSelector =
        'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
      const focusableElements = Array.from(
        modalEl.querySelectorAll<HTMLElement>(focusableSelector)
      );

      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Tab backwards
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab forwards
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleFocusTrap);
    
    // Autofocus inside modal container on mount
    const timer = setTimeout(() => {
      const modalEl = modalContainerRef.current;
      if (modalEl) {
        const autofocusElement = modalEl.querySelector<HTMLElement>("[autofocus]");
        if (autofocusElement) {
          autofocusElement.focus();
        } else {
          // Focus the modal content itself
          modalEl.focus();
        }
      }
    }, 50);

    return () => {
      window.removeEventListener("keydown", handleFocusTrap);
      clearTimeout(timer);
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: "max-w-sm w-full mx-4",
    md: "max-w-md w-full mx-4",
    lg: "max-w-lg w-full mx-4",
    xl: "max-w-2xl w-full mx-4",
    full: "w-full h-full max-h-none rounded-none",
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeOnOverlayClick ? onClose : undefined}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            aria-hidden="true"
          />

          {/* Modal Container Wrapper */}
          <motion.div
            ref={modalContainerRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{
              type: "spring",
              damping: 28,
              stiffness: 300,
            }}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy}
            aria-describedby={ariaDescribedBy}
            className={cn(
              "relative z-10 flex flex-col max-h-[85vh] bg-card text-foreground rounded-2xl shadow-2xl border border-border focus:outline-none overflow-hidden",
              sizeClasses[size],
              className
            )}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
