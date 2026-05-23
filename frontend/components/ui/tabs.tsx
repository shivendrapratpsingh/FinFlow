"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const TabsContext = React.createContext<{ active: string; setActive: (v: string) => void }>({ active: "", setActive: () => {} });

function Tabs({ defaultValue, value, onValueChange, children, className }: { defaultValue?: string; value?: string; onValueChange?: (v: string) => void; children: React.ReactNode; className?: string }) {
  const [internal, setInternal] = React.useState(defaultValue || "");
  const active = value ?? internal;
  const setActive = (v: string) => { setInternal(v); onValueChange?.(v); };
  return <TabsContext.Provider value={{ active, setActive }}><div className={className}>{children}</div></TabsContext.Provider>;
}

const TabsList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500", className)} {...props} />
);
TabsList.displayName = "TabsList";

function TabsTrigger({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active, setActive } = React.useContext(TabsContext);
  return (
    <button onClick={() => setActive(value)} className={cn("inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all", active === value ? "bg-white text-gray-900 shadow-sm" : "hover:bg-gray-200 hover:text-gray-900", className)}>
      {children}
    </button>
  );
}

function TabsContent({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const { active } = React.useContext(TabsContext);
  if (active !== value) return null;
  return <div className={cn("mt-2", className)}>{children}</div>;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
