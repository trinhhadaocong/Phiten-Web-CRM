import React from 'react';
import { Crown, Heart, AlertTriangle, History, ArrowUpRight, Zap, Target } from 'lucide-react';

export default function RFMWidget() {
  const segments = [
    { 
      name: 'VIP', 
      icon: <Crown size={18} />, 
      count: 21, 
      totalRev: '2.63 tỷ', 
      avgSpend: '29.5M', 
      percent: 0.5, 
      color: '#8854d0', 
      badge: null 
    },
    { 
      name: 'Loyal', 
      icon: <Heart size={18} />, 
      count: 997, 
      totalRev: '4.2 tỷ', 
      avgSpend: '4.44M', 
      percent: 24.8, 
      color: '#20bf6b', 
      badge: null 
    },
    { 
      name: 'At Risk', 
      icon: <AlertTriangle size={18} />, 
      count: 513, 
      totalRev: '2.1 tỷ', 
      avgSpend: '3.74M', 
      percent: 12.8, 
      color: '#f7b731', 
      badge: 'Cần hành động' 
    },
    { 
      name: 'Lost', 
      icon: <History size={18} />, 
      count: 1547, 
      totalRev: '4.7 tỷ', 
      avgSpend: '2.96M', 
      percent: 38.5, 
      color: '#eb3b5a', 
      badge: 'Cần hành động' 
    },
  ];

  return (
    <div className="rfm-widget-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      
      {/* PHẦN A — 4 SEGMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {segments.map((seg, idx) => (
          <div key={idx} className="card" style={{ 
            padding: '20px', 
            borderLeft: `4px solid ${seg.color}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: seg.color }}>
                 {seg.icon}
                 <span style={{ fontWeight: 700, fontSize: '13px', textTransform: 'uppercase' }}>{seg.name}</span>
               </div>
               {seg.badge && (
                 <span className="badge-pill" style={{ 
                   fontSize: '9px', 
                   background: `${seg.color}15`, 
                   color: seg.color, 
                   padding: '2px 8px', 
                   borderRadius: '10px',
                   fontWeight: 800
                 }}>
                   {seg.badge}
                 </span>
               )}
            </div>

            <div>
               <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-dark)' }}>{seg.count}</div>
               <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 500 }}>Khách hàng</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Tổng Rev:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{seg.totalRev}</span>
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-medium)' }}>Avg Spend/KH:</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-dark)' }}>{seg.avgSpend}</span>
               </div>
            </div>

            <div style={{ marginTop: '8px' }}>
               <div style={{ height: '4px', width: '100%', background: '#f1f2f6', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${seg.percent}%`, background: seg.color }} />
               </div>
               <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '4px', textAlign: 'right' }}>
                  {seg.percent}% tổng KH
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* PHẦN B — REVENUE RECOVERY PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* At Risk Card */}
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, white 0%, #fff9f0 100%)', position: 'relative' }}>
           <div style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={14} fill="#f59e0b" /> Phục hồi khách hàng At-risk
           </div>
           <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>Cửa sổ 90 ngày đang đóng</h3>
           
           <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
              <div>
                 <div style={{ fontSize: '24px', fontWeight: 800 }}>513 <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-medium)' }}>KH</span></div>
                 <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Mục tiêu: 30% (153 KH)</div>
              </div>
              <div style={{ borderLeft: '1px solid #f59e0b30', paddingLeft: '32px' }}>
                 <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b' }}>80M – 120M</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Doanh thu dự kiến</div>
              </div>
           </div>

           <button style={{ 
             width: '100%', 
             padding: '12px', 
             background: '#f59e0b', 
             color: 'white', 
             border: 'none', 
             borderRadius: '12px', 
             fontWeight: 700, 
             fontSize: '14px',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '8px',
             boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
           }}>
             Launch Win-Back Campaign <ArrowUpRight size={18} />
           </button>
        </div>

        {/* Lost Card */}
        <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, white 0%, #fff5f5 100%)' }}>
           <div style={{ color: '#ef4444', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={14} /> Tái kích hoạt khách hàng Lost
           </div>
           <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 800 }}>2.54 tỷ tiềm năng Win-Back</h3>

           <div style={{ display: 'flex', gap: '32px', marginBottom: '24px' }}>
              <div>
                 <div style={{ fontSize: '24px', fontWeight: 800 }}>1,547 <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-medium)' }}>KH</span></div>
                 <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Mục tiêu: 15% (~232 KH)</div>
              </div>
              <div style={{ borderLeft: '1px solid #ef444430', paddingLeft: '32px' }}>
                 <div style={{ fontSize: '24px', fontWeight: 800, color: '#ef4444' }}>120M – 200M</div>
                 <div style={{ fontSize: '12px', color: 'var(--text-medium)' }}>Doanh thu dự kiến</div>
              </div>
           </div>

           <button style={{ 
             width: '100%', 
             padding: '12px', 
             background: '#fee2e2', 
             color: '#ef4444', 
             border: '1px solid #fca5a5', 
             borderRadius: '12px', 
             fontWeight: 700, 
             fontSize: '14px',
             cursor: 'pointer',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             gap: '8px'
           }}>
             3-Wave Reactivation Campaign <ArrowUpRight size={18} />
           </button>
        </div>
      </div>

      {/* PHẦN C — ACTIVE RATE PROGRESS BAR */}
      <div className="card" style={{ padding: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
            <div>
               <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-medium)', textTransform: 'uppercase', marginBottom: '4px' }}>Active Rate (12 tháng)</div>
               <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-dark)' }}>33.5% <span style={{ fontSize: '16px', fontWeight: 500, color: '#f59e0b' }}>(Cần cải thiện)</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
               <div style={{ fontSize: '11px', color: 'var(--text-medium)', fontWeight: 600 }}>TARGET Q1</div>
               <div style={{ fontSize: '18px', fontWeight: 800, color: '#20bf6b' }}>50.0%</div>
            </div>
         </div>

         <div style={{ height: '16px', width: '100%', background: '#f1f2f6', borderRadius: '8px', position: 'relative', overflow: 'visible', marginBottom: '12px' }}>
            {/* Current Progress */}
            <div style={{ height: '100%', width: '33.5%', background: 'linear-gradient(90deg, #eb3b5a 0%, #f7b731 100%)', borderRadius: '8px' }} />
            
            {/* Target Marker */}
            <div style={{ 
              position: 'absolute', 
              top: '-4px', 
              left: '50.0%', /* Center of the percentage bar? No, 50% target */
              height: '24px', 
              width: '2px', 
              background: '#20bf6b',
              zIndex: 2 
            }}>
               <div style={{ 
                 position: 'absolute', 
                 top: '-18px', 
                 left: '50%', 
                 transform: 'translateX(-50%)', 
                 fontSize: '10px', 
                 fontWeight: 800, 
                 color: '#20bf6b',
                 whiteSpace: 'nowrap'
               }}>
                 TARGET LINE
               </div>
            </div>
         </div>

         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-medium)', fontWeight: 500 }}>
               Gap: <span style={{ color: '#eb3b5a', fontWeight: 700 }}>-16.5%</span> | Cần thêm <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>674 KH active</span> để đạt target
            </div>
            <button style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--primary-color)', 
              fontSize: '12px', 
              fontWeight: 700, 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              Xem kế hoạch reactivation <Target size={14} />
            </button>
         </div>
      </div>

    </div>
  );
}
