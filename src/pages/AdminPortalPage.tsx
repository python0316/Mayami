import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UnifiedDashboard } from '../components/UnifiedDashboard';
import { ShieldCheck, Lock, User, ArrowRight, AlertCircle, Store, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export const AdminPortalPage: React.FC = () => {
  const { 
    adminSession, 
    loginUnified, 
    theme,
    t 
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Iltimos, login va parolni kiriting.");
      return;
    }

    const res = loginUnified(username.trim(), password.trim());
    if (!res.success) {
      setErrorMessage(res.error || "Login yoki parol noto'g'ri kiritildi!");
    }
  };

  // If already authenticated (as SuperAdmin or Vendor), show the Unified Dashboard!
  if (adminSession) {
    return <UnifiedDashboard />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-neutral-900 text-white relative overflow-hidden font-sans">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-teal/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-teal to-emerald-400 text-white flex items-center justify-center font-black shadow-md shadow-brand-teal/20">
            M
          </div>
          <span className="font-black text-xl tracking-tight text-white">Mayami</span>
        </Link>
        <Link 
          to="/" 
          className="flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-white transition-colors px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Bosh sahifaga qaytish</span>
        </Link>
      </nav>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto px-4 py-8 relative z-10">
        <div className="bg-neutral-800/80 backdrop-blur-xl border border-neutral-700/80 rounded-3xl p-8 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-brand-teal/20 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Boshqaruv Markazi
            </h1>
            <p className="text-xs text-neutral-400">
              SuperAdmin va Sotuvchilar uchun yagona boshqaruv portali
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                Login (Foydalanuvchi yoki Do'kon nomi)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMessage(null); }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-xs font-bold focus:outline-none focus:border-brand-teal transition-all"
                />
                <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                Maxfiy Parol
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white placeholder-neutral-500 text-xs font-bold focus:outline-none focus:border-brand-teal transition-all"
                />
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1.5 text-neutral-400 hover:text-white absolute right-3 top-2.5 transition-colors"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-teal to-emerald-500 hover:from-brand-teal-hover hover:to-emerald-600 text-white font-bold text-xs tracking-wide shadow-lg shadow-brand-teal/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <span>Portalga Kirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-neutral-500 relative z-10">
        © 2026 Mayami Management Security System. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
};
