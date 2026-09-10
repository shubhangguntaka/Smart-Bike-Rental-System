import React, { useState } from "react";
import { TEAM_MEMBERS, type TeamMember } from "@/constants/team";
import InstituteCard from "./InstituteCard";
import TeamMemberCard from "./TeamMemberCard";
import TeamMemberModal from "./TeamMemberModal";
import { Users2, Building2 } from "lucide-react";

export default function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const handleOpenInfo = (member: TeamMember) => {
    setSelectedMember(member);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
  };

  return (
    <section className="py-24 bg-transparent relative overflow-hidden" id="team-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ================================================================= */}
        {/* 1. SECTION HEADER */}
        {/* ================================================================= */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
            <Users2 className="h-4 w-4" />
            <span>Development & Engineering</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Meet Our Core Developers
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            The Developer team behind the Smart Bike Rental System platform.
          </p>
        </div>

        {/* ================================================================= */}
        {/* 2. 5 TEAMMATES IN A SINGLE ROW */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5 justify-items-center w-full">
          {TEAM_MEMBERS.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              onInfoClick={handleOpenInfo}
            />
          ))}
        </div>

        {/* ================================================================= */}
        {/* 3. INSTITUTE CARD BELOW TEAMMATES */}
        {/* ================================================================= */}
        <div className="pt-8 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase backdrop-blur-md">
              <Building2 className="h-4 w-4" />
              <span>Academic Milestone</span>
            </div>
          </div>
          <InstituteCard />
        </div>

      </div>

      {/* Team Member Details Modal */}
      <TeamMemberModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={handleCloseModal}
      />
    </section>
  );
}
