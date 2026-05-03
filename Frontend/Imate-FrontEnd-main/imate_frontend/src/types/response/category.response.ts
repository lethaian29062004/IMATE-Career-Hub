export interface ListCategoryResponse {
  items: {
    id: number;
    name: string;
    isActive: boolean;
    questionCount: number;
  }[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
