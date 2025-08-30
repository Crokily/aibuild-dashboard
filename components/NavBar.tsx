"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LineChart, Upload, LayoutDashboard, LogOut, LogIn, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ElementType } from "react";

const NavLink = ({ href, label, icon: Icon }: { href: string; label: string; icon: ElementType }) => {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
};

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-secondary/90 backdrop-blur supports-[backdrop-filter]:bg-secondary/70 shadow-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span>AIBUILD</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavLink href="/upload" label="Import Data" icon={Upload} />
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {status === "authenticated" ? (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{session?.user?.name || session?.user?.email || "User"}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => signIn()} className="cursor-pointer">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
