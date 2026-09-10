import React from "react";
import type { TeamMember } from "@/constants/team";
import ProfileCard from "./ProfileCard";

interface TeamMemberCardProps {
  member: TeamMember;
  onInfoClick: (member: TeamMember) => void;
}

export default function TeamMemberCard({ member, onInfoClick }: TeamMemberCardProps) {
  return (
    <div className="flex justify-center w-full">
      <ProfileCard
        name={member.name}
        title={member.role}
        handle={member.handle}
        status={member.status}
        avatarUrl={member.avatarUrl}
        iconUrl="/iconpattern.png"
        behindGlowEnabled={true}
        behindGlowColor={member.behindGlowColor || "rgba(125, 190, 255, 0.67)"}
        behindGlowSize="50%"
        innerGradient={member.innerGradient || "linear-gradient(145deg,#60496e8c 0%,#71C4FF44 100%)"}
        contactText="Info"
        showUserInfo={true}
        enableTilt={true}
        enableMobileTilt={true}
        mobileTiltSensitivity={5}
        onContactClick={() => onInfoClick(member)}
      />
    </div>
  );
}
