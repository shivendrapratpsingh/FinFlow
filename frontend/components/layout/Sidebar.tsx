"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, Package, BookOpen,
  BarChart3, Receipt, Sparkles, Settings, ChevronLeft,
  ChevronRight, Building2, LogOut, Bell, HelpCircle,
  PlusCircle, Users, ShoppingCart, Shield, Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/slices/authStore";
import { apiClient } from "@/lib/api";
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


const ADMIN_EMAIL = "pratapsinghshivendra21@gmail.com";

function RatingModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (r: number, c: string) => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"white",borderRadius:16,padding:"32px",width:360,boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <h2 style={{fontSize:20,fontWeight:700,color:"#111",marginBottom:4}}>Rate FinFlow</h2>
        <p style={{fontSize:14,color:"#6b7280",marginBottom:20}}>How was your experience? Your feedback helps us improve.</p>
        <div style={{display:"flex",gap:8,marginBottom:16,justifyContent:"center"}}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}
              style={{fontSize:36,background:"none",border:"none",cursor:"pointer",color:(hovered||rating)>=s?"#f59e0b":"#d1d5db",transition:"color 0.1s"}}>★</button>
          ))}
        </div>
        {rating > 0 && (
          <p style={{textAlign:"center",fontSize:13,color:"#6366f1",marginBottom:12,fontWeight:500}}>
            {["","Poor","Fair","Good","Very Good","Excellent!"][rating]}
          </p>
        )}
        <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Any comments? (optional)"
          style={{width:"100%",border:"1px solid #e5e7eb",borderRadius:8,padding:"10px 12px",fontSize:14,resize:"none",height:80,fontFamily:"inherit",boxSizing:"border-box"}} />
        <div style={{display:"flex",gap:8,marginTop:16}}>
          <button onClick={onClose} style={{flex:1,padding:"10px",border:"1px solid #e5e7eb",borderRadius:8,fontSize:14,cursor:"pointer",background:"white",color:"#374151"}}>Skip</button>
          <button onClick={() => onSubmit(rating, comment)} disabled={rating === 0}
            style={{flex:1,padding:"10px",border:"none",borderRadius:8,fontSize:14,cursor:rating===0?"not-allowed":"pointer",background:rating===0?"#e5e7eb":"#6366f1",color:rating===0?"#9ca3af":"white",fontWeight:600}}>
            Submit & Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const { user, logout, accessToken } = useAuthStore();

  const handleLogoutClick = () => setShowRating(true);

  const handleRatingSubmit = async (rating: number, comment: string) => {
    try {
      if (rating > 0) {
        await apiClient.post("/admin/rate", { rating, comment });
      }
    } catch {}
    setShowRating(false);
    logout();
  };

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
        {user?.email === ADMIN_EMAIL && (
          <NavItem item={{ label: "Admin Console", href: "/admin", icon: Shield }} collapsed={collapsed} />
        )}
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
          onClick={handleLogoutClick}
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
      {showRating && <RatingModal onClose={() => { setShowRating(false); logout(); }} onSubmit={handleRatingSubmit} />}
    </motion.aside>
  );
}
