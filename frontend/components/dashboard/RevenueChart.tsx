"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartPoint {
  label: string;
  value: number;
  secondary_value?: number;
}

interface RevenueChartProps {
  data: ChartPoint[];
  expenseData: ChartPoint[];
  isLoading: boolean;
}

const formatRupee = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
};

export function RevenueChart({ data, expenseData, isLoading }: RevenueChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full rounded-xl" />
        </CardContent>
      </Card>
    );
  }

  // Merge revenue + expense into single chart data
  const merged = data.map((d, i) => ({
    month: d.label,
    Revenue: d.value,
    Expenses: expenseData[i]?.value ?? 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Revenue vs Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={merged} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatRupee}
              tick={{ fontSize: 12, fill: "#9CA3AF" }}
              axisLine={false}
              tickLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString("en-IN")}`,
                name,
              ]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "13px", paddingTop: "16px" }}
            />
            <Area
              type="monotone"
              dataKey="Revenue"
              stroke="#6366F1"
              strokeWidth={2.5}
              fill="url(#revGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#6366F1" }}
            />
            <Area
              type="monotone"
              dataKey="Expenses"
              stroke="#EF4444"
              strokeWidth={2}
              fill="url(#expGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "#EF4444" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
