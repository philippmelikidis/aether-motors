import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/emissions", label: "Emissions Data" },
  { href: "/contact", label: "Contact" },
];

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-surface">
      <div className="max-w-[1920px] mx-auto px-8 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Copyright */}
        <p className="font-label text-[10px] uppercase tracking-[0.1em] text-secondary/60">
          &copy; 2025 Aether Motors. Engineered for the Cloud.
        </p>

        {/* Links */}
        <div className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-label text-[10px] uppercase tracking-[0.1em] text-secondary/60 hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
