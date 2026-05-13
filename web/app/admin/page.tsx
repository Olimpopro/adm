import { redirect } from "next/navigation";
import { isLoggedIn } from "@/lib/auth";
import { listLeads, loadLots } from "@/lib/store";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLogin } from "@/components/AdminLogin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const logged = await isLoggedIn();
  if (!logged) return <AdminLogin />;

  const [leads, lots] = await Promise.all([listLeads(), loadLots()]);
  return <AdminDashboard leads={leads} lots={lots} />;
}
