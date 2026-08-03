import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

export default function SocialLinks() {
  const socials = [
    {
      icon: Github,
      href: "https://github.com",
      label: "GitHub Account",
    },
    {
      icon: Linkedin,
      href: "https://linkedin.com",
      label: "LinkedIn Profile",
    },
    {
      icon: Twitter,
      href: "https://twitter.com",
      label: "Twitter Profile",
    },
    {
      icon: Instagram,
      href: "https://instagram.com",
      label: "Instagram Page",
    },
  ];

  return (
    <div className="flex gap-2">
      {socials.map((social) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={social.label}
          >
            <Icon className="h-4.5 w-4.5" />
          </a>
        );
      })}
    </div>
  );
}