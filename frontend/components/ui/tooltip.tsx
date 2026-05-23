"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const Tooltip = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return <TooltipContext.Provider value={{ open, setOpen }}><div className="relative inline-block">{children}</div></TooltipContext.Provider>;
};
const TooltipTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = React.useContext(TooltipContext);
  return <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>{children}</div>;
};
const TooltipContent = ({ children, className, side }: { children: React.ReactNode; className?: string; side?: string }) => {
  const { open } = React.useContext(TooltipContext);
  if (!open) return null;
  return <div className={cn("absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1 rounded-md bg-gray-900 px-2 py-1 text-xs text-white whitespace-nowrap", className)}>{children}</div>;
};
export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
