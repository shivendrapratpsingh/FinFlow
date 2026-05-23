"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Package, BookOpen,
  BarChart3, Receipt, Sparkles, Settings, ChevronLeft,
  ChevronRight, Building2, LogOut, Bell, HelpCircle,
  PlusCircle, Users, ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/slices/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Billing",
    icon: FileText,
    badge: null,
    children: [
      { label: "Invoices", href: "/billing/invoices", icon: FileText },
      { label: "New Invoice", href: "/billing/new-invoice", icon: PlusCircle },
      { label: "Customers", href: "/billing/customers", icon: Users },
    ],
  },
  {
    label: "Inventory",
    icon: Package,
    children: [
      { label: "Products", href: "/inventory/products", icon: Package },
      { label: "Add Product", href: "/inventory/new-product", icon: PlusCircle },
      { label: "Purchase Orders", href: "/inventory/purchase-orders", icon: ShoppingCart },
    ],
  },
  {
    label: "Accounting",
    href: "/accounting",
    icon: BookOpen,
  },
  {
    label: "GST & Tax",
    href: "/gst",
    icon: Receipt,
  },
  {
    label: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "AI Assistant",
    href: "/ai-assistant",
    icon: Sparkles,
    badge: "AI",
  },
];

interface NavItemProps {
  item: typeof NAV_ITEMS[0];
  collapsed: boolean;
  depth?: number;
}

function NavItem({ item, collapsed, depth = 0 }: NavItemProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;
  const hasChildren = item.children && item.children.length > 0;

  const content = (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer group",
        isActive
          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
        depth > 0 && "ml-4 text-xs"
      )}
      onClick={() => hasChildren && setOpen(!open)}
    >
      <item.icon
        size={depth > 0 ? 15 : 18}
        className={cn(
          "flex-shrink-0",
          isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
        )}
      />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            className="flex-1 truncate"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && item.badge && (
        <Badge variant="secondary" className="text-2xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
          {item.badge}
        </Badge>
      )}
      {!collapsed && hasChildren && (
        <ChevronRight
          size={14}
          className={cn("transition-transform", open && "rotate-90")}
        />
      )}
    </div>
  );

  if (hasChildren) {
    return (
      <div>
        {content}
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-1 space-y-1">
                {item.children!.map((child) => (
                  <Link key={child.href} href={child.href}>
                    <NavItem item={child as any} collapsed={false} depth={1} />
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (collapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {item.href ? <Link href={item.href}>{content}</Link> : content}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return item.href ? <Link href={item.href}>{content}</Link> : content;
}


export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-border z-20 flex-shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border h-16">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white font-display text-lg">FinFlow</span>
            </motion.div>
          )}
        </AnimatePresence>
        {collapsed && (
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-6 h-6 rounded-full border border-border bg-white dark:bg-gray-800 flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm",
            collapsed && "absolute -right-3 top-6"
          )}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </div>

      {/* Business selector */}
      {!collapsed && (
        <div className="px-3 py-3 border-b border-border">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.full_name?.[0] ?? "B"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                My Business
              </p>
              <p className="text-xs text-muted-foreground truncate">Switch business</p>
            </div>
            <Building2 size={14} className="text-muted-foreground flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-border px-3 py-3 space-y-1">
        <NavItem
          item={{ label: "Settings", href: "/settings/profile", icon: Settings }}
          collapsed={collapsed}
        />
        <NavItem
          item={{ label: "Help", href: "/help", icon: HelpCircle }}
          collapsed={collapsed}
        />

        {/* User profile */}
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 mt-2"
          onClick={logout}
        >
          <Avatar className="w-7 h-7 flex-shrink-0">
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="text-xs bg-indigo-100 text-indigo-700">
              {user?.full_name?.[0] ?? "U"}
            </AvatarFallback>
          </Avatar>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.full_name ?? "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
          {!collapsed && <LogOut size={14} className="text-muted-foreground flex-shrink-0" />}
        </div>
      </div>
    </motion.aside>
  );
}
