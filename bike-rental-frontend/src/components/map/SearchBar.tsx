import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSearch?: (value: string) => void;
}

export default function SearchBar({
  value,
  onChange,
  onLocationSearch,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim()) return;

    onLocationSearch?.(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center"
    >
      <div className="relative w-full">

        <Search
          size={20}
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            text-muted-foreground
          "
        />

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search bikes or locations..."
          className="
            h-12
            w-full
            rounded-xl
            border
            border-border
            bg-background
            pl-10
            pr-4
            text-sm
            text-foreground
            outline-none
            transition
            placeholder:text-muted-foreground
            focus:border-primary
            focus:ring-2
            focus:ring-primary/20
          "
        />

      </div>
    </form>
  );
}