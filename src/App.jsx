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


function ProtectedAdminRoutes({ user, onLogout }) {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout user={user} onLogout={onLogout} />}>
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

  useEffect(() => {
    let cancelled = false;
    if (!localStorage.getItem("projenius_admin_token")) {
      setCheckingSession(false);
      return () => { cancelled = true; };
    }
    api("/auth/me")
      .then((result) => { if (!cancelled) setUser(result.user || result.data?.user || null); })
      .catch(() => { localStorage.removeItem("projenius_admin_token"); if (!cancelled) setUser(null); })
      .finally(() => { if (!cancelled) setCheckingSession(false); });
    return () => { cancelled = true; };
  }, []);

  const handleLogin = useCallback((result) => {
    const authenticatedUser = result?.user || result?.data?.user;
    if (!authenticatedUser) throw new Error("The server did not return an administrator session.");
    setUser(authenticatedUser);
    navigate("/", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem("projenius_admin_token");
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  if (checkingSession) return <main className="login-page"><p role="status">Checking admin session…</p></main>;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AdminLoginPage onLogin={handleLogin} />} />
      <Route path="/*" element={user ? <ProtectedAdminRoutes user={user} onLogout={logout} /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
