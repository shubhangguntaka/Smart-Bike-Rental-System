import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import NavbarLogo from "./NavbarLogo";
import NavbarActions from "./NavbarActions";
import NavbarLinks from "./NavbarLinks";

interface NavbarProps {
  transparentOnTop?: boolean;
}

export default function Navbar({ transparentOnTop }: NavbarProps) {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0); // 0 = fully transparent, 1 = fully blurred

  const isHomePage = location.pathname === "/";
  const shouldBeTransparentOnTop = transparentOnTop ?? isHomePage;

  useEffect(() => {
    if (!shouldBeTransparentOnTop) {
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const heroEl = document.getElementById("hero-section");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight * 0.85;
      const scrollY = window.scrollY;

      // Navbar stays 100% transparent through most of the hero section.
      // As the user scrolls toward the bottom of the hero section, it slowly and smoothly blurs.
      const startThreshold = heroHeight * 0.55;
      const endThreshold = heroHeight * 0.92;

      if (scrollY <= startThreshold) {
        setScrollProgress(0);
      } else if (scrollY >= endThreshold) {
        setScrollProgress(1);
      } else {
        const progress = (scrollY - startThreshold) / (endThreshold - startThreshold);
        setScrollProgress(progress);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [shouldBeTransparentOnTop]);

  // Interpolated styles for seamless gradual transition as user scrolls past hero section
  const headerStyle = shouldBeTransparentOnTop
    ? {
        backgroundColor:
          scrollProgress === 0
            ? "transparent"
            : `color-mix(in srgb, var(--color-background) ${Math.round(scrollProgress * 85)}%, transparent)`,
        backdropFilter: scrollProgress === 0 ? "none" : `blur(${Math.round(scrollProgress * 14)}px)`,
        WebkitBackdropFilter: scrollProgress === 0 ? "none" : `blur(${Math.round(scrollProgress * 14)}px)`,
        borderColor:
          scrollProgress === 0
            ? "transparent"
            : `color-mix(in srgb, var(--color-border) ${Math.round(scrollProgress * 75)}%, transparent)`,
        boxShadow:
          scrollProgress > 0.4
            ? `0 1px 3px 0 rgba(0, 0, 0, ${scrollProgress * 0.1})`
            : "none",
      }
    : undefined;

  const defaultClasses = shouldBeTransparentOnTop
    ? "border-b transition-colors duration-200"
    : "border-b border-border/80 bg-background/85 backdrop-blur-md shadow-sm";

  return (
    <header
      style={headerStyle}
      className={`sticky top-0 z-45 w-full ${defaultClasses}`}
    >
      <div className="mx-auto flex h-16 max-w-8xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Branding Logo */}
        <div className="flex-shrink-0">
          <NavbarLogo />
        </div>

        {/* Center Public Navigation Links */}
        <NavbarLinks />

        {/* Right Actions Toggles & Buttons */}
        <NavbarActions />
      </div>
    </header>
  );
}