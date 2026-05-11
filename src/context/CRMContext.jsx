import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

const CRMContext = createContext();

export const useCRMData = () => useContext(CRMContext);

export const CRMProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [rawCustomers, setRawCustomers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState('vi');
  const [globalSearch, setGlobalSearch] = useState('');

  const getVal = (row, keys) => {
    const rowKeys = Object.keys(row);
    for (const k of keys) {
      const match = rowKeys.find(rk => rk.toLowerCase().replace(/[^a-z0-9]/g, '') === k.toLowerCase().replace(/[^a-z0-9]/g, ''));
      if (match !== undefined) return row[match];
    }
    return undefined;
  };

  const normalizeData = useCallback((dbRaw, clRaw, rcRaw) => {
    // 1. Transactions - Ground Truth for Dashboard & Reports
    const db = dbRaw.map(r => ({
      ...r,
      CustomerID: String(getVal(r, ['CustomerID', 'Customer ID', 'Mã KH']) || '').trim(),
      CustomerID_norm: String(getVal(r, ['CustomerID_norm', 'CustomerID']) || '').trim(),
      Revenue: Number(getVal(r, ['Revenue', 'Thành tiền', 'ThanhTien']) || 0) || 0,
      Year: Number(getVal(r, ['Year']) || 0) || new Date().getFullYear(),
      Month: Number(getVal(r, ['Month']) || 0) || (new Date().getMonth() + 1),
      OrderKey: String(getVal(r, ['OrderKey', 'OrderID', 'Mã hóa đơn']) || ''),
      Channel_norm: String(getVal(r, ['Channel_norm', 'Channel', 'Kênh']) || 'Showroom'),
      DOB: String(getVal(r, ['Day of Birthday', 'DOB', 'Ngày sinh']) || ''),
      FullName: String(getVal(r, ['Full Name', 'Name']) || '')
    }));

    // 2. Customer List - Primary Benchmarks
    const cl = clRaw.map(r => ({
      ...r,
      CustomerID: String(getVal(r, ['CustomerID', 'Customer ID', 'Mã KH']) || '').trim(),
      Name: String(getVal(r, ['Name', 'Malee', 'Full Name', 'Tên KH']) || 'Unknown'),
      Phone: String(getVal(r, ['Phone', 'SĐT']) || ''),
      TotalSpend: Number(getVal(r, ['Total Spend', 'Doanh thu', 'TotalRevenue', 'Total Revenue']) || 0) || 0,
      Orders: Number(getVal(r, ['Number of Orders', 'Số đơn hàng', 'TotalOrders', 'Total Orders']) || 0) || 0,
      Segment: String(getVal(r, ['Segment (VIP/Loyal/At Risk/Lost)', 'Segment']) || 'Lost'),
      Active: String(getVal(r, ['Active (12m) [auto]', 'Active']) || '').toLowerCase() === 'yes' || Number(getVal(r, ['Active (12m) [auto]', 'Active'])) === 1 || (getVal(r, ['ChurnFlag']) !== undefined && Number(getVal(r, ['ChurnFlag'])) === 0),
      Repeat: String(getVal(r, ['Repeat Customer [auto]', 'RepeatFlag', 'Repeat']) || '').toLowerCase() === 'yes' || Number(getVal(r, ['Repeat Customer [auto]', 'RepeatFlag', 'Repeat'])) === 1,
      Store: String(getVal(r, ['Store', 'Vị trí', 'LastChannel']) || 'Showroom'),
      Channel: String(getVal(r, ['Channel (Retail/Online/B2B)', 'Channel', 'LastChannel']) || 'Retail'),
      FirstPurchaseDate: getVal(r, ['First Purchase Date', 'Ngày mua đầu tiên', 'FirstOrderDate']) || '',
      LastPurchaseDate: getVal(r, ['Last Purchase Date', 'Ngày mua gần nhất', 'LastOrderDate']) || ''
    }));

    // 3. Profiles - Extended Info
    const rc = rcRaw.map(r => ({
      ...r,
      CustomerID: String(getVal(r, ['CustomerID', 'Customer ID', 'Mã KH']) || '').trim(),
      Email: String(getVal(r, ['Email', 'E-mail']) || ''),
      Address: String(getVal(r, ['Add', 'Address', 'Địa chỉ']) || ''),
      Gender: String(getVal(r, ['Gender', 'Giới tính']) || 'Nữ'),
      MemberDate: getVal(r, ['Date of Member', 'Ngày thành viên']),
      Loyalty: String(getVal(r, ['Loyalty', 'Thành viên']) || 'NON'),
      Status: String(getVal(r, ['Statuss', 'Tình trạng']) || 'Success')
    }));

    // 4. Unified Customers - THE SINGLE SOURCE FOR ALL UI
    const unified = cl.map(c => {
        const profile = rc.find(p => p.CustomerID === c.CustomerID) || {};
        return {
            ...c,
            ...profile,
            // Mapping for components expecting these specific keys
            'Mã KH': c.CustomerID,
            'Tên KH': c.Name,
            'SĐT': c.Phone,
            'Doanh thu': c.TotalSpend,
            'Số đơn hàng': c.Orders,
            'Vị trí': c.Store,
            'Channel': c.Channel,
            'Segment': c.Segment,
            'Thành viên': profile.Loyalty || 'NON',
            'Giới tính': profile.Gender || 'Nữ',
            'Tình trạng': profile.Status || 'Success',
            'Địa chỉ': profile.Address || '',
            'Ngày sinh': profile.DOB || c.DOB || '',
            'Ngày Thành Viên': profile.MemberDate || '',
            'E-mail': profile.Email || ''
        };
    });

    // 5. Opportunities - Driven by transaction totals
    const opps = unified.filter(c => c['Doanh thu'] > 0).map(c => ({
        id: c['Mã KH'],
        name: c['Tên KH'],
        status: c['Tình trạng'],
        revenue: c['Doanh thu'],
        expCloseDate: c.FirstPurchaseDate,
        lastPurchaseDate: c.LastPurchaseDate,
        owner: 'System'
    }));

    return { db, cl, rc, unified, opps };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      let dbRaw = [];
      try { dbRaw = JSON.parse(localStorage.getItem('crm_database') || '[]'); } 
      catch (e) { localStorage.removeItem('crm_database'); }
      
      let clRaw = [];
      try { clRaw = JSON.parse(localStorage.getItem('crm_customerList') || '[]'); }
      catch (e) { localStorage.removeItem('crm_customerList'); }
      
      let rcRaw = [];
      try { rcRaw = JSON.parse(localStorage.getItem('crm_rawCustomers') || '[]'); }
      catch (e) { localStorage.removeItem('crm_rawCustomers'); }

      // Auto-load if empty
      if (dbRaw.length === 0 && clRaw.length === 0) {
        try {
          const response = await fetch('/data.xlsx');
          if (response.ok) {
            const data = await response.arrayBuffer();
            const wb = XLSX.read(data, { type: 'array' });
            
            const dbSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('database'))];
            const clSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('customer_list') || n.toLowerCase().includes('customer_level'))];
            const rcSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('customers') && !n.toLowerCase().includes('list') && !n.toLowerCase().includes('level'))];

            dbRaw = XLSX.utils.sheet_to_json(dbSheet || []);
            clRaw = XLSX.utils.sheet_to_json(clSheet || []);
            rcRaw = XLSX.utils.sheet_to_json(rcSheet || []);
            
            if (dbRaw.length > 0) {
              try {
                // Try to persist but don't crash if it fails
                localStorage.setItem('crm_database', JSON.stringify(dbRaw));
                localStorage.setItem('crm_customerList', JSON.stringify(clRaw));
                localStorage.setItem('crm_rawCustomers', JSON.stringify(rcRaw));
              } catch (storageErr) {
                console.warn('Persistence to localStorage failed (quota exceeded). Continuing with in-memory data.');
              }
            }
          }
        } catch (e) {
          console.warn('Auto-load data.xlsx failed:', e);
        }
      }

      if (dbRaw.length > 0 || clRaw.length > 0) {
        const { db, cl, rc, unified, opps } = normalizeData(dbRaw, clRaw, rcRaw);
        setTransactions(db);
        setCustomerList(cl);
        setRawCustomers(rc);
        setCustomers(unified);
        setOpportunities(opps);
      }
      setError(null);
    } catch (err) {
      console.error("CRMContext load error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const uploadExcel = async (file) => {
    setLoading(true);
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: 'array' });
      const dbSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('database'))];
      const clSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('customer_list') || n.toLowerCase().includes('customer_level'))];
      const rcSheet = wb.Sheets[wb.SheetNames.find(n => n.toLowerCase().includes('customers') && !n.toLowerCase().includes('list') && !n.toLowerCase().includes('level'))];

      const dbRaw = XLSX.utils.sheet_to_json(dbSheet || {});
      const clRaw = XLSX.utils.sheet_to_json(clSheet || {});
      const rcRaw = XLSX.utils.sheet_to_json(rcSheet || {});

      try {
        localStorage.setItem('crm_database', JSON.stringify(dbRaw));
        localStorage.setItem('crm_customerList', JSON.stringify(clRaw));
        localStorage.setItem('crm_rawCustomers', JSON.stringify(rcRaw));
      } catch (storageErr) {
        console.warn('Persistence to localStorage failed (quota exceeded). Using in-memory data for this session.');
      }

      const { db, cl, rc, unified, opps } = normalizeData(dbRaw, clRaw, rcRaw);
      setTransactions(db);
      setCustomerList(cl);
      setRawCustomers(rc);
      setCustomers(unified);
      setOpportunities(opps);
      return { success: true, dbCount: db.length, clCount: cl.length };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const t = (key) => key; // Keeping mapping placeholder

  const value = {
    transactions, customerList, rawCustomers, customers, opportunities, clients,
    loading, error, globalSearch, setGlobalSearch, language, setLanguage, t,
    uploadExcel, fetchData
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};
