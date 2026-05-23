"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Save, Send, Download,
  ChevronDown, Sparkles, Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { apiClient } from "@/lib/api";
import { formatRupee } from "@/lib/utils";
import toast from "react-hot-toast";

const GST_RATES = [0, 5, 12, 18, 28];

const lineItemSchema = z.object({
  description: z.string().min(1, "Required"),
  hsn_sac_code: z.string().optional(),
  quantity: z.number().min(0.001),
  unit: z.string().default("pcs"),
  rate: z.number().min(0),
  discount_percent: z.number().min(0).max(100).default(0),
  gst_rate: z.number().default(18),
});

const schema = z.object({
  customer_name: z.string().optional(),
  customer_id: z.string().optional(),
  invoice_date: z.string().min(1, "Required"),
  due_date: z.string().optional(),
  place_of_supply: z.string().optional(),
  notes: z.string().optional(),
  terms_and_conditions: z.string().optional(),
  line_items: z.array(lineItemSchema).min(1, "Add at least one item"),
});

type FormData = z.infer<typeof schema>;

function calculateLineItem(item: z.infer<typeof lineItemSchema>, isIGST: boolean) {
  const gross = item.quantity * item.rate;
  const discountAmt = (gross * item.discount_percent) / 100;
  const taxable = gross - discountAmt;
  const gstAmt = (taxable * item.gst_rate) / 100;
  const halfGST = gstAmt / 2;
  return {
    gross,
    discountAmt,
    taxable,
    cgst: isIGST ? 0 : halfGST,
    sgst: isIGST ? 0 : halfGST,
    igst: isIGST ? gstAmt : 0,
    total: taxable + gstAmt,
  };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [isIGST, setIsIGST] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      invoice_date: new Date().toISOString().split("T")[0],
      line_items: [{
        description: "",
        quantity: 1,
        unit: "pcs",
        rate: 0,
        discount_percent: 0,
        gst_rate: 18,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "line_items",
  });

  const lineItems = form.watch("line_items");

  // Calculate totals live
  const totals = lineItems.reduce(
    (acc, item) => {
      const calc = calculateLineItem(item, isIGST);
      return {
        subtotal: acc.subtotal + calc.gross,
        discount: acc.discount + calc.discountAmt,
        taxable: acc.taxable + calc.taxable,
        cgst: acc.cgst + calc.cgst,
        sgst: acc.sgst + calc.sgst,
        igst: acc.igst + calc.igst,
        total: acc.total + calc.total,
      };
    },
    { subtotal: 0, discount: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }
  );

  const onSubmit = async (data: FormData, isDraft = false) => {
    setIsSaving(true);
    try {
      const payload = { ...data, is_draft: isDraft };
      const res = await apiClient.post("/billing/invoices", payload);
      toast.success(isDraft ? "Draft saved!" : "Invoice created!");
      router.push(`/billing/invoices/${res.data.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to create invoice");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display">New Invoice</h1>
          <p className="text-muted-foreground text-sm">Create a GST-compliant invoice</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => toast("AI invoice generation coming soon!")}
            className="gap-2 text-indigo-600 border-indigo-200"
          >
            <Sparkles size={15} />
            AI Fill
          </Button>
          <Button
            variant="outline"
            onClick={form.handleSubmit((d) => onSubmit(d, true))}
            disabled={isSaving}
          >
            <Save size={15} className="mr-1.5" />
            Save Draft
          </Button>
          <Button
            onClick={form.handleSubmit((d) => onSubmit(d, false))}
            disabled={isSaving}
          >
            <Send size={15} className="mr-1.5" />
            Create & Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Customer + Dates */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bill To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Customer Name</Label>
                <Input
                  className="mt-1"
                  placeholder="Customer name or company"
                  {...form.register("customer_name")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Date *</Label>
                  <Input type="date" className="mt-1" {...form.register("invoice_date")} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" className="mt-1" {...form.register("due_date")} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={isIGST} onCheckedChange={setIsIGST} id="igst" />
                <Label htmlFor="igst" className="cursor-pointer">
                  Inter-state supply (IGST) — customer is in a different state
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Items / Services</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Column headers */}
              <div className="hidden md:grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium mb-2 px-1">
                <div className="col-span-4">Description</div>
                <div className="col-span-1">HSN</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-2">Rate</div>
                <div className="col-span-1">Disc%</div>
                <div className="col-span-1">GST%</div>
                <div className="col-span-1"></div>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const calc = calculateLineItem(lineItems[index] || {}, isIGST);
                  return (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="grid grid-cols-12 gap-2 items-start p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
                    >
                      <div className="col-span-12 md:col-span-4">
                        <Input
                          placeholder="Item description"
                          {...form.register(`line_items.${index}.description`)}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <Input
                          placeholder="HSN"
                          {...form.register(`line_items.${index}.hsn_sac_code`)}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <Input
                          type="number"
                          placeholder="1"
                          min="0"
                          step="0.001"
                          {...form.register(`line_items.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <Input placeholder="pcs" {...form.register(`line_items.${index}.unit`)} />
                      </div>
                      <div className="col-span-6 md:col-span-2">
                        <Input
                          type="number"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          {...form.register(`line_items.${index}.rate`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-6 md:col-span-1">
                        <Input
                          type="number"
                          placeholder="0"
                          min="0"
                          max="100"
                          {...form.register(`line_items.${index}.discount_percent`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-5 md:col-span-1">
                        <Select
                          defaultValue="18"
                          onValueChange={(v) => form.setValue(`line_items.${index}.gst_rate`, Number(v))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {GST_RATES.map((r) => (
                              <SelectItem key={r} value={r.toString()}>{r}%</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-1 flex flex-col items-end gap-1">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-muted-foreground hover:text-red-500 p-1"
                          disabled={fields.length === 1}
                        >
                          <Trash2 size={15} />
                        </button>
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                          {formatRupee(calc.total)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 w-full border-dashed"
                onClick={() => append({
                  description: "",
                  quantity: 1,
                  unit: "pcs",
                  rate: 0,
                  discount_percent: 0,
                  gst_rate: 18,
                })}
              >
                <Plus size={15} className="mr-1.5" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardContent className="pt-5 space-y-4">
              <div>
                <Label>Notes (optional)</Label>
                <Textarea
                  className="mt-1 resize-none"
                  rows={2}
                  placeholder="Thank you for your business!"
                  {...form.register("notes")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator size={15} />
                Invoice Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatRupee(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount</span>
                  <span>- {formatRupee(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Amount</span>
                <span>{formatRupee(totals.taxable)}</span>
              </div>
              <Separator />
              {isIGST ? (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IGST</span>
                  <span>{formatRupee(totals.igst)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CGST</span>
                    <span>{formatRupee(totals.cgst)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SGST</span>
                    <span>{formatRupee(totals.sgst)}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-indigo-600">{formatRupee(totals.total)}</span>
              </div>

              <Button
                className="w-full mt-2"
                onClick={form.handleSubmit((d) => onSubmit(d, false))}
                disabled={isSaving}
              >
                <Send size={15} className="mr-1.5" />
                Create Invoice
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast("PDF preview coming soon!")}
              >
                <Download size={15} className="mr-1.5" />
                Preview PDF
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
