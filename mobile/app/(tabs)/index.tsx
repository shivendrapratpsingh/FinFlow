import React from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { FileText, Package, IndianRupee, TrendingUp, AlertCircle, Sparkles } from "lucide-react-native";
import { mobileApi } from "@/lib/api";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const KPI_CONFIG = [
  { key: "revenue", label: "Revenue", icon: IndianRupee, color: "#6366F1", bg: "#EEF2FF" },
  { key: "expenses", label: "Expenses", icon: TrendingUp, color: "#EF4444", bg: "#FEF2F2" },
  { key: "profit", label: "Net Profit", icon: TrendingUp, color: "#10B981", bg: "#ECFDF5" },
  { key: "outstanding", label: "Outstanding", icon: AlertCircle, color: "#F59E0B", bg: "#FFFBEB" },
];

const QUICK_ACTIONS = [
  { label: "New Invoice", icon: FileText, route: "/new-invoice", color: "#6366F1" },
  { label: "Add Product", icon: Package, route: "/new-product", color: "#10B981" },
  { label: "Ask AI", icon: Sparkles, route: "/(tabs)/ai", color: "#8B5CF6" },
  { label: "Scan Bill", icon: IndianRupee, route: "/scan", color: "#F59E0B" },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const { data, refetch } = useQuery({
    queryKey: ["mobile-dashboard"],
    queryFn: () => mobileApi.getDashboard("this_month"),
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
      >
        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <View style={styles.kpiGrid}>
            {KPI_CONFIG.map((kpi) => {
              const kpiData = data?.kpis?.[kpi.key];
              const Icon = kpi.icon;
              return (
                <View key={kpi.key} style={[styles.kpiCard, { width: CARD_W }]}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: kpi.bg }]}>
                    <Icon size={18} color={kpi.color} />
                  </View>
                  <Text style={styles.kpiValue}>{kpiData?.formatted ?? "—"}</Text>
                  <Text style={styles.kpiLabel}>{kpi.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <TouchableOpacity
                  key={action.label}
                  style={styles.actionBtn}
                  onPress={() => router.push(action.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + "20" }]}>
                    <Icon size={20} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Invoices */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recent Invoices</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/invoices")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {(data?.recent_invoices ?? []).slice(0, 5).map((inv: any) => (
            <TouchableOpacity
              key={inv.id}
              style={styles.invoiceRow}
              onPress={() => router.push(`/invoice/${inv.id}` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.invoiceLeft}>
                <Text style={styles.invoiceNumber}>{inv.invoice_number}</Text>
                <Text style={styles.invoiceCustomer}>{inv.customer_name}</Text>
              </View>
              <View style={styles.invoiceRight}>
                <Text style={styles.invoiceAmount}>{inv.amount}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: inv.status === "paid" ? "#ECFDF5" : inv.status === "overdue" ? "#FEF2F2" : "#EEF2FF" }
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: inv.status === "paid" ? "#059669" : inv.status === "overdue" ? "#DC2626" : "#6366F1" }
                  ]}>
                    {inv.status}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 12 },
  seeAll: { fontSize: 13, color: "#6366F1", fontFamily: "Inter_600SemiBold" },

  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  kpiCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  kpiIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  kpiValue: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#111827", marginBottom: 2 },
  kpiLabel: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular" },

  actionsRow: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { alignItems: "center", gap: 6 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 11, color: "#374151", fontFamily: "Inter_600SemiBold", textAlign: "center" },

  invoiceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  invoiceLeft: { flex: 1 },
  invoiceRight: { alignItems: "flex-end", gap: 4 },
  invoiceNumber: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: "#111827" },
  invoiceCustomer: { fontSize: 12, color: "#6B7280", fontFamily: "Inter_400Regular", marginTop: 2 },
  invoiceAmount: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#111827" },
  statusBadge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "capitalize" },
});
