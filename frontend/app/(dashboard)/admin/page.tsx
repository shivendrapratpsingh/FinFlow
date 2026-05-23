"use client";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { useAuthStore } from "@/store/slices/authStore";
import { useRouter } from "next/navigation";

const ADMIN_EMAIL = "pratapsinghshivendra21@gmail.com";

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-yellow-500">
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
  );
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [tab, setTab] = useState<"users" | "ratings">("users");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.email !== ADMIN_EMAIL) {
      router.push("/dashboard");
      return;
    }
    Promise.all([
      apiClient.get("/admin/stats"),
      apiClient.get("/admin/users"),
      apiClient.get("/admin/ratings"),
    ]).then(([s, u, r]) => {
      setStats(s.data);
      setUsers(u.data);
      setRatings(r.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
        <p className="text-sm text-gray-500 mt-1">Only visible to you ({ADMIN_EMAIL})</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats?.total_users ?? 0, icon: "👥" },
          { label: "Total Sessions", value: stats?.total_sessions ?? 0, icon: "🔐" },
          { label: "Avg Rating", value: `${stats?.average_rating ?? 0} / 5`, icon: "⭐" },
          { label: "Total Ratings", value: stats?.total_ratings ?? 0, icon: "📝" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["users", "ratings"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "users" ? `Users (${users.length})` : `Ratings (${ratings.length})`}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {tab === "users" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Email", "Name", "Joined", "Last Login", "Sessions", "Duration", "Features Used"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-medium text-indigo-600">{u.email}</span>
                    {u.email === ADMIN_EMAIL && (
                      <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">admin</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-900">{u.full_name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.last_login ? new Date(u.last_login).toLocaleString("en-IN") : "Never"}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{u.total_sessions}</td>
                  <td className="px-4 py-3 text-gray-700">{u.total_duration_min > 0 ? `${u.total_duration_min} min` : "—"}</td>
                  <td className="px-4 py-3">
                    {u.features_used?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {u.features_used.map((f: any) => (
                          <span key={f.feature} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {f.feature} ×{f.count}
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-gray-400 text-xs">None yet</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-12 text-gray-400">No users yet</div>
          )}
        </div>
      )}

      {/* Ratings Table */}
      {tab === "ratings" && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Email", "Rating", "Comment", "Date"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ratings.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-indigo-600 font-medium">{r.email}</td>
                  <td className="px-4 py-3"><StarDisplay rating={r.rating} /></td>
                  <td className="px-4 py-3 text-gray-600">{r.comment || <span className="text-gray-400">—</span>}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{r.rated_at ? new Date(r.rated_at).toLocaleString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {ratings.length === 0 && (
            <div className="text-center py-12 text-gray-400">No ratings yet</div>
          )}
        </div>
      )}
    </div>
  );
}
