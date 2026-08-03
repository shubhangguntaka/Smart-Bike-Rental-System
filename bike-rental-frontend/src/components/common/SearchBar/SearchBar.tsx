import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SearchBarProps {
  /**
   * Controlled value of the search input.
   */
  value?: string;
  /**
   * Callback fired when value changes (for controlled usage).
   */
  onChange?: (value: string) => void;
  /**
   * Uncontrolled default value of the search input.
   */
  defaultValue?: string;
  /**
   * Callback fired when a search is triggered (either debounced, on Enter, or on Search button click).
   */
  onSearch?: (value: string) => void;
  /**
   * Debounce delay in milliseconds. Fired only if onSearch is defined.
   * Set to 0 to disable debouncing.
   * @default 300
   */
  debounceMs?: number;
  /**
   * Input placeholder text.
   * @default "Search..."
   */
  placeholder?: string;
  /**
   * Puts the search bar in a loading state, showing a spinner.
   * @default false
   */
  loading?: boolean;
  /**
   * Disables the search bar.
   * @default false
   */
  disabled?: boolean;
  /**
   * Custom width class (e.g. "w-full", "max-w-md").
   * @default "w-full"
   */
  width?: string;
  /**
   * Custom CSS classes for the container element.
   */
  className?: string;
  /**
   * ARIA label for accessibility.
   * @default "Search inputs"
   */
  ariaLabel?: string;
  /**
   * Custom name for the input field.
   * @default "search"
   */
  name?: string;
}

export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value: controlledValue,
      onChange,
      defaultValue = "",
      onSearch,
      debounceMs = 300,
      placeholder = "Search...",
      loading = false,
      disabled = false,
      width = "w-full",
      className,
      ariaLabel = "Search input",
      name = "search",
    },
    ref
  ) => {
    const isControlled = controlledValue !== undefined;
    const [localValue, setLocalValue] = useState(isControlled ? controlledValue : defaultValue);
    const inputRef = useRef<HTMLInputElement | null>(null);

    // Keep track of latest onSearch callback to avoid unnecessary effect triggers
    const onSearchRef = useRef(onSearch);
    useEffect(() => {
      onSearchRef.current = onSearch;
    }, [onSearch]);

    // Keep local value in sync with controlled value changes
    useEffect(() => {
      if (isControlled) {
        setLocalValue(controlledValue);
      }
    }, [controlledValue, isControlled]);

    // Set up debounced search execution
    useEffect(() => {
      if (!onSearchRef.current || debounceMs <= 0) return;

      const handler = setTimeout(() => {
        onSearchRef.current?.(localValue);
      }, debounceMs);

      return () => {
        clearTimeout(handler);
      };
    }, [localValue, debounceMs]);

    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextValue = e.target.value;
        if (!isControlled) {
          setLocalValue(nextValue);
        }
        onChange?.(nextValue);
      },
      [isControlled, onChange]
    );

    const handleSearchSubmit = useCallback(() => {
      if (disabled || loading) return;
      onSearch?.(localValue);
    }, [localValue, onSearch, disabled, loading]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSearchSubmit();
        } else if (e.key === "Escape") {
          e.preventDefault();
          if (!isControlled) {
            setLocalValue("");
          }
          onChange?.("");
          onSearch?.("");
        }
      },
      [handleSearchSubmit, isControlled, onChange, onSearch]
    );

    const handleClear = useCallback(() => {
      if (disabled || loading) return;
      if (!isControlled) {
        setLocalValue("");
      }
      onChange?.("");
      onSearch?.("");
      
      // Keep focus on input after clear
      const input = (ref as React.RefObject<HTMLInputElement | null>)?.current || inputRef.current;
      if (input) {
        input.focus();
      }
    }, [isControlled, onChange, onSearch, disabled, loading, ref]);

    return (
      <div
        role="search"
        className={cn(
          "relative flex items-center rounded-2xl border border-border bg-card text-foreground transition-all duration-300",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/25",
          disabled && "cursor-not-allowed opacity-60 bg-muted/40",
          width,
          className
        )}
      >
        {/* Search Icon / Loading Spinner */}
        <div className="absolute left-4 flex items-center justify-center pointer-events-none text-muted-foreground">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Search className="h-5 w-5 transition-colors duration-200 group-focus-within:text-primary" />
          )}
        </div>

        {/* Text Input */}
        <input
          ref={(node) => {
            inputRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
            }
          }}
          type="text"
          name={name}
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-label={ariaLabel}
          className="w-full bg-transparent pl-12 pr-20 py-3 text-sm focus:outline-none placeholder:text-muted-foreground/60 text-foreground disabled:cursor-not-allowed"
        />

        {/* Action Area (Clear and Keyboard Hint / Submit) */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {localValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled || loading}
              aria-label="Clear search"
              className={cn(
                "p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors duration-200",
                "focus:outline-none focus:ring-2 focus:ring-ring/20 focus:bg-muted"
              )}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          <button
            type="button"
            onClick={handleSearchSubmit}
            disabled={disabled || loading}
            aria-label="Submit search"
            className={cn(
              "px-3 py-1.5 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 active:scale-95",
              "focus:outline-none focus:ring-2 focus:ring-ring/40",
              "disabled:pointer-events-none disabled:opacity-50"
            )}
          >
            Search
          </button>
        </div>
      </div>
    );
  }
);

SearchBar.displayName = "SearchBar";
