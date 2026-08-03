import { Search } from "lucide-react";
import { useEffect, useRef } from "react";

export default function HeaderSearch() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-sm group">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Search dashboard..."
        className="h-9.5 w-full rounded-xl border border-border bg-card/45 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Search dashboard"
      />
      <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-7 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-bold text-muted-foreground/80">
        <span className="text-xs">⌘ + K</span>
      </kbd>
    </div>
  );
}
