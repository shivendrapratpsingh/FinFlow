"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await apiClient.get("/inventory/products?limit=100");
      return res.data;
    },
  });

  const products: any[] = data?.items ?? data ?? [];
  const filtered = products.filter((p: any) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Products & Inventory</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your products and stock levels</p>
        </div>
        <Link href="/inventory/new-product">
          <Button className="gap-2"><Plus size={16} /> Add Product</Button>
        </Link>
      </motion.div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search by name or SKU..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-medium">No products yet</p>
            <p className="text-sm mt-1">Add your first product to start managing inventory</p>
            <Link href="/inventory/new-product" className="mt-4">
              <Button size="sm" className="gap-2"><Plus size={14} /> Add Product</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-left text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">SKU</th>
                  <th className="px-6 py-3 font-medium">HSN/SAC</th>
                  <th className="px-6 py-3 font-medium">Selling Price</th>
                  <th className="px-6 py-3 font-medium">GST %</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p: any) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.description && <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.sku ?? "—"}</td>
                    <td className="px-6 py-4 text-muted-foreground">{p.hsn_sac_code ?? "—"}</td>
                    <td className="px-6 py-4 font-semibold">₹{Number(p.selling_price ?? 0).toLocaleString("en-IN")}</td>
                    <td className="px-6 py-4">{p.gst_rate ?? 0}%</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 ${(p.current_stock ?? 0) <= (p.reorder_point ?? 0) ? "text-red-500" : "text-emerald-600"}`}>
                        {(p.current_stock ?? 0) <= (p.reorder_point ?? 0) && <AlertTriangle size={13} />}
                        {p.current_stock ?? 0} {p.unit ?? "pcs"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
