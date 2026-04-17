import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Lock, LogIn } from 'lucide-react';

export default function Login() {
  const { login, error, setError, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Small delay for UX feel
    await new Promise(r => setTimeout(r, 600));
    const ok = login(password);
    setLoading(false);
    if (!ok) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%)',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    }}>
      {/* Animated background orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,92,231,0.3) 0%, transparent 70%)',
          top: '-100px', left: '-100px', animation: 'pulse 4s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,184,212,0.2) 0%, transparent 70%)',
          bottom: '-80px', right: '-80px', animation: 'pulse 5s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(253,121,168,0.15) 0%, transparent 70%)',
          top: '40%', right: '15%', animation: 'pulse 6s ease-in-out infinite',
        }} />
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:0.8} 50%{transform:scale(1.1);opacity:1} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .login-input:focus { border-color: #6c5ce7 !important; box-shadow: 0 0 0 3px rgba(108,92,231,0.2) !important; }
        .login-btn:hover:not(:disabled) { background: #5a4bd1 !important; transform: translateY(-1px); box-shadow: 0 8px 25px rgba(108,92,231,0.5) !important; }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div style={{
        width: 420, maxWidth: '90vw', padding: '48px 40px',
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        animation: 'fadeIn 0.5s ease-out',
        ...(shake ? { animation: 'shake 0.4s ease-in-out' } : {}),
        position: 'relative', zIndex: 1,
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', boxShadow: '0 8px 32px rgba(108,92,231,0.5)',
          }}>
            <Lock size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 26, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            PHITEN VIETNAM
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, margin: 0 }}>
            CRM Management System
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Password field */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="login-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); if (error) setError(''); }}
                placeholder="Enter your password"
                autoFocus
                style={{
                  width: '100%', padding: '14px 48px 14px 16px', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.08)',
                  border: error ? '1.5px solid #fd79a8' : '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: 12, color: 'white', fontSize: 15,
                  fontFamily: 'inherit', outline: 'none',
                  transition: 'all 0.2s',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  color: 'rgba(255,255,255,0.4)',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Error message */}
            {error && (
              <div style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 8,
                background: 'rgba(253,121,168,0.15)', border: '1px solid rgba(253,121,168,0.3)',
                color: '#fd79a8', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !password}
            className="login-btn"
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #6c5ce7, #a855f7)',
              color: 'white', fontSize: 15, fontWeight: 700, cursor: loading || !password ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              opacity: !password ? 0.6 : 1,
              transition: 'all 0.2s', boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
            }}
          >
            {loading ? (
              <>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                Signing in...
              </>
            ) : (
              <><LogIn size={18} /> Sign In</>
            )}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 28, marginBottom: 0 }}>
          🔒 Phiten Vietnam — Internal CRM · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
