"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { href: "/configurator", label: "Configurator" },
  { href: "/merchandise", label: "Merchandise" },
  { href: "/gallery", label: "Gallery" },
  { href: "/roadmap", label: "Roadmap" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#121314]/80 backdrop-blur-xl shadow-lg">
      <div className="max-w-[1920px] mx-auto px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-black tracking-tighter text-primary font-headline uppercase"
        >
          Aether Motors
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "font-headline font-bold tracking-tight uppercase text-sm transition-colors",
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-secondary hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            className="relative w-10 h-10 flex items-center justify-center text-white hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary-container text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </button>
          <button className="w-10 h-10 flex items-center justify-center text-white hover:text-primary transition-colors">
            <span className="material-symbols-outlined">account_circle</span>
          </button>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center text-white hover:text-primary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-white/5 bg-[#121314]/95 backdrop-blur-xl px-8 py-4 flex flex-col gap-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "font-headline font-bold tracking-tight uppercase text-sm transition-colors",
                  isActive
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-secondary hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
