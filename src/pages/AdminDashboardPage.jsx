import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { api } from "../api.js";
import AdminDashboardHeader from "../components/AdminDashboardPage/AdminDashboardHeader/AdminDashboardHeader.jsx";
import AdminDashboardStats from "../components/AdminDashboardPage/AdminDashboardStats/AdminDashboardStats.jsx";
import AdminDashboardRecentOrders from "../components/AdminDashboardPage/AdminDashboardRecentOrders/AdminDashboardRecentOrders.jsx";
import AdminDashboardPendingRequests from "../components/AdminDashboardPage/AdminDashboardPendingRequests/AdminDashboardPendingRequests.jsx";
import AdminDashboardActivity from "../components/AdminDashboardPage/AdminDashboardActivity/AdminDashboardActivity.jsx";
import Button from "../shared/buttons/Button.jsx";
import Toast from "../shared/feedback/Toast.jsx";
export default function AdminDashboardPage() {
  const [data, setData] = useState(null),
    [orders, setOrders] = useState([]),
    [requests, setRequests] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  async function load() {
    setLoading(true);
    setError("");
    try {
      const [d, o, q] = await Promise.all([
        api("/dashboard"),
        api("/orders?limit=5").catch(() => ({ data: [] })),
        api("/enquiries?status=new&limit=5").catch(() => ({ data: [] })),
      ]);
      setData(d.data || d);
      setOrders(o.data || o.items || []);
      setRequests(q.data || q.items || []);
    } catch (e) {
      setError(e.message);
      setData(null);
      setOrders([]);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  return (
    <>
      <div className="dashboard-actions">
        <AdminDashboardHeader />
        <Button variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </Button>
      </div>
      {error && <Toast type="error">{error}</Toast>}
      <AdminDashboardStats data={data} />
      <div className="dashboard-bottom-grid">
        <div className="dashboard-left">
          <AdminDashboardRecentOrders
            rows={orders}
            loading={loading}
            error={error ? undefined : ""}
          />
          <AdminDashboardPendingRequests rows={requests} />
        </div>
        <AdminDashboardActivity data={data} />
      </div>
    </>
  );
}
