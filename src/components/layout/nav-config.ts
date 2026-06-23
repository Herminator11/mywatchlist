import { Bookmark, Play, Check, Star, Search, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  short: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { href: "/watchlist/want-to-watch", label: "Want to Watch", short: "Watch", icon: Bookmark },
  { href: "/watchlist/currently-watching", label: "Currently Watching", short: "Watching", icon: Play },
  { href: "/watchlist/recently-watched", label: "Recently Watched", short: "Watched", icon: Check },
  { href: "/watchlist/favorites", label: "Favoriten", short: "Favoriten", icon: Star },
  { href: "/search", label: "Suche", short: "Suche", icon: Search },
  { href: "/settings", label: "Einstellungen", short: "Settings", icon: Settings },
];

// Untere Navigation (Mobile) zeigt nur die Kern-Listen + Suche.
export const mobileNavItems = navItems.filter((i) => i.href !== "/settings");
