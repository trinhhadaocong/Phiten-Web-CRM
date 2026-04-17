import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCRMData } from '../context/CRMContext';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  DollarSign, 
  MessageSquare,
  Edit2,
  Trash2,
  FileText,
  HelpCircle,
  Tag as TagIcon
} from 'lucide-react';

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers = [], loading, t } = useCRMData();
  const { user, hasPermission } = useAuth();

  // Helper to format Excel Serial Dates or strings
  const formatValueToDate = (val) => {
    if (!val) return 'N/A';
    if (typeof val === 'number') {
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      const d = new Date(utc_value * 1000);
      return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth()+1).toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
    }
    return String(val);
  };

  // Find the customer
  const customer = useMemo(() => {
    if (!customers || customers.length === 0) return null;
    return customers.find(c => c && (String(c['Mã KH']) === String(id) || String(c.customer_id) === String(id)));
  }, [customers, id]);

  // Derived RFM state
  const rfm = useMemo(() => {
    if (!customer) return null;
    
    // 1. Recency
    const lastDateRaw = customer['Ngày mua hàng gần nhất'] || customer.last_purchase_date;
    let rScore = 1;
    let rDays = 999;
    
    const lastDateStr = formatValueToDate(lastDateRaw);
    if (lastDateStr && lastDateStr.split('/').length === 3) {
      const parts = lastDateStr.split('/');
      const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      const diff = (new Date() - d) / (1000 * 60 * 60 * 24);
      rDays = Math.max(0, Math.floor(diff));
      if (rDays <= 30) rScore = 5;
      else if (rDays <= 60) rScore = 4;
      else if (rDays <= 90) rScore = 3;
      else if (rDays <= 180) rScore = 2;
    }

    // 2. Frequency
    const orders = Number(customer['Số đơn hàng'] || customer['SỐ ĐƠN HÀNG'] || customer.number_of_orders) || 1;
    let fScore = 1;
    if (orders > 10) fScore = 5;
    else if (orders >= 7) fScore = 4;
    else if (orders >= 4) fScore = 3;
    else if (orders >= 2) fScore = 2;

    // 3. Monetary
    const spend = Number(customer['Doanh thu'] || customer['DOANH THU'] || customer.revenue) || 0;
    let mScore = 1;
    if (spend > 10000000) mScore = 5;
    else if (spend >= 5000000) mScore = 4;
    else if (spend >= 2000000) mScore = 3;
    else if (spend >= 500000) mScore = 2;

    const rfmAvg = (rScore + fScore + mScore) / 3;
    
    return { rScore, fScore, mScore, rDays, rfmAvg, spend, orders, lastDateStr };
  }, [customer]);

  const tags = useMemo(() => {
    if (!customer || !rfm) return [];
    const tList = [];
    if (rfm.spend > 10000000) tList.push("VIP Spender");
    if (rfm.rDays <= 180) tList.push("Active Buyer");
    if (rfm.rDays > 180 && rfm.rDays !== 999) tList.push("Inactive 180d+");
    if (rfm.orders >= 3) tList.push("Repeat Buyer");
    
    // Birthday Month Check
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const bdRaw = customer['Ngày sinh'] || customer.birthday;
    const bdStr = formatValueToDate(bdRaw);
    if (bdStr.includes('/')) {
      const parts = bdStr.split('/');
      if (parseInt(parts[1]) === currentMonth) tList.push("Khách tháng sinh nhật");
    }

    if (!customer['SĐT'] || String(customer['Tên KH']).includes('Khách lẻ')) tList.push("Khách lẻ");
    return tList;
  }, [customer, rfm]);

  if (loading) return <div className="page-container"><div className="card" style={{ textAlign: 'center', padding: '100px' }}>Đang tải hồ sơ khách hàng...</div></div>;

  if (!customer || !rfm) {
    return (
      <div className="page-container">
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
           <h2 style={{ marginBottom: '16px' }}>Hồ sơ không tồn tại</h2>
           <p style={{ color: 'var(--text-medium)', marginBottom: '24px' }}>Mã khách hàng <strong>{id}</strong> không có trong hệ thống hoặc đã bị xóa.</p>
           <button onClick={() => navigate('/sales/customers')} className="btn-primary">
              <ArrowLeft size={16} /> Quay lại danh sách
           </button>
        </div>
      </div>
    );
  }

  const getSegmentStyle = (avg) => {
    if (avg >= 4) return { label: 'VIP', color: '#8854d0' };
    if (avg >= 3) return { label: 'Loyal', color: '#20bf6b' };
    if (avg >= 2) return { label: 'At Risk', color: '#f7b731' };
    return { label: 'Lost', color: '#eb3b5a' };
  };
  const segment = getSegmentStyle(rfm.rfmAvg);

  return (
    <div className="page-container animate-fade-in">
      {/* HEADER */}
      <div className="card mb-6" style={{ border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
               <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${segment.color}15`, color: segment.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, border: `2px solid ${segment.color}30` }}>
                  {String(customer['Tên KH'] || 'K').charAt(0).toUpperCase()}
               </div>
               <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                     <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800 }}>{customer['Tên KH']}</h1>
                     <span style={{ fontSize: '11px', background: '#f1f2f6', color: '#8395a7', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>#{customer['Mã KH']}</span>
                     <span style={{ fontSize: '11px', background: `${segment.color}15`, color: segment.color, padding: '2px 12px', borderRadius: '20px', fontWeight: 800 }}>{segment.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: 'var(--text-medium)', fontSize: '13px' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={14} /> {customer['SĐT'] || 'Trống'}</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {customer['Vị trí'] || customer['Địa chỉ'] || 'N/A'}</span>
                  </div>
               </div>
            </div>
            <button onClick={() => navigate('/sales/customers')} className="btn-secondary">
               <ArrowLeft size={16} /> Quay lại
            </button>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6" style={{ padding: '20px', background: '#f8f9fc', borderRadius: '12px' }}>
            <div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: '#8395a7', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng chi tiêu</div>
               <div style={{ fontSize: '18px', fontWeight: 800 }}>{rfm.spend.toLocaleString()} VND</div>
            </div>
            <div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: '#8395a7', textTransform: 'uppercase', marginBottom: '4px' }}>Số đơn hàng</div>
               <div style={{ fontSize: '18px', fontWeight: 800 }}>{rfm.orders} đơn</div>
            </div>
            <div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: '#8395a7', textTransform: 'uppercase', marginBottom: '4px' }}>AOV</div>
               <div style={{ fontSize: '18px', fontWeight: 800 }}>{rfm.orders > 0 ? Math.round(rfm.spend/rfm.orders).toLocaleString() : '0'} VND</div>
            </div>
            <div>
               <div style={{ fontSize: '11px', fontWeight: 700, color: '#8395a7', textTransform: 'uppercase', marginBottom: '4px' }}>Mua lần cuối</div>
               <div style={{ fontSize: '18px', fontWeight: 800 }}>{rfm.rDays === 0 ? 'Hôm nay' : rfm.rDays === 999 ? 'N/A' : `${rfm.rDays} ngày trước`}</div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
         {/* LEFT COLUMN */}
         <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* RFM CARD */}
            <div className="card">
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Chỉ số RFM</h3>
                  <HelpCircle size={18} color="#8395a7" style={{ cursor: 'help' }} />
               </div>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { label: 'Recency (R)', score: rfm.rScore, color: 'var(--primary-color)' },
                    { label: 'Frequency (F)', score: rfm.fScore, color: '#20bf6b' },
                    { label: 'Monetary (M)', score: rfm.mScore, color: '#a55eea' }
                  ].map(item => (
                    <div key={item.label}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>
                          <span>{item.label}</span>
                          <span style={{ color: item.color }}>{item.score}/5</span>
                       </div>
                       <div style={{ height: '6px', background: '#f1f2f6', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${item.score * 20}%`, background: item.color }} />
                       </div>
                    </div>
                  ))}
                  <div style={{ marginTop: '12px', padding: '16px', background: `${segment.color}08', borderRadius: '12px', border: `1px dashed ${segment.color}30`, textAlign: 'center' }}>
                     <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-medium)', textTransform: 'uppercase' }}>Điểm tổng hợp</div>
                     <div style={{ fontSize: '32px', fontWeight: 900, color: segment.color }}>{rfm.rfmAvg.toFixed(1)}</div>
                     <div style={{ fontSize: '14px', fontWeight: 700 }}>Ưu tiên: {segment.label} Case</div>
                  </div>
               </div>
            </div>

            {/* TAGS CARD */}
            <div className="card">
               <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700 }}>Hành vi & Đặc điểm</h3>
               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {tags.map(tag => (
                    <span key={tag} style={{ fontSize: '10px', fontWeight: 700, background: '#f0f3ff', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px' }}>
                       <TagIcon size={10} /> {tag}
                    </span>
                  ))}
               </div>
            </div>
         </div>

         {/* RIGHT COLUMN */}
         <div style={{ gridColumn: 'span 3', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* HISTORY CARD */}
            <div className="card" style={{ flex: 1 }}>
               <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700 }}>Lịch sử giao dịch</h3>
               <div className="table-container">
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                       <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f2f6' }}>
                          <th style={{ padding: '12px 8px', fontSize: '11px', color: '#8395a7' }}>NGÀY</th>
                          <th style={{ padding: '12px 8px', fontSize: '11px', color: '#8395a7' }}>KÊNH</th>
                          <th style={{ padding: '12px 8px', fontSize: '11px', color: '#8395a7' }}>SẢN PHẨM</th>
                          <th style={{ padding: '12px 8px', fontSize: '11px', color: '#8395a7' }}>THÀNH TIỀN</th>
                       </tr>
                    </thead>
                    <tbody>
                       <tr style={{ borderBottom: '1px solid #f8f9fa' }}>
                          <td style={{ padding: '16px 8px', fontSize: '13px' }}>{rfm.lastDateStr}</td>
                          <td style={{ padding: '16px 8px' }}>
                             <span style={{ fontSize: '10px', fontWeight: 800, background: '#e0f2f1', color: '#00897b', padding: '2px 8px', borderRadius: '4px' }}>
                                {customer['Channel'] || 'Website'}
                             </span>
                          </td>
                          <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 600 }}>Đơn hàng Q1.2026</td>
                          <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 700 }}>{rfm.spend.toLocaleString()} VND</td>
                       </tr>
                    </tbody>
                  </table>
               </div>
            </div>

            {/* ACTIONS CARD */}
            <div className="card" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <button className="btn-secondary"><MessageSquare size={16} /> Ghi chú</button>
               {hasPermission('MANAGE_CS') && <button className="btn-primary" style={{ background: '#45aaf2' }}><Edit2 size={16} /> Cập nhật</button>}
               {hasPermission('MANAGE_REPORTS') && <button className="btn-primary" style={{ background: 'var(--text-dark)' }}><FileText size={16} /> Xuất PDF</button>}
               {user?.role === 'admin' && <button className="btn-primary" style={{ background: '#eb3b5a', marginLeft: 'auto' }}><Trash2 size={16} /> Xóa</button>}
            </div>
         </div>
      </div>
    </div>
  );
}
