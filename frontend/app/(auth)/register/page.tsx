"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/slices/authStore";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

/** Convert FastAPI / Pydantic v2 error detail to a plain string */
function parseApiError(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first.msg === "string") return first.msg;
    return fallback;
  }
  return fallback;
}

const schema = z.object({
  full_name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  business_name: z.string().min(2, "Enter your business name"),
  gstin: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const FEATURES = [
  "GST invoices in 30 seconds",
  "AI assistant answers any finance question",
  "Automatic bookkeeping — no accounting knowledge needed",
  "Works on mobile, tablet & desktop",
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, setTokens, setBusinessId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/register", data);
      setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      if (res.data.business_id) setBusinessId(res.data.business_id);
      toast.success("Welcome to FinFlow!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(parseApiError(err, "Registration failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex w-2/5 bg-gradient-to-br from-violet-600 via-indigo-700 to-indigo-800 p-12 flex-col justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="h-8 w-8" />
          <span className="text-2xl font-bold font-display">FinFlow</span>
        </div>
        <div className="text-white">
          <h2 className="text-4xl font-bold font-display mb-6">Start for free.<br />Grow with AI.</h2>
          <div className="space-y-4">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <p className="text-indigo-100">{f}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">Free forever for small businesses. No credit card needed.</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <Sparkles className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold font-display text-gray-900">FinFlow</span>
          </div>

          <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">Create your account</h2>
          <p className="text-muted-foreground mb-8">Set up in under 2 minutes. Free forever.</p>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label>Your Name</Label>
                <Input className="mt-1 h-11" placeholder="Rahul Sharma" {...form.register("full_name")} />
                {form.formState.errors.full_name && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.full_name.message}</p>
                )}
              </div>
              <div>
                <Label>Business Name</Label>
                <Input className="mt-1 h-11" placeholder="Sharma Enterprises" {...form.register("business_name")} />
                {form.formState.errors.business_name && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.business_name.message}</p>
                )}
              </div>
              <div>
                <Label>Email Address</Label>
                <Input className="mt-1 h-11" type="email" placeholder="rahul@business.com" {...form.register("email")} />
                {form.formState.errors.email && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
              <div>
                <Label>Phone (optional)</Label>
                <Input className="mt-1 h-11" type="tel" placeholder="+91 98765 43210" {...form.register("phone")} />
              </div>
              <div>
                <Label>Password</Label>
                <Input className="mt-1 h-11" type="password" placeholder="Min. 8 characters" {...form.register("password")} />
                {form.formState.errors.password && (
                  <p className="text-destructive text-sm mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>
              <div>
                <Label>GSTIN (optional)</Label>
                <Input className="mt-1 h-11" placeholder="27AABCF1234M1Z5" {...form.register("gstin")} />
                <p className="text-xs text-muted-foreground mt-1">Add later in settings if you don&apos;t have it now</p>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Create Free Account
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="text-indigo-600 hover:underline">Terms</Link> and{" "}
              <Link href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</Link>.
            </p>
          </form>

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
