"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, onCheckedChange, ...props }, ref) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className="sr-only peer"
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
      <div
        className={cn(
          "w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-indigo-500 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600",
          className
        )}
      />
    </label>
  )
);
Switch.displayName = "Switch";
export { Switch };
