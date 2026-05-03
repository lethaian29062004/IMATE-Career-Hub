
export interface JobItem {
  id: number;
  title: string;
  employmentType: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  applicationDeadline: string;
  status: string;
  jobDescription: string;
  jobSkills: { id: number; skillName: string }[];
  jobPositions: { id: number; positionName: string }[];
}

export interface GetJobApplicationsRequest {
  searchTerm?: string;
  location?: string;
  employmentType?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface JobResponse {
  items: JobItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}

export interface GetAppliedCandidateRequest {
  jobId: number;
  searchTerm?: string;
  status?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface AppliedCandidateItem {
  applicationId: number;
  appliedDate: string;
  status: string;
  recruiterFeedback?: string;

  candidateId: number;
  candidateFullName: string;
  candidateEmail: string;

  candidateFileUrl: string;
  candidateFileName: string;
  candidateScannedData: string;
}

export interface AppliedCandidateResponse {
  items: AppliedCandidateItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}

export interface Company {
  companyName: string;
  companyLogo: string;
  website: string;
  companySize: number;
  phone: string;
  address: string;
  industry: string;
  email: string;
}

export interface CandidateJobItem {
  id: number;
  title: string;
  jobDescription: string;
  employmentType: string;
  location: string;
  minSalary: number;
  maxSalary: number;
  applicationDeadline: string;
  jobSkills: { id: number; skillName: string }[];
  jobPositions: { id: number; positionName: string }[];
  companyRecruiter: Company;
}

export interface CandidateJobListResponse {
  items: CandidateJobItem[];
  totalCount: number;
  totalPages: number;
  pageNumber: number;
}

export interface GetCandidateJobListRequest {
  searchTerm?: string;
  location?: string;
  employmentType?: string;
  jobSkillIds?: number[];
  jobPositionIds?: number[];
  pageNumber?: number;
  pageSize?: number;
}
