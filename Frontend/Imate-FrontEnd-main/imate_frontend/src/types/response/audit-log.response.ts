export interface AuditLogListResponse {
  id: number;
  staffName: string;
  staffEmail: string;
  action: string;
  entityType: string;
  actionTime: string;
  oldValue?: any;
  newValue?: any;
}

export interface AuditLogDetailResponse {
  id: number;
  staffName: string;
  staffEmail: string;
  action: string;
  entityType: string;
  entityId: number;
  actionTime: string;
  createdAt: string;
  updatedAt?: string;
  oldValue?: any;
  newValue?: any;
}

export interface PaginatedAuditLogResponse {
  items: AuditLogListResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AuditLogParams {
  pageNumber?: number;
  pageSize?: number;
  staffName?: string;
  entityType?: string;
  action?: string;
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface AuditLogFilterOptions {
  staffNames: string[];
  actions: string[];
  entityTypes: string[];
}

