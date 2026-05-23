"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Save, User, Building2, Lock } from "lucide-react";
import { useAuthStore } from "@/store/slices/authStore";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";

export default function ProfileSettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ full_name: user?.full_name ?? "", email: user?.email ?? "" });
  const [password, setPassword] = useState({ current: "", new: "", confirm: "" });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiClient.patch("/auth/me", { full_name: profile.full_name });
      updateUser({ full_name: profile.full_name });
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.new !== password.confirm) { toast.error("Passwords don't match"); return; }
    if (password.new.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      await apiClient.post("/auth/change-password", { current_password: password.current, new_password: password.new });
      setPassword({ current: "", new: "", confirm: "" });
      toast.success("Password changed!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold font-display text-gray-900">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your profile and account settings</p>
      </motion.div>

      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
          <User className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Profile Information</h3>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl bg-indigo-100 text-indigo-700 font-bold">
              {user?.full_name?.[0]?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-gray-900">{user?.full_name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <Input className="mt-1" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input className="mt-1" value={profile.email} disabled className="mt-1 opacity-60 cursor-not-allowed" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save size={14} /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
          <Lock className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Change Password</h3>
        </div>
        <form onSubmit={changePassword} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Current Password</label>
            <Input className="mt-1" type="password" value={password.current} onChange={e => setPassword({...password, current: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">New Password</label>
            <Input className="mt-1" type="password" value={password.new} onChange={e => setPassword({...password, new: e.target.value})} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
            <Input className="mt-1" type="password" value={password.confirm} onChange={e => setPassword({...password, confirm: e.target.value})} />
          </div>
          <Button type="submit" variant="outline" disabled={saving}>
            {saving ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h3 className="font-semibold text-red-700 mb-3">Danger Zone</h3>
        <p className="text-sm text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
        <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
