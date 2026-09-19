import type { TeamMember } from "@/constants/team";
import { Github, Linkedin, ArrowUpRight, Cpu } from "lucide-react";

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({ member }: TeamCardProps) {
  return (
    <div className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-card/80 backdrop-blur-md border border-border/80 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-left overflow-hidden">
      
      {/* Subtle background glow on hover */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="space-y-4">
        {/* Profile Avatar & Module Code Header */}
        <div className="flex items-center justify-between">
          <div className="relative">
            {/* Cyber Avatar Shield */}
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary/20 via-cyan-500/20 to-emerald-500/20 p-1 shadow-sm group-hover:shadow-primary/20 transition-all">
              <div className="h-full w-full rounded-2xl bg-muted/80 flex items-center justify-center font-mono font-extrabold text-lg text-primary">
                {member.avatarPlaceholder || member.name.charAt(0)}
              </div>
            </div>
            {/* Live Indicator Dot */}
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-card" />
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-muted-foreground bg-muted/60 px-3 py-1 rounded-lg border border-border/60">
              <Cpu className="h-3 w-3 text-primary" />
              <span>{member.code}</span>
            </span>
          </div>
        </div>

        {/* Member Name & Role */}
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
            {member.name}
          </h3>
          <p className="text-xs font-semibold text-primary uppercase tracking-wide">
            {member.role}
          </p>
          <p className="text-[11px] font-mono text-muted-foreground">
            {member.module}
          </p>
        </div>

        {/* Responsibility Description */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {member.description}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2 pt-1">
          {(member.tags || member.technologies || []).map((tag: string, tIdx: number) => (
            <span
              key={tIdx}
              className="text-[10px] font-medium px-2 py-1 rounded-md bg-muted/70 text-foreground/80 border border-border/50"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Links (GitHub / LinkedIn) */}
      <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {member.github && (
            <a
              href={member.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`${member.name} GitHub`}
            >
              <Github className="h-4 w-4" />
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label={`${member.name} LinkedIn`}
            >
              <Linkedin className="h-4 w-4" />
            </a>
          )}
        </div>

        <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary flex items-center gap-1 transition-colors">
          <span>Module Details</span>
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

    </div>
  );
}
