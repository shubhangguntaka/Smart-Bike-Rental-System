import React from "react";
import { INSTITUTE_DATA } from "@/constants/team";
import TiltedCard from "./TiltedCard";

export default function InstituteCard() {
  const overlay = (
    <div className="space-y-1 text-left bg-background/85 dark:bg-slate-900/90 p-3 sm:p-4 rounded-xl border border-border/60 shadow-lg pointer-events-auto">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-foreground tracking-tight">
        {INSTITUTE_DATA.name}
      </h3>
      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
        {INSTITUTE_DATA.description}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-cyan-500/15 to-emerald-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition duration-500 pointer-events-none" />

        <div className="relative">
          <TiltedCard
            imageSrc={INSTITUTE_DATA.imageSrc}
            altText={INSTITUTE_DATA.altText}
            captionText={INSTITUTE_DATA.name}
            containerHeight="240px"
            containerWidth="100%"
            imageHeight="240px"
            imageWidth="100%"
            imageFit="contain"
            cardClassName="bg-white dark:bg-slate-950"
            scaleOnHover={1.03}
            rotateAmplitude={10}
            showTooltip={true}
            showMobileWarning={false}
            displayOverlayContent={true}
            // overlayContent={overlay}
          />
        </div>
      </div>
    </div>
  );
}
