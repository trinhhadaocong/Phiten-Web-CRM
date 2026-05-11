import React, { useMemo, useState, useEffect } from 'react';
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
  const customerId = useMemo(() => String(id || '').trim().toUpperCase(), [id]);
  const navigate = useNavigate();
  const { customers = [], transactions = [], loading, t } = useCRMData();
  const { user, hasPermission } = useAuth();

  // Find the customer
  const customer = useMemo(() => {
    if (!customers || customers.length === 0) return null;
    // Prioritize Exact Match on Mã KH
    return customers.find(c => c && String(c['Mã KH']).toUpperCase() === customerId);
  }, [customers, customerId]);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState(() => localStorage.getItem(`note_${customerId}`) || '');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => {
    try {
      const saved = localStorage.getItem(`customer_edit_${customerId}`);
      return saved ? JSON.parse(saved) : null;
    } catch(e) { return null; }
  });

  useEffect(() => {
    if (customer && !editForm) {
      setEditForm({
        phone: customer['SĐT'] || '',
        location: customer['Vị trí'] || customer['Địa chỉ'] || ''
      });
    }
  }, [customer, editForm]);

  const handleUpdate = () => {
    if (isEditing) {
      if (!editForm?.phone?.trim()) {
        alert("Số điện thoại không được để trống!");
        return;
      }
      localStorage.setItem(`customer_edit_${customerId}`, JSON.stringify(editForm));
      setIsEditing(false);
      alert("Đã cập nhật thành công");
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveNote = () => {
    localStorage.setItem(`note_${customerId}`, noteText);
    setShowNoteModal(false);
    alert("Đã lưu ghi chú");
  };

  const handleExportPDF = () => {
    const originalTitle = document.title;
    const custName = customer?.['Tên KH'] || 'Unknown';
    document.title = `KH_${customerId}_${custName}_${new Date().toLocaleDateString('vi-VN').replace(/\//g,'-')}`;
    window.print();
    document.title = originalTitle;
  };

  // Helper to format Excel Serial Dates or strings
  const parseSafeDate = (val) => {
    if (!val) return new Date(0);
    if (val instanceof Date) return val;
    if (typeof val === 'number') {
      const utc_days = Math.floor(val - 25569);
      const utc_value = utc_days * 86400;
      return new Date(utc_value * 1000);
    }
    const s = String(val).trim();
    if (s.includes('/')) {
      const parts = s.split('/');
      if (parts.length === 3) {
        // Handle DD/MM/YYYY -> YYYY-MM-DD
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const d = new Date(`${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
        if (!isNaN(d.getTime())) return d;
      }
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? new Date(0) : d;
  };

  // Helper to format Excel Serial Dates or strings
  const formatValueToDate = (val) => {
    if (!val) return 'N/A';
    const d = parseSafeDate(val);
    if (d.getTime() === 0) return String(val);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };



  // Derived RFM state using Transactions Database as GROUND TRUTH
  const rfm = useMemo(() => {
    if (!customer) return null;
    
    const targetId = String(customer['Mã KH']).trim().toUpperCase();

    // Filter actual transactions for this customer (EXACT ID MATCH - NO FUZZY)
    const myHistory = transactions.filter(t => {
      // Use the normalized field or the literal original field
      const txId = String(t['CustomerID_norm'] || t['Customer ID'] || t['Mã KH'] || '').trim().toUpperCase();
      return txId === targetId;
    });

    // --- AGGREGATE BY ORDER KEY ---
    const ordersMap = new Map();
    myHistory.forEach(tx => {
      // OrderKey unique per order
      const ok = String(tx['OrderKey'] || tx['OrderID'] || tx['Mã hóa đơn'] || Math.random()).trim();
      const rev = Number(tx['Revenue'] || tx['Thành tiền'] || tx['Tổng tiền'] || 0);
      const prod = String(tx['Product Name'] || tx['Sản phẩm'] || '').trim();
      
      if (!ordersMap.has(ok)) {
        ordersMap.set(ok, {
          orderKey: ok,
          date: tx.Date || tx['Ngày mua'] || tx['Ngày tạo'] || tx['Year'] + '-' + tx['Month'] + '-01',
          revenue: 0,
          products: new Set(),
          channel: tx['Channel_norm'] || tx['Store'] || 'Showroom'
        });
      }
      
      const o = ordersMap.get(ok);
      o.revenue += rev;
      if (prod) o.products.add(prod);
    });

    const groupedOrders = Array.from(ordersMap.values()).sort((a, b) => {
       return parseSafeDate(b.date) - parseSafeDate(a.date);
    });

    // --- METRICS CALCULATION (PRIORITIZE DATABASE ROWS) ---
    // 1. Recency
    const latestOrder = groupedOrders[0];
    const lastDate = latestOrder ? latestOrder.date : (customer['Ngày mua hàng gần nhất'] || customer['Last Purchase Date']);
    
    let rScore = 1;
    let rDays = 999;
    
    if (lastDate) {
      const d = parseSafeDate(lastDate);
      if (d.getTime() > 0) {
        const today = new Date('2026-04-21'); // Current System Time Context
        const diff = (today - d) / (1000 * 60 * 60 * 24);
        rDays = Math.max(0, Math.floor(diff));
        if (rDays <= 30) rScore = 5;
        else if (rDays <= 60) rScore = 4;
        else if (rDays <= 90) rScore = 3;
        else if (rDays <= 180) rScore = 2;
      }
    }

    // 2. Frequency (Distinct OrderKey count)
    const orders = groupedOrders.length || Number(customer['Số đơn hàng'] || customer.sodonhang || 0);
    
    let fScore = 1;
    if (orders >= 8) fScore = 5; 
    else if (orders >= 5) fScore = 4;
    else if (orders >= 3) fScore = 3;
    else if (orders >= 1) fScore = 2;

    // 3. Monetary (Sum of filtered transaction revenue)
    const spend = groupedOrders.length > 0 
      ? groupedOrders.reduce((sum, o) => sum + o.revenue, 0)
      : Number(customer['Doanh thu'] || customer.doanhthu || customer.totalspend || 0);
    
    let mScore = 1;
    if (spend >= 100000000) mScore = 5; 
    else if (spend >= 10000000) mScore = 4;
    else if (spend >= 5000000) mScore = 3;
    else if (spend >= 1000000) mScore = 2;

    const finalAov = orders > 0 ? spend / orders : spend;
    
    return { 
      rScore, fScore, mScore, 
      rDays, 
      rfmAvg: (rScore + fScore + mScore) / 3, 
      spend, 
      orders, 
      lastDateStr: formatValueToDate(lastDate), 
      history: groupedOrders, 
      aov: finalAov 
    };
  }, [customer, transactions, id]);

  const tags = useMemo(() => {
    if (!customer || !rfm) return [];
    const tList = [];
    if (rfm.spend > 10000000) tList.push("VIP Spender");
    if (rfm.rDays <= 180) tList.push("Active Buyer");
    if (rfm.rDays > 180 && rfm.rDays !== 999) tList.push("Inactive 180d+");
    if (rfm.orders >= 3) tList.push("Repeat Buyer");
    
    // Birthday Month Check
    const bdRaw = customer['Ngày sinh'] || customer.birthday;
    if (bdRaw) {
      const d = parseSafeDate(bdRaw);
      if (d.getTime() > 0 && d.getMonth() === new Date().getMonth()) {
        tList.push("Khách tháng sinh nhật");
      }
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

  // BUG 5: Read segment directly from Customer_List data
  const getSegmentStyle = () => {
    // Check various common key names for segment
    const segmentSource = 
      customer['Segment (VIP/Loyal/At Risk/Lost)'] || 
      customer['segmentviployalatrisklost'] || 
      customer['Segment'] || 
      customer['segment'];
    
    const label = segmentSource || (rfm.rfmAvg >= 4 ? 'VIP' : rfm.rfmAvg >= 3 ? 'Loyal' : rfm.rfmAvg >= 2 ? 'At Risk' : 'Lost');
    const colors = {
      'VIP': '#8854d0',
      'Loyal': '#20bf6b',
      'At Risk': '#f7b731',
      'Lost': '#eb3b5a'
    };
    return { label, color: colors[label] || '#8395a7' };
  };
  const segment = getSegmentStyle();

  return (
    <div className="page-container animate-fade-in" id="customer-detail-content">
      <style>
        {`
          @media print {
            body { background: white !important; }
            .sidebar, .nav-header, .action-buttons, button { display: none !important; }
            .main-content { width: 100% !important; margin: 0 !important; padding: 0 !important; }
            .page-container { padding: 0 !important; }
            .card { box-shadow: none !important; border: 1px solid #ddd !important; }
            .transaction-table { page-break-inside: avoid; }
            * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
          .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.5); display: flex; justify-content: center; alignItems: center; z-index: 1000;
          }
          .note-modal {
            background: white; padding: 24px; border-radius: 12px; width: 400px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.1);
          }
          .note-modal textarea {
            width: 100%; height: 120px; padding: 12px; border: 1px solid #dcdde1; border-radius: 8px; margin-bottom: 16px;
            resize: none; font-family: inherit;
          }
          .note-modal .modal-actions {
            display: flex; justify-content: flex-end; gap: 12px;
          }
        `}
      </style>
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
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={14} /> 
                        {isEditing ? (
                          <input 
                            value={editForm?.phone || ''} 
                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                            style={{ border: '1px solid #dcdde1', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', width: '120px' }}
                          />
                        ) : (editForm?.phone || customer['SĐT'] || 'Trống')}
                     </span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} /> 
                        {isEditing ? (
                          <input 
                            value={editForm?.location || ''} 
                            onChange={e => setEditForm({...editForm, location: e.target.value})}
                            style={{ border: '1px solid #dcdde1', borderRadius: '4px', padding: '2px 8px', fontSize: '13px', width: '150px' }}
                          />
                        ) : (editForm?.location || customer['Vị trí'] || customer['Địa chỉ'] || 'N/A')}
                     </span>
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
               <div style={{ fontSize: '18px', fontWeight: 800 }}>{rfm.aov.toLocaleString()} VND</div>
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
                  <div style={{ marginTop: '12px', padding: '16px', background: `${segment.color}08`, borderRadius: '12px', border: `1px dashed ${segment.color}30`, textAlign: 'center' }}>
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
                       {rfm.history && rfm.history.length > 0 ? rfm.history.map((tx, index) => (
                         <tr key={index} style={{ borderBottom: '1px solid #f8f9fa' }}>
                           <td style={{ padding: '16px 8px', fontSize: '13px' }}>{formatValueToDate(tx.date)}</td>
                           <td style={{ padding: '16px 8px' }}>
                              <span style={{ fontSize: '10px', fontWeight: 800, background: '#e0f2f1', color: '#00897b', padding: '2px 8px', borderRadius: '4px' }}>
                                 {tx.channel}
                              </span>
                           </td>
                           <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 600 }}>{Array.from(tx.products).join(', ') || 'Đơn hàng CRM'}</td>
                           <td style={{ padding: '16px 8px', fontSize: '13px', fontWeight: 700 }}>{tx.revenue.toLocaleString()} VND</td>
                         </tr>
                       )) : (
                         <tr>
                           <td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#8395a7', fontSize: '13px' }}>
                              Không tìm thấy chi tiết giao dịch trong {transactions?.length > 0 ? 'Database' : 'hệ thống'}
                           </td>
                         </tr>
                       )}
                    </tbody>
                  </table>
               </div>
            </div>

            {/* ACTIONS CARD */}
            <div className="card action-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
               <button className="btn-secondary" onClick={() => setShowNoteModal(true)}>
                 <MessageSquare size={16} /> Ghi chú
               </button>
               {hasPermission('EDIT_CUSTOMER') && (
                 <button className="btn-primary" style={{ background: isEditing ? '#20bf6b' : '#45aaf2' }} onClick={handleUpdate}>
                    <Edit2 size={16} /> {isEditing ? "Lưu thay đổi" : "Cập nhật"}
                 </button>
               )}
               {hasPermission('VIEW_REPORTS') && (
                  <button className="btn-primary" style={{ background: 'var(--text-dark)' }} onClick={handleExportPDF}>
                    <FileText size={16} /> Xuất PDF
                  </button>
               )}
               {hasPermission('DELETE_CUSTOMER') && (
                 <button className="btn-primary" style={{ background: '#eb3b5a', marginLeft: 'auto' }} onClick={() => { if(window.confirm(t('confirmDelete'))) { deleteCustomer(customerId); navigate('/sales/customers'); } }}>
                    <Trash2 size={16} /> Xóa hồ sơ
                 </button>
               )}
            </div>
         </div>
      </div>

      {/* NOTE MODAL */}
      {showNoteModal && (
        <div className="modal-overlay">
          <div className="note-modal">
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700 }}>Ghi chú khách hàng</h3>
            <textarea 
               value={noteText}
               onChange={e => setNoteText(e.target.value)}
               placeholder="Nhập ghi chú quan trọng về khách hàng..."
            />
            <div className="modal-actions">
               <button className="btn-secondary" onClick={() => setShowNoteModal(false)}>Đóng</button>
               <button className="btn-primary" onClick={handleSaveNote}>Lưu ghi chú</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
