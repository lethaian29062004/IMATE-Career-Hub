import type { Company } from "../model/company.model";

// export interface FormAddCompanyRequest {
//   name: string;
//   imageFile: File | null;
// }

// export interface FormUpdateCompanyRequest {
//   name: string;
//   newImageFile: File | null;
// }

// api addCompany to staff  /api/staff-create-company
export type FormAddCompanyRequest = Pick<Company, "name"> & {
  name: string;
  imageFile: File | null;
};
// /api/company-staff/{id}
export type FormUpdateCompanyRequest = Pick<Company, "name" | "isActive"> & {
  name: string;
  newImageFile: File | null;
  isActive: boolean;
};
