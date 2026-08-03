import type { LucideIcon } from "lucide-react";
import SidebarItem from "./SidebarItem";

interface SidebarSectionProps {
  section: {
    id: string;
    title?: string;
    items: {
      label: string;
      path: string;
      icon: LucideIcon;
    }[];
  };
  collapsed: boolean;
  onNavigate?: () => void;
}

export default function SidebarSection({ section, collapsed, onNavigate }: SidebarSectionProps) {
  return (
    <div className="space-y-1.5">
      {/* Title only when expanded */}
      {!collapsed && section.title && (
        <h3 className="px-3.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-2">
          {section.title}
        </h3>
      )}

      <div className="space-y-1">
        {section.items.map((item) => (
          <SidebarItem
            key={item.path}
            item={item}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}