import React from "react";
import { cn } from "@/utils/cn";

export interface ModalFooterProps {
  /**
   * Action buttons or links.
   */
  children?: React.ReactNode;
  /**
   * Custom CSS wrapper classes.
   */
  className?: string;
  /**
   * Adjust items alignment (e.g. justify-end, justify-center).
   * @default "justify-end"
   */
  align?: "justify-start" | "justify-center" | "justify-end" | "justify-between";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className,
  align = "justify-end",
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4.5 border-t border-border bg-card rounded-b-2xl",
        align,
        className
      )}
    >
      {children}
    </div>
  );
};
