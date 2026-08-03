import { Link } from "react-router-dom";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterLinksProps {
  title: string;
  links: FooterLink[];
}

export default function FooterLinks({ title, links }: FooterLinksProps) {
  return (
    <div className="flex flex-col space-y-4">
      <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              to={link.href}
              className="text-sm font-semibold text-muted-foreground transition-all duration-300 hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}