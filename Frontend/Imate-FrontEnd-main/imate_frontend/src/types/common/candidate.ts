export interface AppliedJobCandidate {
    id: number;
    title: string;
    companyName: string;
    companyLogo: string;
    location: string;
    employmentType: string;
    minSalary: number;
    maxSalary: number;
    appliedDate: string;
    status: string;
    feedback?: string;
}

export interface AppliedJobCandidateResponse {
    items: AppliedJobCandidate[];
    totalCount: number;
    totalPages: number;
    pageNumber: number;
}

export interface GetAppliedCandidateJobs {
    searchTerm?: string;
    status?: string;
    pageNumber?: number;
    pageSize?: number;
}