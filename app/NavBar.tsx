"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const NavBar = () => {
  const currentPath = usePathname();
  const links = [
    { label: "Home", href: "/" },
    { label: "Manage", href: "/manageTv" },
  ];
  return (
    <div className="flex space-x-3 border mb-5 px-5 h-14 items-center">
      <div className="w-10 h-13">
        <Link href="/">
          <img src="/uploads/kymesonetLogo.webp" alt="Kymesonet Logo" />
        </Link>
      </div>
      <ul>
        {links.map((link) => (
          <Link
            key={link.href}
            className={`${link.href === currentPath? 'text-zinc-900':'text-zinc-500'} px-5 hover:text-zinc-800 transition-colors`}
            href={link.href}
          >
            {link.label}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default NavBar;
