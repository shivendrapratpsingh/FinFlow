"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

const GST_RATES = [0, 5, 12, 18, 28];

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", sku: "", description: "", hsn_sac_code: "",
    selling_price: "", cost_price: "", gst_rate: "18",
    current_stock: "0", unit: "pcs", reorder_point: "10",
  });

  const set = (field: string, val: string) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.selling_price) {
      toast.error("Name and selling price are required");
      return;
    }
    setSaving(true);
    try {
      await apiClient.post("/inventory/products", {
        ...form,
        selling_price: parseFloat(form.selling_price),
        cost_price: form.cost_price ? parseFloat(form.cost_price) : null,
        gst_rate: parseFloat(form.gst_rate),
        current_stock: parseInt(form.current_stock),
        reorder_point: parseInt(form.reorder_point),
      });
      toast.success("Product added!");
      router.push("/inventory/products");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3">
        <Link href="/inventory/products">
          <Button variant="outline" size="sm" className="gap-1"><ArrowLeft size={14} /> Back</Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Add Product</h1>
          <p className="text-muted-foreground text-sm">Add a new product to your inventory</p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-5">
          <h3 className="font-semibold text-gray-900 border-b pb-3">Basic Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Product Name *</label>
              <Input className="mt-1" value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Office Chair" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">SKU</label>
              <Input className="mt-1" value={form.sku} onChange={e => set("sku", e.target.value)} placeholder="PROD-001" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <Input className="mt-1" value={form.unit} onChange={e => set("unit", e.target.value)} placeholder="pcs / kg / box" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <Input className="mt-1" value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." />
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 border-b pb-3 pt-2">Pricing & Tax</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Selling Price (₹) *</label>
              <Input className="mt-1" type="number" step="0.01" value={form.selling_price} onChange={e => set("selling_price", e.target.value)} placeholder="0.00" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Cost Price (₹)</label>
              <Input className="mt-1" type="number" step="0.01" value={form.cost_price} onChange={e => set("cost_price", e.target.value)} placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GST Rate</label>
              <select className="mt-1 w-full border border-input rounded-lg px-3 py-2 text-sm bg-background"
                value={form.gst_rate} onChange={e => set("gst_rate", e.target.value)}>
                {GST_RATES.map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">HSN/SAC Code</label>
              <Input className="mt-1" value={form.hsn_sac_code} onChange={e => set("hsn_sac_code", e.target.value)} placeholder="8471" />
            </div>
          </div>

          <h3 className="font-semibold text-gray-900 border-b pb-3 pt-2">Inventory</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Opening Stock</label>
              <Input className="mt-1" type="number" value={form.current_stock} onChange={e => set("current_stock", e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Reorder Point</label>
              <Input className="mt-1" type="number" value={form.reorder_point} onChange={e => set("reorder_point", e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="w-full gap-2" disabled={saving}>
            <Save size={16} /> {saving ? "Saving..." : "Add Product"}
          </Button>
        </Card>
      </form>
    </div>
  );
}
