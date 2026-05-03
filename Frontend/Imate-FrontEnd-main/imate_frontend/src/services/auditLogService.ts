import type { AuditLogParams, PaginatedAuditLogResponse, AuditLogDetailResponse } from "@/types/response/audit-log.response";
import apiClient from "./apiClient";

export const getAuditLogs = async (params: AuditLogParams) => {
  try {
    const urlParams = new URLSearchParams();

    if (params.pageNumber !== undefined) urlParams.append("pageNumber", params.pageNumber.toString());
    if (params.pageSize !== undefined) urlParams.append("pageSize", params.pageSize.toString());
    if (params.staffName) urlParams.append("staffName", params.staffName);
    if (params.entityType) urlParams.append("entityType", params.entityType);
    if (params.action) urlParams.append("action", params.action);
    if (params.searchTerm) urlParams.append("searchTerm", params.searchTerm);
    if (params.fromDate) urlParams.append("fromDate", params.fromDate);
    if (params.toDate) urlParams.append("toDate", params.toDate);
    if (params.sortBy) urlParams.append("sortBy", params.sortBy);
    if (params.sortOrder) urlParams.append("sortOrder", params.sortOrder);

    const res = await apiClient.get(`/audit-logs?${urlParams.toString()}`);
    return res.data as PaginatedAuditLogResponse;
  } catch (error) {
    console.log("error fetch audit logs: ", error);
    return null;
  }
};

export const getAuditLogFilterOptions = async () => {
  try {
    const res = await apiClient.get(`/audit-logs/filter-options`);
    return res.data as { staffNames: string[]; actions: string[]; entityTypes: string[] };
  } catch (error) {
    console.log("error fetch audit log filter options: ", error);
    return null;
  }
};

export const getAuditLogDetail = async (id: number) => {
  try {
    const res = await apiClient.get(`/audit-logs/${id}`);
    return res.data as AuditLogDetailResponse;
  } catch (error) {
    console.log("error fetch audit log detail: ", error);
    return null;
  }
};

