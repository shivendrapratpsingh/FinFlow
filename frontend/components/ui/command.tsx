"use client";
import * as React from "react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-white", className)} {...props} />
));
Command.displayName = "Command";
const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("flex h-10 w-full border-b border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none", className)} {...props} />
));
CommandInput.displayName = "CommandInput";
const CommandList = ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={cn("max-h-[300px] overflow-y-auto", className)}>{children}</div>;
const CommandEmpty = ({ children }: { children: React.ReactNode }) => <div className="py-6 text-center text-sm text-gray-500">{children}</div>;
const CommandGroup = ({ children, heading, className }: { children: React.ReactNode; heading?: string; className?: string }) => (
  <div className={cn("p-1", className)}>{heading && <div className="px-2 py-1.5 text-xs font-semibold text-gray-500">{heading}</div>}{children}</div>
);
const CommandItem = ({ children, onSelect, className }: { children: React.ReactNode; onSelect?: () => void; className?: string }) => (
  <div onClick={onSelect} className={cn("flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-gray-100", className)}>{children}</div>
);
const CommandSeparator = ({ className }: { className?: string }) => <div className={cn("my-1 h-px bg-gray-100", className)} />;
interface CommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const CommandDialog = ({ open, onOpenChange, children }: CommandDialogProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-50 w-full max-w-lg rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
};
CommandDialog.displayName = "CommandDialog";

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandSeparator, CommandDialog };
