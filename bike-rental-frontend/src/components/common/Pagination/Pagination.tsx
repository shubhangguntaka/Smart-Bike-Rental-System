import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/utils/cn";

export interface PaginationProps {
  /**
   * Current active page (1-indexed).
   */
  currentPage: number;
  /**
   * Total number of pages.
   */
  totalPages: number;
  /**
   * Callback fired when page selection changes.
   */
  onPageChange: (page: number) => void;
  /**
   * Number of page buttons shown on either side of the current active page.
   * @default 1
   */
  siblingCount?: number;
  /**
   * Display First (<<) and Last (>>) page shortcut buttons.
   * @default true
   */
  showFirstLast?: boolean;
  /**
   * Renders a form input allowing users to type and jump to a page.
   * @default true
   */
  showJumpToPage?: boolean;
  /**
   * Custom CSS wrapper classes.
   */
  className?: string;
}

export const DOTS = "...";

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  showJumpToPage = true,
  className,
}) => {
  const [jumpInput, setJumpInput] = useState("");

  // Keep jump input text blank/synced when page changes
  useEffect(() => {
    setJumpInput("");
  }, [currentPage]);

  // Main pagination range generation logic
  const paginationRange = useMemo(() => {
    // Math to compute visible elements
    // Pages to show: siblingCount + firstPage + lastPage + activePage + 2*dots
    const totalPageNumbers = siblingCount + 5;

    // Case 1: Total pages is less than the page numbers we want to show
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // We do not want to show dots if there is only one page number missing between siblings and bounds
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case 2: No left dots, but right dots show
    if (!showLeftDots && showRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, idx) => idx + 1);
      return [...leftRange, DOTS, totalPages];
    }

    // Case 3: No right dots, but left dots show
    if (showLeftDots && !showRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, idx) => totalPages - rightItemCount + idx + 1
      );
      return [firstPageIndex, DOTS, ...rightRange];
    }

    // Case 4: Both left and right dots show
    if (showLeftDots && showRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, idx) => idx + leftSiblingIndex
      );
      return [firstPageIndex, DOTS, ...middleRange, DOTS, lastPageIndex];
    }

    return [];
  }, [totalPages, siblingCount, currentPage]);

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handleJumpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPage = parseInt(jumpInput, 10);
    if (!isNaN(parsedPage) && parsedPage >= 1 && parsedPage <= totalPages) {
      onPageChange(parsedPage);
      setJumpInput("");
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 rounded-2xl border border-border bg-card text-foreground shadow-sm",
        className
      )}
    >
      {/* Mobile-friendly Info Label */}
      <div className="text-xs font-semibold text-muted-foreground order-2 sm:order-1">
        Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
        <span className="text-foreground font-bold">{totalPages}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center">
        {/* First Page Button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring/25 cursor-pointer"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}

        {/* Previous Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring/25 cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Pages Range Numbers (Hidden on narrow screens for simple view) */}
        <div className="hidden md:flex items-center gap-1.5">
          {paginationRange.map((pageNumber, idx) => {
            if (pageNumber === DOTS) {
              return (
                <span
                  key={`dots-${idx}`}
                  className="flex h-9 w-9 items-center justify-center text-xs font-bold text-muted-foreground"
                >
                  {DOTS}
                </span>
              );
            }

            const page = pageNumber as number;
            const isActive = page === currentPage;

            return (
              <button
                key={page}
                type="button"
                onClick={() => handlePageClick(page)}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Go to page ${page}`}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground font-black shadow-md shadow-primary/20 scale-105"
                    : "border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-ring/25"
                )}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Mobile Page Display */}
        <div className="md:hidden flex items-center justify-center px-3 py-1.5 rounded-xl border border-border bg-muted/30 text-xs font-bold">
          {currentPage} / {totalPages}
        </div>

        {/* Next Page Button */}
        <button
          type="button"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring/25 cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Last Page Button */}
        {showFirstLast && (
          <button
            type="button"
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Go to last page"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring/25 cursor-pointer"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Jump To Page Form */}
      {showJumpToPage && (
        <form
          onSubmit={handleJumpSubmit}
          className="flex items-center gap-2 order-3 w-full sm:w-auto justify-center"
        >
          <label htmlFor="jump-to-page" className="text-xs font-semibold text-muted-foreground">
            Go to
          </label>
          <input
            id="jump-to-page"
            type="number"
            min="1"
            max={totalPages}
            value={jumpInput}
            onChange={(e) => setJumpInput(e.target.value)}
            placeholder="No."
            className="w-12 text-center py-1 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
          <button
            type="submit"
            disabled={!jumpInput}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all duration-200 cursor-pointer"
          >
            Go
          </button>
        </form>
      )}
    </nav>
  );
};
