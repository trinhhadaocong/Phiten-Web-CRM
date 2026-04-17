import React from 'react';
import { Lock, Home, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <Lock size={48} className="text-red-500" />
        </div>
        <div className="absolute -bottom-2 -right-2 bg-[#0f172a] p-1.5 rounded-lg border border-slate-700">
           <ArrowLeft size={16} className="text-slate-400" />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Quyền truy cập bị từ chối</h2>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        Tài khoản của bạn (<span className="text-indigo-400 font-medium">{user?.role?.toUpperCase()}</span>) không có quyền xem trang này. Vui lòng liên hệ Quản trị viên nếu đây là lỗi.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          to="/dashboard" 
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg shadow-indigo-500/20"
        >
          <Home size={18} /> Quay lại Dashboard
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold transition-all border border-slate-700"
        >
          Trở lại trang trước
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
