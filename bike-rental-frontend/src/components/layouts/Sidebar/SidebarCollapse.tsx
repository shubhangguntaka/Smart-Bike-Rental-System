import { ChevronLeft, ChevronRight } from "lucide-react";

interface SidebarCollapseProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function SidebarCollapse({ collapsed, onToggle }: SidebarCollapseProps) {
  return (
    <button
      onClick={onToggle}
      className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-all duration-300 hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring shadow-sm"
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      {collapsed ? (
        <ChevronRight className="h-4.5 w-4.5" />
      ) : (
        <ChevronLeft className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
