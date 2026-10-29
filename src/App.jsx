import { useCallback, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import AdminLoginPage from "./pages/AdminLoginPage.jsx";
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

// Local development only.
// This user is never used by a production build.
const LOCAL_DEV_ADMIN = {
  email: "local-admin@localhost",
  name: "Local Development Admin",
  role: "admin",
};

function ProtectedAdminRoutes({ user, onLogout }) {
  return (
    <Routes>
      <Route
        path="/"
        element={<AdminLayout user={user} onLogout={onLogout} />}
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
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Bypass is available only when running Vite locally
  // and the explicit development flag is enabled.
  const localAdminBypass =
    import.meta.env.DEV &&
    import.meta.env.VITE_ADMIN_DEV_BYPASS === "true";

  // In local development, use a temporary local admin identity.
  // In production, use only the verified server session.
  const activeUser = localAdminBypass ? LOCAL_DEV_ADMIN : user;

  useEffect(() => {
    let cancelled = false;

    // Skip login/session validation only for local development.
    if (localAdminBypass) {
      setCheckingSession(false);

      return () => {
        cancelled = true;
      };
    }

    const token = localStorage.getItem("projenius_admin_token");

    if (!token) {
      setUser(null);
      setCheckingSession(false);

      return () => {
        cancelled = true;
      };
    }

    api("/auth/me")
      .then((result) => {
        if (cancelled) return;

        const authenticatedUser = result?.user || result?.data?.user;

        setUser(authenticatedUser || null);

        if (!authenticatedUser) {
          localStorage.removeItem("projenius_admin_token");
        }
      })
      .catch(() => {
        localStorage.removeItem("projenius_admin_token");

        if (!cancelled) {
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCheckingSession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [localAdminBypass]);

  const handleLogin = useCallback(
    (result) => {
      const authenticatedUser = result?.user || result?.data?.user;

      if (!authenticatedUser) {
        throw new Error(
          "The server did not return an administrator session."
        );
      }

      setUser(authenticatedUser);
      navigate("/", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    if (localAdminBypass) {
      // Local bypass mode has no real login session to clear.
      setUser(LOCAL_DEV_ADMIN);
      navigate("/", { replace: true });
      return;
    }

    localStorage.removeItem("projenius_admin_token");
    setUser(null);

    navigate("/login", { replace: true });
  }, [navigate, localAdminBypass]);

  if (checkingSession) {
    return (
      <main className="login-page">
        <p role="status">Checking admin session…</p>
      </main>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          activeUser ? (
            <Navigate to="/" replace />
          ) : (
            <AdminLoginPage onLogin={handleLogin} />
          )
        }
      />

      <Route
        path="/*"
        element={
          activeUser ? (
            <ProtectedAdminRoutes
              user={activeUser}
              onLogout={logout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}