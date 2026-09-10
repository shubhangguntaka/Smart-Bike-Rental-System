import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Briefcase, Cpu, CheckCircle2, Code2 } from "lucide-react";
import type { TeamMember } from "@/constants/team";

interface TeamMemberModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TeamMemberModal({ member, isOpen, onClose }: TeamMemberModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!member) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-card/95 border border-border/80 rounded-2xl shadow-2xl overflow-hidden z-10 backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top decorative gradient bar */}
            <div
              className="h-2 w-full"
              style={{
                background:
                  member.innerGradient ||
                  "linear-gradient(90deg, #3b82f6, #06b6d4, #10b981)",
              }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              type="button"
              className="absolute top-4 right-4 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors focus:outline-none"
              aria-label="Close dialog"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Header: Avatar + Main Title */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-lg bg-muted/40">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/Shubhang.png";
                      }}
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-primary text-[10px] font-bold text-primary-foreground shadow">
                    {member.code}
                  </span>
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {member.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {member.status}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-primary flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground">@{member.handle}</p>
                </div>
              </div>

              {/* Module & Responsibilities Section */}
              <div className="space-y-2 bg-muted/20 border border-border/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Module: {member.module}</span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  {member.description}
                </p>
              </div>

              {/* Key Deliverables & Highlights from team.ts */}
              {member.highlights && member.highlights.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Key Module Deliverables</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    {member.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 bg-muted/10 p-2.5 rounded-lg border border-border/30 hover:border-primary/30 transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="text-foreground/90 font-medium">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies & Tools from team.ts */}
              {member.technologies && member.technologies.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Core Technologies</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {member.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
