import type { Position } from "../model/position.model";
export type PositionResponse = Position & {
  questionCount: number;
  createdAt?: string;
  updatedAt?: string;
};
export interface ListPositionResponse {
  items: PositionResponse[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
