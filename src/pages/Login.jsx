import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error, setError, isAuthenticated, mockUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const success = login(email, password);
    setIsLoading(false);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  const quickLogin = (userEmail) => {
    setEmail(userEmail);
    login(userEmail, 'demo');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.3)] mb-4">
            <span className="text-white text-3xl font-black italic">PH</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest uppercase">
            PHITEN <span className="text-indigo-500">CRM</span>
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Bản quyền thuộc Phiten Vietnam 2026</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
          
          <h2 className="text-xl font-bold text-white mb-6">Đăng nhập hệ thống</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm animate-shake">
              <ShieldAlert size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email công việc</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@phiten.vn"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 group"
            >
              {isLoading ? 'Đang xác thực...' : 'VÀO HỆ THỐNG'}
              <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Quick Demo Login */}
          <div className="mt-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Demo Quick Access</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {mockUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => quickLogin(user.email)}
                  className="bg-slate-900/40 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 p-2.5 rounded-xl text-left transition-all group"
                >
                  <div className="text-[10px] font-bold text-slate-500 uppercase group-hover:text-indigo-400 transition-colors">{user.role}</div>
                  <div className="text-xs font-medium text-slate-300 truncate">{user.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-slate-600 text-[10px] mt-8 uppercase tracking-[0.2em]">
          Internal Access Only &bull; Restricted Area
        </p>
      </div>
    </div>
  );
};

export default Login;
