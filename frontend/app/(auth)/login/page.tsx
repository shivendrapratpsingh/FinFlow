"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/slices/authStore";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";

/** Convert FastAPI / Pydantic v2 error detail to a plain string */
function parseApiError(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    // Pydantic v2: [{loc, msg, type, input}, ...]
    const first = detail[0];
    if (first && typeof first.msg === "string") return first.msg;
    return fallback;
  }
  return fallback;
}

const emailSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const phoneSchema = z.object({
  phone: z.string().min(10, "Enter a valid phone number"),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setTokens, setBusinessId } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });

  const onEmailLogin = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      const res = await apiClient.post("/auth/login-json", {
        email: data.email,
        password: data.password,
      });
      setTokens(res.data.access_token, res.data.refresh_token);
      setUser(res.data.user);
      if (res.data.business_id) setBusinessId(res.data.business_id);
      toast.success(`Welcome back, ${res.data.user.full_name}!`);
      // Hard redirect so middleware reads the fresh cookie
      window.location.href = "/dashboard";
    } catch (err: any) {
      toast.error(parseApiError(err, "Login failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const onPhoneSendOTP = async (data: PhoneForm) => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/send-otp", { phone: data.phone });
      toast.success("OTP sent!");
      router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`);
    } catch (err: any) {
      toast.error(parseApiError(err, "Failed to send OTP"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="h-8 w-8" />
            <span className="text-2xl font-bold font-display">FinFlow</span>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white"
        >
          <h1 className="text-5xl font-bold font-display mb-6 leading-tight">
            Accounting that<br />
            <span className="text-indigo-200">thinks for you.</span>
          </h1>
          <p className="text-indigo-200 text-xl">
            GST invoices, inventory, and AI-powered insights — all in one place. No accounting degree needed.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { label: "Invoices", value: "10L+" },
              { label: "Businesses", value: "50K+" },
              { label: "GST Saved", value: "₹2Cr+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-indigo-200 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <p className="text-indigo-300 text-sm">© 2024 FinFlow. Built for India.</p>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Sparkles className="h-7 w-7 text-indigo-600" />
            <span className="text-xl font-bold font-display text-gray-900">FinFlow</span>
          </div>

          <h2 className="text-3xl font-bold font-display text-gray-900 mb-2">
            Welcome back
          </h2>
          <p className="text-muted-foreground mb-8">
            Sign in to your account to continue
          </p>

          {/* Google Sign In */}
          <Button
            variant="outline"
            className="w-full mb-6 h-12 text-base"
            onClick={() => toast("Google login coming soon!")}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or sign in with</span>
            </div>
          </div>

          <Tabs defaultValue="email">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="email" className="flex-1">Email</TabsTrigger>
              <TabsTrigger value="phone" className="flex-1">Phone / OTP</TabsTrigger>
            </TabsList>

            {/* Email Login */}
            <TabsContent value="email">
              <form onSubmit={emailForm.handleSubmit(onEmailLogin)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@business.com"
                    className="h-12 mt-1"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-destructive text-sm mt-1">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative mt-1">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="h-12 pr-10"
                      {...emailForm.register("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {emailForm.formState.errors.password && (
                    <p className="text-destructive text-sm mt-1">{emailForm.formState.errors.password.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Sign in
                </Button>
              </form>
            </TabsContent>

            {/* Phone / OTP Login */}
            <TabsContent value="phone">
              <form onSubmit={phoneForm.handleSubmit(onPhoneSendOTP)} className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex mt-1">
                    <span className="inline-flex items-center px-3 text-sm border border-r-0 border-input rounded-l-md bg-muted text-muted-foreground">
                      +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="h-12 rounded-l-none"
                      {...phoneForm.register("phone")}
                    />
                  </div>
                  {phoneForm.formState.errors.phone && (
                    <p className="text-destructive text-sm mt-1">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send OTP
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <p className="text-center text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-indigo-600 font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
