"use client";

import { Search, Bell, Sparkles, Sun, Moon, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/store/slices/uiStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function TopBar() {
  const { setTheme, theme } = useTheme();
  const { setCommandPaletteOpen, setAIDrawerOpen } = useUIStore();

  return (
    <header className="h-16 border-b border-border bg-white dark:bg-gray-900 flex items-center justify-between px-6 flex-shrink-0">
      {/* Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border border-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-64"
      >
        <Search size={15} />
        <span className="flex-1 text-left">Search or ask anything...</span>
        <kbd className="text-xs bg-muted px-1.5 py-0.5 rounded border text-muted-foreground">⌘K</kbd>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Create */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus size={15} />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem asChild>
              <Link href="/billing/new-invoice">🧾 Invoice</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing/new-expense">💸 Expense</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/inventory/new-product">📦 Product</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/billing/customers/new">👤 Customer</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* AI Assistant */}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
          onClick={() => setAIDrawerOpen(true)}
        >
          <Sparkles size={15} />
          <span className="hidden sm:inline">Ask AI</span>
          <Badge variant="secondary" className="text-2xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 hidden sm:flex">
            GPT-4o
          </Badge>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </Button>

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  );
}
