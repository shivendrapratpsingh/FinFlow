"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

const Select = ({ children, value, onValueChange, defaultValue }: { children: React.ReactNode; value?: string; onValueChange?: (v: string) => void; defaultValue?: string }) => {
  const [internal, setInternal] = React.useState(defaultValue || "");
  return <SelectContext.Provider value={{ value: value ?? internal, onChange: (v) => { setInternal(v); onValueChange?.(v); } }}>{children}</SelectContext.Provider>;
};
const SelectContext = React.createContext<{ value: string; onChange: (v: string) => void }>({ value: "", onChange: () => {} });
const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(({ className, children, ...props }, ref) => (
  <button ref={ref} className={cn("flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500", className)} {...props}>{children}</button>
));
SelectTrigger.displayName = "SelectTrigger";
const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  const { value } = React.useContext(SelectContext);
  return <span className={value ? "text-gray-900" : "text-gray-400"}>{value || placeholder}</span>;
};
const SelectContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white shadow-md", className)}>{children}</div>
);
const SelectItem = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => {
  const { onChange } = React.useContext(SelectContext);
  return <div onClick={() => onChange(value)} className={cn("relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100", className)}>{children}</div>;
};
const SelectGroup = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const SelectLabel = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("px-2 py-1.5 text-xs font-semibold text-gray-500", className)}>{children}</div>;
export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel };
