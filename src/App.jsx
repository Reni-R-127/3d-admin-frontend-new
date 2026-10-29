import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { api } from "./api.js";
import AdminLayout from "./layouts/AdminLayout/AdminLayout.jsx";

import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import AdminProductCreatePage from "./pages/AdminProductCreatePage.jsx";
import AdminProductEditPage from "./pages/AdminProductEditPage.jsx";
import AdminCategoriesPage from "./pages/AdminCategoriesPage.jsx";
import AdminMaterialsPage from "./pages/AdminMaterialsPage.jsx";
import AdminInventoryPage from "./pages/AdminInventoryPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";
import AdminOrderDetailsPage from "./pages/AdminOrderDetailsPage.jsx";
import AdminProductionPage from "./pages/AdminProductionPage.jsx";
import AdminQuotesPage from "./pages/AdminQuotesPage.jsx";
import AdminRequestsPage from "./pages/AdminRequestsPage.jsx";
import AdminCustomersPage from "./pages/AdminCustomersPage.jsx";
import AdminReviewsPage from "./pages/AdminReviewsPage.jsx";
import AdminCouponsPage from "./pages/AdminCouponsPage.jsx";
import AdminContentPage from "./pages/AdminContentPage.jsx";
import AdminReportsPage from "./pages/AdminReportsPage.jsx";
import AdminSettingsPage from "./pages/AdminSettingsPage.jsx";
import AdminFaqsPage from "./pages/AdminFaqsPage.jsx";

function ProtectedAdminRoutes({ user }) {
  return (
    <Routes>
      <Route
        path="/"
        element={<AdminLayout user={user} />}
      >
        <Route index element={<AdminDashboardPage />} />

        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductCreatePage />} />
        <Route path="products/:id/edit" element={<AdminProductEditPage />} />

        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="materials" element={<AdminMaterialsPage />} />
        <Route path="inventory" element={<AdminInventoryPage />} />

        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailsPage />} />

        <Route path="production" element={<AdminProductionPage />} />
        <Route path="quotes" element={<AdminQuotesPage />} />
        <Route path="requests" element={<AdminRequestsPage />} />
        <Route path="customers" element={<AdminCustomersPage />} />

        <Route path="reviews" element={<AdminReviewsPage />} />
        <Route path="coupons" element={<AdminCouponsPage />} />
        <Route path="content" element={<AdminContentPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="faqs" element={<AdminFaqsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [sessionError, setSessionError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function verifyAdminAccess() {
      setCheckingSession(true);
      setSessionError("");

      try {
        // The API helper obtains a short-lived token securely.
        const result = await api("/auth/me");
        const verifiedUser = result?.user || result?.data?.user;

        if (!verifiedUser || verifiedUser.role !== "admin") {
          throw new Error(
            "Admin access could not be verified. Check the admin API configuration."
          );
        }

        if (!cancelled) {
          setUser({
            ...verifiedUser,
            name: verifiedUser.name || "ProJenius Admin",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setSessionError(
            error?.message || "Unable to connect to the admin service."
          );
        }
      } finally {
        if (!cancelled) {
          setCheckingSession(false);
        }
      }
    }

    verifyAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  if (checkingSession) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <p role="status">Connecting to ProJenius Admin...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          fontFamily: "Segoe UI, sans-serif",
        }}
      >
        <section style={{ maxWidth: "520px", textAlign: "center" }}>
          <h2>Unable to connect to Admin</h2>

          <p role="alert">
            {sessionError}
          </p>

          <button
            type="button"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry Connection
          </button>
        </section>
      </main>
    );
  }

  return (
    <Routes>
      {/* The application login page is no longer used. */}
      <Route
        path="/login"
        element={<Navigate to="/" replace />}
      />

      <Route
        path="/*"
        element={<ProtectedAdminRoutes user={user} />}
      />
    </Routes>
  );
}