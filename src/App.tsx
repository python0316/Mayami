import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ProductPage } from './pages/ProductPage';
import { StorePage } from './pages/StorePage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { CustomerProfilePage } from './pages/CustomerProfilePage';
import { WeatherPage } from './pages/WeatherPage';
import { PrayerPage } from './pages/PrayerPage';

// Global Modals
import { StoryViewerModal } from './components/StoryViewerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { VisualSearchModal } from './components/VisualSearchModal';
import { AuthModal } from './components/AuthModal';
import { MobileCatalogModal } from './components/MobileCatalogModal';
import { BottomNavigation } from './components/BottomNavigation';

export const App: React.FC = () => {
  const location = useLocation();
  const { adminSession } = useApp();

  // ONLY hide Header, Footer, and BottomNav on unauthenticated login screens
  const isAuthScreen = location.pathname === '/admin' && !adminSession;

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-[#FAFAFA] font-sans antialiased selection:bg-brand-teal selection:text-white">
      {/* Global Marketplace Header - Visible across site and inside dashboard; hidden ONLY on login screens */}
      {!isAuthScreen && <Header />}

      {/* Global Marketplace Modals */}
      {!isAuthScreen && (
        <>
          <StoryViewerModal />
          <ProductDetailModal />
          <CartDrawer />
          <CheckoutModal />
          <VisualSearchModal />
          <AuthModal />
          <MobileCatalogModal />
        </>
      )}

      {/* Main Routed Content Area - pb-20 on mobile to leave space for Uzum-style bottom bar */}
      <main className="flex-1 w-full pb-20 md:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/store/:slug" element={<StorePage />} />
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="/shop" element={<Navigate to="/admin" replace />} />
          <Route path="/profile" element={<CustomerProfilePage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/prayer" element={<PrayerPage />} />
          <Route path="/namoz" element={<PrayerPage />} />
        </Routes>
      </main>

      {/* Floating Quick Return to Unified Dashboard Button */}
      {adminSession && location.pathname !== '/admin' && (
        <Link
          to="/admin"
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 px-3.5 py-2 md:px-4 md:py-2.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xl border border-neutral-700 dark:border-neutral-200 flex items-center gap-2 text-xs font-black hover:scale-105 active:scale-95 transition-all group"
          title="Boshqaruv panelingizga qaytish"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {adminSession.role === 'superadmin' ? '🛡️ SuperAdmin Paneli' : `🏪 ${adminSession.name} Paneli`}
          </span>
        </Link>
      )}

      {/* Uzum-style Mobile Bottom Navigation Bar (md:hidden) - always visible on mobile */}
      <BottomNavigation />

      {/* Global Marketplace Footer */}
      {!isAuthScreen && <Footer />}
    </div>
  );
};
