import React, { createContext, useContext, useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const CRMContext = createContext();

export const useCRMData = () => {
  return useContext(CRMContext);
};

export const CRMProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [clients, setClients] = useState([]);
  
  // Settings Module
  const defaultSettings = {
    profile: {
      companyName: "Phiten Vietnam",
      currency: "VND"
    },
    pipelines: [
      { id: 1, name: "Prospecting", color: "#3498db" },
      { id: 2, name: "Proposal", color: "#f39c12" },
      { id: 3, name: "Negotiation", color: "#9b59b6" },
      { id: 4, name: "Closed Won", color: "#2ecc71" },
      { id: 5, name: "Closed Lost", color: "#e74c3c" }
    ],
    dropdowns: {
      channels: ["Zalo", "Website", "Facebook", "Shopee", "Lazada", "Tiki", "Chiaki", "Tiktok", "Showroom", "Event", "Outright", "Collaboration", "Consignment"],
      members: ["SILVER", "GOLD", "DIAMOND", "PLATINUM", "JHB LOYALTY MEMBER", "NON"],
      owners: ["Lucy Tan", "Andy Chen", "John Doe", "System"]
    }
  };
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('crmSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [globalSearch, setGlobalSearch] = useState('');
  const [language, setLanguage] = useState('en');

  const translations = {
    en: {
      dashboard: "Dashboard", sales: "Sales", opportunities: "Opportunities",
      customers: "Customers", reportsAnalysis: "Reports & Analysis",
      marketing: "Marketing", clients: "Clients", analytics: "Analytics",
      setting: "Setting", moreService: "MORE SERVICE", helpDesk: "HELP DESK",
      searchPlaceholder: "Search customers by name...",
      totalRevenue: "Total Revenue", totalQuantity: "Total Opportunities",
      numberOrders: "Number of Orders", averageOrder: "Average Order Value",
      customerCount: "Customer Count", yearToDate: "Year-to-date",
      revenueTrends: "Overall Revenue Trends",
      customerGenesis: "Customer Distribution (Gender)",
      memberSegments: "Member Segments", birthdaysThisMonth: "Birthdays This Month",
      allTime: "All Time", byYear: "By Year", custom: "Custom Range",
      to: "to", filteringData: "Filtered", orders: "orders",
      noBirthdays: "No birthdays this month.",
      addOpportunity: "ADD OPPORTUNITY", bulkExport: "BULK EXPORT",
      stageAll: "Stage: All", items: "Item(s)",
      opportunityName: "Opportunity Name", expectedRevenue: "Expected Revenue",
      stage: "Stage", closeDate: "Close Date", assignee: "Assignee",
      addNewOpportunity: "Add New Opportunity", basicInfo: "Basic Info",
      transaction: "Transaction", oppNameLabel: "Opportunity Name",
      customerIdLabel: "Customer ID", expectedRevenueLabel: "Expected Revenue (VND)",
      stageLabel: "Stage (Funnel)", expectedCloseDateLabel: "Expected Close Date (DD/MM/YYYY)",
      assigneeLabel: "Assignee", saveOpportunity: "Save Opportunity", cancel: "Cancel",
      oppNamePlaceholder: "e.g. Showroom HCM Retail",
      customerIdPlaceholder: "e.g. KH001 (leave blank = auto)",
      revenuePlaceholder: "e.g. 5000000", closeDatePlaceholder: "e.g. 31/12/2026",
      validationOppName: "Please enter opportunity name",
      validationRevenue: "Please enter a valid revenue",
      addCustomer: "ADD CUSTOMER", importExcel: "IMPORT EXCEL",
      channelAll: "Channel: All", accountAll: "Account: All",
      custName: "Customer Name", phone: "Phone", location: "Location",
      gender: "Gender", member: "Member", source: "Source", actions: "Actions",
      noResults: "No results found.", totalItems: "Total items",
      editCustomer: "Edit / Customer Details", addNewCustomer: "Add New Customer",
      basicInfoTab: "Basic Info", crmClassTab: "CRM Classification",
      update: "Update", save: "Save", required: "Required",
      requiredOr: "Required (or Unnamed)", locationRequired: "Location required",
      phoneNumOnly: "Phone must be numbers only", invalidEmail: "Invalid email format",
      confirmDelete: "Are you sure you want to delete this customer?",
      importFullData: "IMPORT FULL DATA", exportFullData: "EXPORT FULL DATA",
      totalSalesPipeline: "Total Sales (Pipeline)",
      totalSaleOpps: "Total Sale Opportunities", avgSalesPerDeal: "Average Sales per Deal",
      salesTrend: "Sales Trend (Millions VND)",
      customerAnalysis: "Customer Analysis (Purchasing Behavior)",
      totalCustomers: "Total Customers", newCustomersMonth: "New Customers This Month",
      rfmTitle: "RFM Analysis (Recency, Frequency, Monetary)",
      segmentDistribution: "Distribution by Segment",
      revenueBucket: "Revenue Bucket Distribution",
      salesForecast: "Sales Forecast (Next 3 Months)",
      topROIChannels: "Top ROI Channels",
      top10KeyCustomers: "Top 10 Key Customers (Highest Monetary)",
      rank: "Rank", totalMonetary: "Total Monetary (VND)",
      home: "Home", aiAnalyticsCenter: "AI Analytics Center",
      settingsTitle: "System Settings", units: "units",
      updated: "Updated", new: "New", totalUsers: "Total Users",
      millionsVND: "Millions VND",
      // Clients
      companyName: "Company Name", taxCode: "Tax Code",
      officeAddress: "Office Address", legalRep: "Legal Representative",
      addClient: "ADD CLIENT", addNewClient: "Add New Client", editClient: "Edit Client", saveClient: "Save Client",
      staffList: "Staff", close: "Close", export: "EXPORT", staff: "Staff",
      occupation: "Occupation",
      companyNamePlaceholder: "e.g. Phiten Vietnam Co., Ltd",
      // Settings
      settingsSaved: "Settings saved successfully!",
      saveChanges: "SAVE CHANGES",
      companyProfile: "Company Profile",
      companyBranch: "Company / Branch Name",
      currency: "Standard Currency",
      pipelineConfig: "Pipeline Configuration",
      addStage: "Add Stage",
      pipelineDesc: "Arrange and name the stages in your Sales Opportunities pipeline.",
      masterDropdown: "Master Dropdown (Form Categories)",
      masterDropdownDesc: "Values here will be automatically synced to all Add/Edit Form selects.",
      channelDropdown: "Acquisition Channel",
      memberDropdown: "Member Segments",
      ownerDropdown: "Assignees",
    },
    vi: {
      dashboard: "Trang chủ", sales: "Bán hàng", opportunities: "Cơ hội Giao dịch",
      customers: "Khách hàng", reportsAnalysis: "Báo cáo & Phân tích",
      marketing: "Tiếp thị", clients: "Hồ sơ công ty", analytics: "Phân tích RFM",
      setting: "Cấu hình hệ thống", moreService: "DỊCH VỤ THÊM", helpDesk: "TRỢ GIÚP",
      searchPlaceholder: "Tìm kiếm khách hàng (Tên)...",
      totalRevenue: "Tổng Doanh Thu", totalQuantity: "Tổng Cơ Hội",
      numberOrders: "Số Lượng Đơn", averageOrder: "Giá trị Đơn TB",
      customerCount: "Lượng Khách Hàng", yearToDate: "Tính từ đầu năm",
      revenueTrends: "Xu Hướng Doanh Thu",
      customerGenesis: "Phân Bố Khách (Giới Tính)",
      memberSegments: "Phân Khúc Thành Viên", birthdaysThisMonth: "Sinh Nhật Trong Tháng",
      allTime: "Tất cả thời gian", byYear: "Theo Năm", custom: "Tùy chỉnh",
      to: "đến", filteringData: "Đang lọc", orders: "đơn hàng",
      noBirthdays: "Không có sinh nhật tháng này.",
      addOpportunity: "THÊM CƠ HỘI", bulkExport: "XUẤT DỮ LIỆU",
      stageAll: "Giai đoạn: Tất cả", items: "Mục",
      opportunityName: "TÊN CƠ HỘI", expectedRevenue: "Doanh Thu Dự Kiến",
      stage: "Giai Đoạn", closeDate: "Ngày Chốt", assignee: "Người Phụ Trách",
      addNewOpportunity: "Thêm CƠ HỘI Mới", basicInfo: "Thông tin cơ bản",
      transaction: "Giao dịch", oppNameLabel: "Tên cơ hội",
      customerIdLabel: "Mã khách hàng (ID)", expectedRevenueLabel: "Giá trị dự kiến (VNĐ)",
      stageLabel: "Giai đoạn (Phễu)", expectedCloseDateLabel: "Ngày mua hàng đầu tiên (DD/MM/YYYY)",
      assigneeLabel: "Người phụ trách", saveOpportunity: "Lưu cơ hội", cancel: "Hủy",
      oppNamePlaceholder: "Ví dụ: Bán lẻ Showroom HCM",
      customerIdPlaceholder: "Ví dụ: KH001 (để trống = tự động)",
      revenuePlaceholder: "Ví dụ: 5000000", closeDatePlaceholder: "Ví dụ: 31/12/2026",
      validationOppName: "Vui lòng nhập tên cơ hội",
      validationRevenue: "Vui lòng nhập giá trị hợp lệ",
      addCustomer: "THÊM KHÁCH HÀNG", importExcel: "NHẬP EXCEL",
      channelAll: "Kênh: Tất cả", accountAll: "Tài khoản: Tất cả",
      custName: "Tên KH", phone: "SĐT", location: "Vị trí",
      gender: "Giới tính", member: "Thành viên", source: "Nguồn", actions: "Thao tác",
      noResults: "Không tìm thấy kết quả.", totalItems: "Tổng mục",
      editCustomer: "Sửa / Chi tiết Khách Hàng", addNewCustomer: "Thêm Khách Hàng Mới",
      basicInfoTab: "Thông tin cơ bản", crmClassTab: "Phân loại CRM",
      update: "Cập nhật", save: "Lưu", required: "Bắt buộc nhập",
      requiredOr: "Bắt buộc nhập (hoặc Unnamed)", locationRequired: "Vị trí bắt buộc",
      phoneNumOnly: "SĐT phải là số", invalidEmail: "Email sai định dạng",
      confirmDelete: "Bạn có chắc chắn muốn xóa khách hàng này?",
      importFullData: "NHẬP DỮ LIỆU ĐẦY ĐỦ", exportFullData: "XUẤT DỮ LIỆU ĐẦY ĐỦ",
      totalSalesPipeline: "Tổng Doanh Thu (Pipeline)",
      totalSaleOpps: "Tổng Cơ Hội Bán Hàng", avgSalesPerDeal: "Doanh Thu TB / Giao Dịch",
      salesTrend: "Xu Hướng Doanh Thu (Triệu VNĐ)",
      customerAnalysis: "Phân Tích Khách Hàng (Hành Vi Mua)",
      totalCustomers: "Tổng Khách Hàng", newCustomersMonth: "Khách Hàng Mới Tháng Này",
      rfmTitle: "Phân tích RFM (Recency, Frequency, Monetary)",
      segmentDistribution: "Phân bố theo Phân hạng (Segment)",
      revenueBucket: "Tỷ trọng Doanh thu (Revenue Bucket)",
      salesForecast: "Dự báo Doanh thu (3 Tháng Tới)",
      topROIChannels: "Top Kênh ROI",
      top10KeyCustomers: "Top 10 Khách Hàng Chìa Khóa (Monetary Cao Nhất)",
      rank: "Hạng", totalMonetary: "Tổng Doanh Thu (VNĐ)",
      home: "Trang chủ", aiAnalyticsCenter: "Trung Tâm Phân Tích AI",
      settingsTitle: "Cấu hình hệ thống", units: "đơn vị",
      updated: "Cập nhật", new: "Mới", totalUsers: "Tổng Users",
      millionsVND: "Triệu VNĐ",
      // Clients
      companyName: "Tên công ty", taxCode: "Mã số thuế",
      officeAddress: "Địa chỉ văn phòng", legalRep: "Người đại diện pháp luật",
      addClient: "THÊM CÔNG TY", addNewClient: "Thêm Công Ty Mới", editClient: "Sửa Công Ty", saveClient: "Lưu công ty",
      staffList: "Nhân sự", close: "Đóng", export: "XUẤT", staff: "Nhân sự",
      occupation: "Nghề nghiệp",
      companyNamePlaceholder: "Ví dụ: Công ty TNHH Phiten",
      // Settings
      settingsSaved: "Cấu hình đã được lưu thành công!",
      saveChanges: "Lưu thay đổi",
      companyProfile: "Hồ sơ Công ty",
      companyBranch: "Tên công ty / Chi nhánh",
      currency: "Tiền tệ chuẩn",
      pipelineConfig: "Cấu hình Phễu (Pipelines)",
      addStage: "Thêm giai đoạn",
      pipelineDesc: "Sắp xếp và đặt tên các chặng trong pipeline Cơ Hội Bán Hàng.",
      masterDropdown: "Master Dropdown (Cấu hình danh mục Form)",
      masterDropdownDesc: "Các giá trị tại đây sẽ được đồng bộ vào các thẻ Select trong Form Thêm/Sửa.",
      channelDropdown: "Kênh đến (Channel)",
      memberDropdown: "Thành viên (Segments)",
      ownerDropdown: "Người phụ trách",
    }
  };

  const t = (key) => translations[language]?.[key] || translations['en'][key] || key;

  useEffect(() => {
    localStorage.setItem('crmSettings', JSON.stringify(settings));
  }, [settings]);

  // Persist Customers and Clients to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('crmCustomers', JSON.stringify(customers));
    }
  }, [customers, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('crmClients', JSON.stringify(clients));
    }
  }, [clients, loading]);

  const fetchFromAPI = async () => {
    // API URL usually relative to root if hosted on same domain, or full URL
    const API_URL = '/backend/api.php'; 
    const API_KEY = 'PhitenCRM_Secure_Key_2026';
    
    const resp = await fetch(API_URL, {
      headers: { 'X-API-Key': API_KEY }
    });
    
    if (!resp.ok) throw new Error('Không thể kết nối API backend');
    const data = await resp.json();
    if (data.error) throw new Error(data.error);

    return data.map(item => ({
      'Mã KH': item.customer_id,
      'Tên KH': item.name,
      'SĐT': item.phone,
      'Email': item.email,
      'Địa chỉ': item.address,
      'Vị trí': item.location,
      'Giới tính': item.gender,
      'Ngày sinh': item.birthday,
      'Ngày vào thành viên': item.member_date,
      'Thành viên': item.membership,
      'Trạng thái': item.status,
      'Môn thể thao': item.sports,
      'Kênh': item.channel,
      'Tài khoản': item.account,
      'Zalo OA': item.zalo_oa,
      'Bệnh lý': item.medical,
      'Nghề nghiệp': item.job,
      'Khách nước ngoài': item.foreign_cust,
      'Ghi chú': item.note,
      'Người phụ trách': item.assignee,
      'Doanh thu': Number(item.revenue),
      'Giai đoạn': item.stage,
      'Ngày mua hàng đầu tiên': item.first_purchase_date,
      'Ngày mua hàng gần nhất': item.last_purchase_date
    }));
  };

  const deriveOpps = (data) => {
    const parseExcelDate = (dateVal) => {
      if (!dateVal) return '';
      if (typeof dateVal === 'number') {
          const utc_days = Math.floor(dateVal - 25569);
          const utc_value = utc_days * 86400;
          const d = new Date(utc_value * 1000);
          return `${d.getUTCDate().toString().padStart(2, '0')}/${(d.getUTCMonth()+1).toString().padStart(2, '0')}/${d.getUTCFullYear()}`;
      }
      return dateVal.toString();
    };

    return data.filter(c =>
        c['Doanh thu'] !== undefined &&
        c['Doanh thu'] !== null &&
        String(c['Doanh thu']).trim() !== '' &&
        Number(c['Doanh thu']) > 0
      )
      .map(c => ({
        id: c['Mã KH'],
        name: c['Tên KH'] || 'Opportunity',
        status: c['Giai đoạn'] || 'Closed Won',
        revenue: Number(c['Doanh thu']) || 0,
        expCloseDate: parseExcelDate(c['Ngày mua hàng đầu tiên']),
        lastPurchaseDate: parseExcelDate(c['Ngày mua hàng gần nhất']),
        owner: c['Người phụ trách'] || '',
        gender: c['Giới tính'] || ''
      }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. ƯU TIÊN: Lấy dữ liệu từ API Hostinger
        console.log("Fetching from API...");
        const apiData = await fetchFromAPI();
        setCustomers(apiData);
        setOpportunities(deriveOpps(apiData));
        setLoading(false);
        return;
      } catch (apiErr) {
        console.warn("API Fetch failed, trying localStorage...", apiErr);
        
        // 2. FALLBACK 1: Kiểm tra localStorage
        const savedCustomers = localStorage.getItem('crmCustomers');
        if (savedCustomers) {
          try {
            const parsed = JSON.parse(savedCustomers);
            setCustomers(parsed);
            setOpportunities(deriveOpps(parsed));
            setLoading(false);
            return;
          } catch (e) { console.error("Stored data corrupted"); }
        }

        // 3. FALLBACK 2: Lấy dữ liệu từ file tĩnh data.xlsx
        try {
          const response = await fetch('/data.xlsx');
          if (!response.ok) throw new Error('File data.xlsx không tìm thấy');
          const arrayBuffer = await response.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const custSheet = workbook.Sheets['Customers'] || workbook.Sheets[workbook.SheetNames[0]];
          const custData = XLSX.utils.sheet_to_json(custSheet) || [];
          
          setCustomers(custData);
          setOpportunities(deriveOpps(custData));
        } catch (fileErr) {
          setError("Không thể tải dữ liệu từ bất kỳ nguồn nào.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addCustomer = (newCustomer) => {
    if (!newCustomer['Mã KH']) newCustomer['Mã KH'] = `NEW${Math.floor(Math.random() * 1000)}`;
    setCustomers([newCustomer, ...customers]);
  };
  const updateCustomer = (updatedCustomer) => setCustomers(prev => prev.map(c => c['Mã KH'] === updatedCustomer['Mã KH'] ? updatedCustomer : c));
  const deleteCustomer = (customerId) => setCustomers(prev => prev.filter(c => c['Mã KH'] !== customerId));
  
  const addClient = (newClient) => setClients([newClient, ...clients]);
  const updateClient = (updatedClient) => setClients(prev => prev.map(c => c['Mã số thuế'] === updatedClient['Mã số thuế'] ? updatedClient : c));
  const deleteClient = (taxId) => setClients(prev => prev.filter(c => c['Mã số thuế'] !== taxId));

  const addOpportunity = (newOpp) => setOpportunities([newOpp, ...opportunities]);

  const importData = (importedData) => {
    setCustomers(prev => [...importedData, ...prev]);
  };

  const exportData = () => {
    console.log("Starting exportData...");
    try {
      if (!customers || customers.length === 0) {
        console.warn("No customers to export");
      }
      
      const custSheet = XLSX.utils.json_to_sheet(customers);
      console.log("CustSheet generated");
      
      const oppsSheet = XLSX.utils.json_to_sheet(opportunities);
      console.log("OppsSheet generated");
      
      const clientSheet = XLSX.utils.json_to_sheet(clients);
      console.log("ClientSheet generated");
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, custSheet, "Customers");
      XLSX.utils.book_append_sheet(workbook, oppsSheet, "Opportunities");
      XLSX.utils.book_append_sheet(workbook, clientSheet, "Clients");
      
      console.log("Writing file: Full_CRM_Data.xlsx");
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Phiten_CRM_Data_Latest.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log("Export successful");
    } catch (err) {
      console.error("Export failed:", err);
      alert("Lỗi xuất file: " + err.message);
    }
  };

  const value = React.useMemo(() => ({ 
        customers, loading, error, opportunities, clients, settings, setSettings,
        addCustomer, updateCustomer, deleteCustomer, 
        addClient, updateClient, deleteClient,
        importData, exportData, 
        addOpportunity,
        globalSearch, setGlobalSearch,
        language, setLanguage, t
  }), [
    customers, loading, error, opportunities, clients, settings,
    globalSearch, language
  ]);

  return (
    <CRMContext.Provider value={value}>
      {error && <div style={{background: '#eb3b5a', color: 'white', padding: '12px 24px', textAlign: 'center', fontWeight: 600}}>{error}</div>}
      {children}
    </CRMContext.Provider>
  );
};
