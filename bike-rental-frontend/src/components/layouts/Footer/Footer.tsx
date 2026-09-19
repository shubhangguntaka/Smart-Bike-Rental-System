import { Bike } from "lucide-react";
import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "@/constants/footer";
import FooterLinks from "./FooterLinks";
import SocialLinks from "./SocialLinks";
import FooterBottom from "./FooterBottom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background/50 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Brand details */}
          <div className="space-y-5 text-left md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 outline-none rounded-xl group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow">
                <Bike className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                Smart Bike
              </span>
            </Link>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Experience the future of urban transport with smart, GPS-tracked electric bike rentals. Simple, green, and affordable.
            </p>

            <div className="pt-2">
              <SocialLinks />
            </div>
          </div>

          {/* Columns 2, 3, 4: Link sections mapped dynamically from constants */}
          {FOOTER_LINKS.map((section) => (
            <div key={section.title} className="text-left">
              <FooterLinks title={section.title} links={section.links} />
            </div>
          ))}
        </div>

        {/* Bottom panel with newsletter and copyright */}
        <FooterBottom />
      </div>
    </footer>
  );
}