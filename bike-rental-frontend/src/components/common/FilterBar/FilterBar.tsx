import React, { useState, useRef, useEffect } from "react";
import { Filter, X, SlidersHorizontal, ChevronDown, Check, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

export interface FilterOption {
  label: string;
  value: string;
}

export type FilterFieldType = "select" | "checkbox" | "radio" | "range" | "boolean";

export interface FilterField {
  id: string;
  label: string;
  type: FilterFieldType;
  options?: FilterOption[]; // Required for select, checkbox, radio
  min?: number; // Required for range
  max?: number; // Required for range
  step?: number; // Optional for range
  placeholder?: string; // Optional for select
}

export interface FilterBarProps {
  /**
   * Array of filter field configurations.
   */
  filters: FilterField[];
  /**
   * Selected filter values, e.g., { availability: true, type: "electric", priceRange: [100, 500] }
   */
  value: Record<string, any>;
  /**
   * Callback triggered whenever any filter changes.
   */
  onChange: (value: Record<string, any>) => void;
  /**
   * Callback triggered when filters are cleared.
   */
  onClearAll?: () => void;
  /**
   * Custom Tailwind classes for the outer container.
   */
  className?: string;
  /**
   * Label for the filter button.
   * @default "Filters"
   */
  label?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  value,
  onChange,
  onClearAll,
  className,
  label = "Filters",
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const desktopContainerRef = useRef<HTMLDivElement>(null);

  // Close active dropdown if user clicks outside of container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopContainerRef.current &&
        !desktopContainerRef.current.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFieldChange = (fieldId: string, fieldValue: any) => {
    const newValue = { ...value, [fieldId]: fieldValue };
    
    // Remove field if it becomes empty or null
    if (
      fieldValue === undefined ||
      fieldValue === null ||
      fieldValue === "" ||
      (Array.isArray(fieldValue) && fieldValue.length === 0)
    ) {
      delete newValue[fieldId];
    }
    onChange(newValue);
  };

  const handleClearField = (fieldId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    const newValue = { ...value };
    delete newValue[fieldId];
    onChange(newValue);
  };

  const handleResetAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      onChange({});
    }
    setActiveDropdown(null);
    setIsMobileOpen(false);
  };

  // Helper to count active filters
  const activeFiltersCount = Object.keys(value).length;

  return (
    <div className={cn("w-full", className)}>
      {/* ========================================================================= */}
      {/* DESKTOP FILTER BAR                                                        */}
      {/* ========================================================================= */}
      <div
        ref={desktopContainerRef}
        className="hidden md:flex items-center justify-between gap-4 py-3 px-4 rounded-2xl border border-border bg-card shadow-sm text-foreground"
      >
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 pr-3 border-r border-border text-foreground font-semibold text-sm">
            <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
            <span>{label}</span>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {/* Render Filters dynamically */}
          {filters.map((filter) => {
            const isDropdownOpen = activeDropdown === filter.id;
            const hasValue = value[filter.id] !== undefined;

            return (
              <div key={filter.id} className="relative">
                <button
                  type="button"
                  onClick={() => setActiveDropdown(isDropdownOpen ? null : filter.id)}
                  aria-expanded={isDropdownOpen}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background text-xs font-semibold hover:bg-muted/50 transition-all duration-200 cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-ring/25",
                    hasValue && "border-primary bg-primary/10 text-primary hover:bg-primary/20",
                    isDropdownOpen && "border-primary ring-2 ring-ring/20 bg-muted/30"
                  )}
                >
                  <span>{filter.label}</span>
                  {hasValue && filter.type !== "boolean" && (
                    <span className="max-w-[100px] truncate font-bold text-primary">
                      {filter.type === "checkbox" && Array.isArray(value[filter.id])
                        ? `: ${value[filter.id].length}`
                        : filter.type === "range"
                        ? `: ${value[filter.id][0]}-${value[filter.id][1]}`
                        : `: ${value[filter.id]}`}
                    </span>
                  )}
                  {hasValue && filter.type === "boolean" && <Check className="h-3 w-3 text-primary stroke-[3]" />}
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                      isDropdownOpen && "transform rotate-180 text-primary"
                    )}
                  />
                </button>

                {/* Dropdown Menu Overlay */}
                {isDropdownOpen && (
                  <div
                    className="absolute left-0 mt-2 z-50 min-w-[240px] max-w-sm rounded-2xl border border-border bg-card p-4 shadow-xl text-foreground focus:outline-none"
                  >
                      {/* Dropdown Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
                        <span className="text-xs font-bold text-muted-foreground">{filter.label}</span>
                        {hasValue && (
                          <button
                            onClick={(e) => handleClearField(filter.id, e)}
                            className="text-[10px] font-bold text-destructive hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Dropdown Inputs based on Type */}
                      {filter.type === "select" && (
                        <div className="space-y-1">
                          {filter.options?.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                handleFieldChange(filter.id, opt.value);
                                setActiveDropdown(null);
                              }}
                              className={cn(
                                "w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium hover:bg-muted/70 transition-colors duration-150 cursor-pointer",
                                value[filter.id] === opt.value && "text-primary bg-primary/5 font-semibold"
                              )}
                            >
                              <span>{opt.label}</span>
                              {value[filter.id] === opt.value && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                            </button>
                          ))}
                        </div>
                      )}

                      {filter.type === "radio" && (
                        <div className="space-y-1.5">
                          {filter.options?.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2 px-1 py-0.5 text-xs font-medium text-foreground cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={filter.id}
                                value={opt.value}
                                checked={value[filter.id] === opt.value}
                                onChange={() => handleFieldChange(filter.id, opt.value)}
                                className="h-3.5 w-3.5 text-primary border-border focus:ring-ring bg-background cursor-pointer"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {filter.type === "checkbox" && (
                        <div className="space-y-1.5 max-h-48 overflow-y-auto">
                          {filter.options?.map((opt) => {
                            const currentList = Array.isArray(value[filter.id]) ? value[filter.id] : [];
                            const isChecked = currentList.includes(opt.value);

                            return (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2 px-1 py-0.5 text-xs font-medium text-foreground cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={opt.value}
                                  checked={isChecked}
                                  onChange={() => {
                                    const nextList = isChecked
                                      ? currentList.filter((v: string) => v !== opt.value)
                                      : [...currentList, opt.value];
                                    handleFieldChange(filter.id, nextList);
                                  }}
                                  className="rounded h-3.5 w-3.5 text-primary border-border focus:ring-ring bg-background cursor-pointer"
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {filter.type === "boolean" && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">Enable active filter</span>
                          <button
                            type="button"
                            onClick={() => {
                              handleFieldChange(filter.id, value[filter.id] ? undefined : true);
                              setActiveDropdown(null);
                            }}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background cursor-pointer",
                              value[filter.id] && "bg-primary text-primary-foreground border-primary"
                            )}
                          >
                            {value[filter.id] ? "Active" : "Inactive"}
                          </button>
                        </div>
                      )}

                      {filter.type === "range" && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between text-[11px] font-bold text-muted-foreground">
                            <span>Min: {Array.isArray(value[filter.id]) ? value[filter.id][0] : (filter.min ?? 0)}</span>
                            <span>Max: {Array.isArray(value[filter.id]) ? value[filter.id][1] : (filter.max ?? 1000)}</span>
                          </div>
                          <div className="space-y-2">
                            <input
                              type="range"
                              min={filter.min ?? 0}
                              max={filter.max ?? 1000}
                              step={filter.step ?? 10}
                              value={Array.isArray(value[filter.id]) ? value[filter.id][0] : (filter.min ?? 0)}
                              onChange={(e) => {
                                const currentVal = Array.isArray(value[filter.id]) ? value[filter.id] : [filter.min ?? 0, filter.max ?? 1000];
                                const nextMin = Math.min(Number(e.target.value), currentVal[1]);
                                handleFieldChange(filter.id, [nextMin, currentVal[1]]);
                              }}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input
                              type="range"
                              min={filter.min ?? 0}
                              max={filter.max ?? 1000}
                              step={filter.step ?? 10}
                              value={Array.isArray(value[filter.id]) ? value[filter.id][1] : (filter.max ?? 1000)}
                              onChange={(e) => {
                                const currentVal = Array.isArray(value[filter.id]) ? value[filter.id] : [filter.min ?? 0, filter.max ?? 1000];
                                const nextMax = Math.max(Number(e.target.value), currentVal[0]);
                                handleFieldChange(filter.id, [currentVal[0], nextMax]);
                              }}
                              className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/5 border border-transparent transition-all duration-200 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE TRIGGER                                                            */}
      {/* ========================================================================= */}
      <div className="md:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm shadow-sm cursor-pointer"
        >
          <Filter className="h-4.5 w-4.5 text-primary" />
          <span>{label}</span>
          {activeFiltersCount > 0 && (
            <span className="flex items-center justify-center h-5 px-1.5 rounded-full text-xs bg-primary text-primary-foreground font-bold">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={handleResetAll}
            aria-label="Reset all filters"
            className="p-3 rounded-2xl border border-border bg-card text-destructive flex items-center justify-center shadow-sm cursor-pointer"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MOBILE FULLSCREEN OVERLAY/DRAWER                                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-card border-l border-border flex flex-col shadow-2xl text-foreground"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border">
                <div className="flex items-center gap-2 font-bold text-base">
                  <Filter className="h-5 w-5 text-primary" />
                  <span>{label}</span>
                  {activeFiltersCount > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full text-[10px] bg-primary text-primary-foreground font-bold">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {filters.map((filter) => {
                  const hasValue = value[filter.id] !== undefined;

                  return (
                    <div key={filter.id} className="space-y-2 border-b border-border pb-4 last:border-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-foreground">{filter.label}</span>
                        {hasValue && (
                          <button
                            onClick={() => handleClearField(filter.id)}
                            className="text-xs font-bold text-destructive hover:underline cursor-pointer"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* Render appropriate input fields on mobile */}
                      {filter.type === "select" && (
                        <select
                          value={value[filter.id] || ""}
                          onChange={(e) => handleFieldChange(filter.id, e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary text-foreground"
                        >
                          <option value="">{filter.placeholder || "Select option..."}</option>
                          {filter.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      )}

                      {filter.type === "radio" && (
                        <div className="space-y-2.5">
                          {filter.options?.map((opt) => (
                            <label
                              key={opt.value}
                              className="flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                            >
                              <input
                                type="radio"
                                name={`mobile-${filter.id}`}
                                value={opt.value}
                                checked={value[filter.id] === opt.value}
                                onChange={() => handleFieldChange(filter.id, opt.value)}
                                className="h-4 w-4 text-primary border-border focus:ring-ring bg-background cursor-pointer"
                              />
                              <span>{opt.label}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {filter.type === "checkbox" && (
                        <div className="space-y-2.5">
                          {filter.options?.map((opt) => {
                            const currentList = Array.isArray(value[filter.id]) ? value[filter.id] : [];
                            const isChecked = currentList.includes(opt.value);

                            return (
                              <label
                                key={opt.value}
                                className="flex items-center gap-2.5 text-xs font-medium cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  value={opt.value}
                                  checked={isChecked}
                                  onChange={() => {
                                    const nextList = isChecked
                                      ? currentList.filter((v: string) => v !== opt.value)
                                      : [...currentList, opt.value];
                                    handleFieldChange(filter.id, nextList);
                                  }}
                                  className="rounded h-4 w-4 text-primary border-border focus:ring-ring bg-background cursor-pointer"
                                />
                                <span>{opt.label}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {filter.type === "boolean" && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">Toggle filter</span>
                          <button
                            type="button"
                            onClick={() => handleFieldChange(filter.id, value[filter.id] ? undefined : true)}
                            className={cn(
                              "px-3 py-1.5 text-xs font-semibold rounded-lg border border-border bg-background cursor-pointer",
                              value[filter.id] && "bg-primary text-primary-foreground border-primary"
                            )}
                          >
                            {value[filter.id] ? "Active" : "Inactive"}
                          </button>
                        </div>
                      )}

                      {filter.type === "range" && (
                        <div className="space-y-3.5 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                            <span>Min: {Array.isArray(value[filter.id]) ? value[filter.id][0] : (filter.min ?? 0)}</span>
                            <span>Max: {Array.isArray(value[filter.id]) ? value[filter.id][1] : (filter.max ?? 1000)}</span>
                          </div>
                          <div className="space-y-3.5">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground">Minimum Range</span>
                              <input
                                type="range"
                                min={filter.min ?? 0}
                                max={filter.max ?? 1000}
                                step={filter.step ?? 10}
                                value={Array.isArray(value[filter.id]) ? value[filter.id][0] : (filter.min ?? 0)}
                                onChange={(e) => {
                                  const currentVal = Array.isArray(value[filter.id]) ? value[filter.id] : [filter.min ?? 0, filter.max ?? 1000];
                                  const nextMin = Math.min(Number(e.target.value), currentVal[1]);
                                  handleFieldChange(filter.id, [nextMin, currentVal[1]]);
                                }}
                                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-muted-foreground">Maximum Range</span>
                              <input
                                type="range"
                                min={filter.min ?? 0}
                                max={filter.max ?? 1000}
                                step={filter.step ?? 10}
                                value={Array.isArray(value[filter.id]) ? value[filter.id][1] : (filter.max ?? 1000)}
                                onChange={(e) => {
                                  const currentVal = Array.isArray(value[filter.id]) ? value[filter.id] : [filter.min ?? 0, filter.max ?? 1000];
                                  const nextMax = Math.max(Number(e.target.value), currentVal[0]);
                                  handleFieldChange(filter.id, [currentVal[0], nextMax]);
                                }}
                                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-4 border-t border-border bg-card/50 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetAll}
                  disabled={activeFiltersCount === 0}
                  className="flex-1 py-3 border border-border hover:bg-muted text-xs font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="flex-1 py-3 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:opacity-90 transition-all duration-200 cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
