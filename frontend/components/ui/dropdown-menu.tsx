"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext<{ open: boolean; setOpen: (v: boolean) => void }>({ open: false, setOpen: () => {} });
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  return <DropdownMenuContext.Provider value={{ open, setOpen }}><div className="relative inline-block">{children}</div></DropdownMenuContext.Provider>;
};
const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const { open, setOpen } = React.useContext(DropdownMenuContext);
  return <div onClick={() => setOpen(!open)}>{children}</div>;
};
const DropdownMenuContent = ({ children, className, align }: { children: React.ReactNode; className?: string; align?: string }) => {
  const { open } = React.useContext(DropdownMenuContext);
  if (!open) return null;
  return <div className={cn("absolute z-50 right-0 mt-1 min-w-[10rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg", className)}>{children}</div>;
};
const DropdownMenuItem = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div onClick={onClick} className={cn("flex cursor-pointer items-center px-3 py-2 text-sm hover:bg-gray-100", className)}>{children}</div>
);
const DropdownMenuSeparator = ({ className }: { className?: string }) => <div className={cn("my-1 h-px bg-gray-100", className)} />;
const DropdownMenuLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("px-3 py-2 text-xs font-semibold text-gray-500", className)}>{children}</div>;
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuShortcut = ({ children, className }: { children: React.ReactNode; className?: string }) => <span className={cn("ml-auto text-xs text-gray-400", className)}>{children}</span>;
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuGroup, DropdownMenuShortcut };
