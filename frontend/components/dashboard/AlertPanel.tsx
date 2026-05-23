"use client";

import { AlertTriangle, Info, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Alert {
  type: "warning" | "info" | "danger" | "success";
  title: string;
  message: string;
  action_label?: string;
  action_url?: string;
}

const ICON_MAP = {
  warning: AlertTriangle,
  info: Info,
  danger: XCircle,
  success: CheckCircle,
};

const COLOR_MAP = {
  warning: "text-amber-600 bg-amber-50 dark:bg-amber-950",
  info: "text-blue-600 bg-blue-50 dark:bg-blue-950",
  danger: "text-red-600 bg-red-50 dark:bg-red-950",
  success: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950",
};

interface AlertPanelProps {
  alerts: Alert[];
  isLoading: boolean;
}

export function AlertPanel({ alerts, isLoading }: AlertPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          Alerts
          {alerts.filter(a => a.type === "danger" || a.type === "warning").length > 0 && (
            <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5">
              {alerts.filter(a => a.type === "danger" || a.type === "warning").length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">All clear! No alerts.</p>
          </div>
        ) : (
          alerts.map((alert, i) => {
            const Icon = ICON_MAP[alert.type];
            const colorClass = COLOR_MAP[alert.type];
            return (
              <div key={i} className={cn("flex gap-3 p-3 rounded-xl", colorClass)}>
                <Icon size={16} className="mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs opacity-80 mt-0.5 line-clamp-2">{alert.message}</p>
                  {alert.action_label && alert.action_url && (
                    <Link
                      href={alert.action_url}
                      className="text-xs font-medium flex items-center gap-1 mt-1.5 hover:underline"
                    >
                      {alert.action_label}
                      <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
