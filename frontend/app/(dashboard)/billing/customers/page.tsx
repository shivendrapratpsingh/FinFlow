"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Search, Users, Phone, Mail } from "lucide-react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", gstin: "" });
  const [saving, setSaving] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const res = await apiClient.get("/billing/customers?limit=100");
      return res.data;
    },
  });

  const customers: any[] = data?.items ?? data ?? [];
  const filtered = customers.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      await apiClient.post("/billing/customers", form);
      setForm({ name: "", email: "", phone: "", gstin: "" });
      setShowForm(false);
      refetch();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Customers</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your customer directory</p>
        </div>
        <Button className="gap-2" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Customer
        </Button>
      </motion.div>

      {showForm && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4 text-gray-900">New Customer</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Name *</label>
              <Input className="mt-1" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Customer name" required />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input className="mt-1" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <Input className="mt-1" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">GSTIN</label>
              <Input className="mt-1" value={form.gstin} onChange={e => setForm({...form, gstin: e.target.value})} placeholder="27AABCF1234M1Z5" />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Customer"}</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input placeholder="Search customers..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <div className="p-6 space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-medium">No customers yet</p>
            <p className="text-sm mt-1">Add your first customer to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                    {c.name?.[0]?.toUpperCase() ?? "C"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  {c.gstin && <p className="text-xs text-muted-foreground">GSTIN: {c.gstin}</p>}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {c.email && <span className="flex items-center gap-1"><Mail size={13}/>{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-1"><Phone size={13}/>{c.phone}</span>}
                </div>
                <span className="text-sm font-semibold text-indigo-600">
                  ₹{Number(c.total_outstanding ?? 0).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
