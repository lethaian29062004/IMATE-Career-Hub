export interface GetPaginationRangeProps {
  currentPage: number;
  totalPage: number;
  siblingCount?: number;
}

export type PaginationRange = (number | "dots")[];


export interface PagedResponse<T> {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  items: T[];
}

export interface CommonParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  positionId?: number;
  positionName?: string;
  skillName?: string;
  companyName?: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}