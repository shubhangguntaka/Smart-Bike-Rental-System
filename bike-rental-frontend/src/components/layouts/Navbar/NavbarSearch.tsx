import { Search } from "lucide-react";

export default function NavbarSearch() {
  return (
    <div className="relative w-full group">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary"
      />
      <input
        type="search"
        placeholder="Search bikes..."
        className="h-10 w-full rounded-xl border border-border bg-card/50 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground transition-all duration-300 outline-none focus:bg-card focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
        aria-label="Search bikes"
      />
    </div>
  );
}