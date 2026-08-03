import React from "react";
import { cn } from "@/utils/cn";

export interface ModalBodyProps {
  /**
   * Content inside the body container.
   */
  children?: React.ReactNode;
  /**
   * Custom CSS classes.
   */
  className?: string;
  /**
   * Whether to display custom margins or paddings.
   */
  noPadding?: boolean;
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className,
  noPadding = false,
}) => {
  return (
    <div
      className={cn(
        "flex-1 min-h-0 overflow-y-auto bg-card text-foreground text-sm leading-relaxed",
        !noPadding && "px-6 py-5",
        className
      )}
    >
      {children}
    </div>
  );
};
