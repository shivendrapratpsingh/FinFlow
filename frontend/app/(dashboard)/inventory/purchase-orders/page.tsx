"use client";

import { motion } from "framer-motion";
import { ShoppingCart, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900">Purchase Orders</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track orders from your suppliers</p>
        </div>
        <Button className="gap-2"><Plus size={16} /> New PO</Button>
      </motion.div>
      <Card className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <ShoppingCart className="h-14 w-14 mb-4 opacity-20" />
        <p className="text-lg font-medium text-gray-700">No purchase orders yet</p>
        <p className="text-sm mt-1">Create a purchase order to track supplier orders</p>
        <Button className="mt-5 gap-2"><Plus size={14} /> Create Purchase Order</Button>
      </Card>
    </div>
  );
}
