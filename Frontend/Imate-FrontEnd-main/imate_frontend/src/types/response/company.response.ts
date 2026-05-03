import type { Company } from "../model/company.model";

export interface ListCompanyResponse {
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  items: Company[];
}
//fix tam loi company items
export interface CompanyItem extends Company {}
