import type { Skill } from "../model/skill.model";

export interface ListSkillResponse {
  items: Skill[];
  total: number;
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
