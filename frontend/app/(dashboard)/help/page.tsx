"use client";

import { motion } from "framer-motion";
import { HelpCircle, BookOpen, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/slices/uiStore";

const FAQS = [
  { q: "How do I create a GST invoice?", a: "Go to Billing → New Invoice. Fill in customer details, add line items, and FinFlow automatically calculates CGST/SGST/IGST based on GST rates." },
  { q: "How do I add products to inventory?", a: "Go to Inventory → Products → Add Product. Set the HSN/SAC code and GST rate, and the product will be available when creating invoices." },
  { q: "Where can I see my GST liability?", a: "Go to GST & Tax page. It shows your output GST (collected), input GST (paid), and net payable amount." },
  { q: "Can I export my invoices?", a: "Yes — on the Invoices page, click the download icon next to any invoice to export it as PDF." },
  { q: "How does the AI Assistant work?", a: "Click the AI Assistant in the sidebar or press Ctrl+K. You can ask questions like 'What is my revenue this month?' or 'Which customers owe me money?'" },
];

export default function HelpPage() {
  const { setAIDrawerOpen } = useUIStore();

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-gray-900">Help & Support</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Find answers or reach out to us</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: MessageCircle, label: "Ask AI Assistant", desc: "Get instant answers about your business", action: () => setAIDrawerOpen(true), primary: true },
          { icon: Mail, label: "Email Support", desc: "support@finflow.app", action: () => window.open("mailto:support@finflow.app"), primary: false },
          { icon: BookOpen, label: "Documentation", desc: "Guides and tutorials", action: () => {}, primary: false },
        ].map((c) => (
          <Card key={c.label} className={`p-5 cursor-pointer hover:shadow-md transition-shadow ${c.primary ? "border-indigo-300 bg-indigo-50" : ""}`}
            onClick={c.action}>
            <c.icon className={`h-8 w-8 mb-3 ${c.primary ? "text-indigo-600" : "text-gray-400"}`} />
            <p className="font-semibold text-gray-900">{c.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-indigo-600" /> Frequently Asked Questions
        </h3>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-gray-900 mb-1">{faq.q}</p>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
