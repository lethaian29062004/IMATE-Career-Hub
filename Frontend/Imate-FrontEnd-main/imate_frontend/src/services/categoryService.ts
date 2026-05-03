import apiClient from "./apiClient";
import APIConfig from "@/config/apiConfig";

import type { CategorySubmit, CategoryUpdate } from "@/types/request/category.request";
import type { ListCategoryResponse } from "@/types/response/category.response";
import type { AffectedQuestion } from "@/types/response/affected-question.response";

export const getAllCategories = async (
  pageNumber: number | null,
  pageSize: number | null,
  isActive: boolean | null,
  searchTerm: string,
  SortBy?: string,
  SortOrder?: string,
  PositionId?: number | null
) => {
  try {
    const params = new URLSearchParams({
      ...(pageNumber !== null && pageNumber !== undefined && { PageNumber: pageNumber.toString() }),
      ...(pageSize !== null && pageSize !== undefined && { PageSize: pageSize.toString() }),
      ...(isActive !== null && isActive !== undefined && { IsActive: isActive.toString() }),
      SearchTerm: searchTerm,
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
      ...(PositionId !== null && PositionId !== undefined && { PositionId: PositionId.toString() }),
    });

    const res = await apiClient.get(
      `${APIConfig.Category.GetAllCategories}?${params.toString()}`
    );

    return res.data as ListCategoryResponse;
  } catch (error) {
    console.log("error fetch categories: ", error);
    return undefined;
  }
};

export const getListDetailCategory = async (
  PageNumber: number,
  PageSize: number,
  SearchTerm: string,
  IsActive: boolean | null,
  SortBy?: string,
  SortOrder?: string
) => {
  try {
    const params = new URLSearchParams({
      PageNumber: PageNumber.toString(),
      PageSize: PageSize.toString(),
      SearchTerm: SearchTerm,
      ...(IsActive !== null && { IsActive: IsActive.toString() }),
      ...(SortBy && { SortBy }),
      ...(SortOrder && { SortOrder }),
    });

    const res = await apiClient.get(
      `${APIConfig.Category.GetAllCategories}?${params.toString()}`
    );

    return res.data as ListCategoryResponse;
  } catch (error) {
    console.log("error fetch categories: ", error);
    throw error;
  }
};

export const AddCategory = async (category: CategorySubmit) => {
  console.log("category", category);
  try {
    const res = await apiClient.post(
      APIConfig.Category.AddCategory,
      category
    );
    return res;
  } catch (error: any) {
    throw error;
  }
};

export const UpdateCategory = async (category: CategoryUpdate, id: number) => {
  try {
    const url = APIConfig.Category.UpdateCategory.replace(
      "{categoryId}",
      id.toString()
    );

    const res = await apiClient.put(url, category);
    return res;
  } catch (error: any) {
    console.log("error update category api: ", error.message);
    throw error;
  }
};

export const getAffectedQuestions = async (
  categoryId: number,
  willBeActive: boolean
) => {
  try {
    const url = APIConfig.Category.GetAffectedQuestions.replace(
      "{categoryId}",
      categoryId.toString()
    );

    const res = await apiClient.get(
      `${url}?willBeActive=${willBeActive}`
    );

    return res.data as AffectedQuestion[];
  } catch (error) {
    console.log("error fetch affected questions: ", error);
    return [];
  }
};