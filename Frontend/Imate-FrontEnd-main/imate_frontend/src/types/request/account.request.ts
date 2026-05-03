/**
 * request => interface hứng request
 * response => interface hứng response
 * common => interface hứng các type tái sử dụng như pagnititon,
 * model.ts => ...
 * bài toán ở đây là : categoryResponse => categoryRequest
 * nhưng khi add question sử dụng đến dùng categoryResponse để list checkbox còn khi submit lại cần mỗi "id" cua category
 * tương tự sẽ có table tương tự trường hợp này như skill, postition,
 *
 *
 *
 *
 *
 *
 *
 */
// Tên interface có thể theo kiểu [Action][Entity][Request].
export interface AccountRequest {
  id: number;
  status: string;
}
export interface AccountAddStaffRequest {
  fullName: string;
  email: string;
}
export interface UpdateProfileRequest {
  fullName: string;
  avatarFile: File | null | undefined; 
}