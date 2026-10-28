import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import PageHeader from "../components/PageHeader.jsx";
import Button from "../shared/buttons/Button.jsx";
import Toast from "../shared/feedback/Toast.jsx";
import { api } from "../api.js";
import { money } from "../utils/format.js";
export default function AdminReportsPage() {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  async function load() {
    setLoading(true);
    try {
      const r = await api("/reports");
      setData(r.data || r);
      setError("");
    } catch (e) {
      setError(e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function exportCsv() {
    if (!data?.orders?.length) return;
    const rows = [
      ["Order", "Date", "Total", "Status"],
      ...data.orders.map((o) => [
        o.orderNumber,
        o.createdAt,
        o.total,
        o.status,
      ]),
    ];
    const csv = rows
      .map((r) =>
        r.map((v) => `"${String(v ?? "").replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "projenius-orders-report.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return (
    <>
      <PageHeader
        eyebrow="BUSINESS INTELLIGENCE"
        title="Reports"
        description="Review report data returned by the backend. No chart data is fabricated."
        actions={
          <>
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw size={15} /> Refresh
            </Button>
            <Button
              variant="secondary"
              onClick={exportCsv}
              disabled={!data?.orders?.length}
            >
              <Download size={15} /> Export orders
            </Button>
          </>
        }
      />
      {error && <Toast type="error">{error}</Toast>}
      <div className="report-grid">
        {[
          ["Gross order value", data ? money(data.revenue) : "—"],
          ["Orders", data?.ordersCount ?? "—"],
          ["Paid orders", data?.paidOrders ?? "—"],
          ["Average order value", data ? money(data.averageOrderValue) : "—"],
        ].map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span className="stat-label">{label}</span>
            <strong>{loading ? "…" : value}</strong>
            <small>Based on API report records</small>
          </article>
        ))}
      </div>
      <section className="surface-card report-note">
        <h2>Reporting integrity</h2>
        <p>
          Reports display only figures returned by the backend. If the reports
          endpoint is not enabled, the screen reports that limitation rather
          than substituting sample statistics.
        </p>
      </section>
    </>
  );
}
