"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import {
  LayoutDashboard, FileText, Package, Receipt,
  BarChart3, Sparkles, Plus, Settings, Users,
} from "lucide-react";
import { useUIStore } from "@/store/slices/uiStore";

const NAVIGATION = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Invoices", href: "/billing/invoices", icon: FileText },
  { label: "New Invoice", href: "/billing/new-invoice", icon: Plus },
  { label: "Products / Inventory", href: "/inventory/products", icon: Package },
  { label: "GST Reports", href: "/gst", icon: Receipt },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { label: "Customers", href: "/billing/customers", icon: Users },
  { label: "Settings", href: "/settings/profile", icon: Settings },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen, setAIDrawerOpen } = useUIStore();

  // ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [setCommandPaletteOpen]);

  const navigate = (href: string) => {
    router.push(href);
    setCommandPaletteOpen(false);
  };

  return (
    <CommandDialog open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen}>
      <CommandInput placeholder="Navigate, search, or ask AI anything..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="Navigation">
          {NAVIGATION.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => navigate(item.href)}
              className="cursor-pointer"
            >
              <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false);
              navigate("/billing/new-invoice");
            }}
          >
            <Plus className="mr-3 h-4 w-4 text-muted-foreground" />
            Create New Invoice
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setCommandPaletteOpen(false);
              setAIDrawerOpen(true);
            }}
          >
            <Sparkles className="mr-3 h-4 w-4 text-indigo-500" />
            Ask AI Assistant
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
