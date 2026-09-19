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

  // Reactive breakpoint check for mobile (<1024px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 1023px)").matches;
  });

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1023px)");
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Transparent-on-top applies ONLY on desktop (>=1024px) in the Hero Section of the Home page.
  // On all mobile screens (<1024px), the navbar is ALWAYS non-transparent.
  const shouldBeTransparentOnTop = !isMobile && (transparentOnTop ?? isHomePage);

  useEffect(() => {
    if (!shouldBeTransparentOnTop) {
      setScrollProgress(1);
      return;
    }

    const handleScroll = () => {
      const heroEl = document.getElementById("hero-section");
      const heroHeight = heroEl ? heroEl.offsetHeight : window.innerHeight * 0.85;
      const scrollY = window.scrollY;

      // Navbar stays transparent in the top portion of the hero section on desktop.
      // As user scrolls down, it smoothly transitions to blurred solid.
      const startThreshold = heroHeight * 0.35;
      const endThreshold = heroHeight * 0.85;

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

  // Interpolated styles for seamless gradual transition on desktop only
  const headerStyle = shouldBeTransparentOnTop && !isMobile
    ? {
      backgroundColor:
        scrollProgress === 0
          ? "transparent"
          : `color-mix(in srgb, var(--color-background) ${Math.round(scrollProgress * 90)}%, transparent)`,
      backdropFilter: scrollProgress === 0 ? "none" : `blur(${Math.round(scrollProgress * 14)}px)`,
      WebkitBackdropFilter: scrollProgress === 0 ? "none" : `blur(${Math.round(scrollProgress * 14)}px)`,
      borderColor:
        scrollProgress === 0
          ? "transparent"
          : `color-mix(in srgb, var(--color-border) ${Math.round(scrollProgress * 80)}%, transparent)`,
      boxShadow:
        scrollProgress > 0.3
          ? `0 1px 3px 0 rgba(0, 0, 0, ${scrollProgress * 0.08})`
          : "none",
    }
    : undefined;

  const defaultClasses = shouldBeTransparentOnTop && !isMobile
    ? "border-b transition-colors duration-200"
    : "border-b border-border bg-background shadow-xs";

  return (
    <header
      style={headerStyle}
      className={`fixed top-0 left-0 right-0 z-50 w-full max-lg:!bg-background max-lg:!border-border max-lg:!shadow-xs ${defaultClasses}`}
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