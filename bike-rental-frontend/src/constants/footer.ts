import type { FooterSection } from "./layout";


export const FOOTER_LINKS: FooterSection[] = [
  {
    title: "Quick Links",
    links: [
      {
        label: "Home",
        href: "/",
      },
      {
        label: "Bikes",
        href: "/bikes",
      },
      {
        label: "Pricing",
        href: "/pricing",
      },
    ],
  },
  {
    title: "Company",
    links: [
      {
        label: "About",
        href: "/about",
      },
      {
        label: "Contact",
        href: "/contact",
      },
      {
        label: "FAQ",
        href: "/faq",
      },
    ],
  },
  {
    title: "Support",
    links: [
      {
        label: "Help Center",
        href: "/help",
      },
      {
        label: "Privacy Policy",
        href: "/privacy",
      },
      {
        label: "Terms & Conditions",
        href: "/terms",
      },
    ],
  },
];