"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function NavMount() {
  const pathname = usePathname();
  const hide = pathname?.startsWith("/login") || pathname?.startsWith("/register");
  if (hide) return null;
  return <NavBar />;
}

