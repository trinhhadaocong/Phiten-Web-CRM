export const ROLES = {
  ADMIN: 'admin',         // Toàn quyền — CTO/Owner
  MANAGER: 'manager',     // CRM Manager — Xem tất cả trừ Settings
  CS: 'cs',               // CS Staff — Chỉ Dashboard + Khách hàng
  SALES: 'sales'          // Sales Staff — Dashboard + KH + Cơ hội
};

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CS, ROLES.SALES],
  VIEW_DASHBOARD_FULL: [ROLES.ADMIN, ROLES.MANAGER],  // Alert banner + Campaign widgets restricted

  // Customers (Sales > Customers)
  VIEW_CUSTOMERS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CS, ROLES.SALES],
  EDIT_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.CS],
  DELETE_CUSTOMER: [ROLES.ADMIN], // Strictly Admin only for data integrity
  EXPORT_CUSTOMERS: [ROLES.ADMIN, ROLES.MANAGER],

  // Reports & Analysis (Sales > Reports)
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_GROUP_IDS: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_KPI_SCORECARD: [ROLES.ADMIN, ROLES.MANAGER],
  EXPORT_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],

  // Opportunities (Sales > Pipeline)
  VIEW_OPPORTUNITIES: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES],
  EDIT_OPPORTUNITY: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES],
  DELETE_OPPORTUNITY: [ROLES.ADMIN], // Admin only

  // Marketing
  VIEW_MARKETING: [ROLES.ADMIN, ROLES.MANAGER],
  EDIT_CAMPAIGN: [ROLES.ADMIN, ROLES.MANAGER],

  // Analytics (RFM)
  VIEW_ANALYTICS: [ROLES.ADMIN, ROLES.MANAGER],

  // Settings
  VIEW_SETTINGS: [ROLES.ADMIN], // Manager excluded as per instruction

  // Clients (B2B)
  VIEW_CLIENTS: [ROLES.ADMIN, ROLES.MANAGER], // Sales excluded as per "Dashboard+KH+Opport" instruction
  EDIT_CLIENT: [ROLES.ADMIN, ROLES.MANAGER],
};
