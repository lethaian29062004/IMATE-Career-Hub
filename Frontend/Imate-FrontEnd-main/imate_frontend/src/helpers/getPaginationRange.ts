import type { PaginationRange } from "../types/common/pagination";
import type { GetPaginationRangeProps } from "../types/common/pagination";

// type PaginationRange = (number | "dots")[];

// interface GetPaginationRangeProps {
//   currentPage: number;
//   totalPage: number;
//   siblingCount?: number;
// }

export function getPaginationRange({ currentPage, totalPage, siblingCount = 1 }: GetPaginationRangeProps): PaginationRange {
  const totalNumbers = siblingCount * 2 + 5; // prev, next, current, sibling, first, last
  // ...existing code...

  if (totalPage <= totalNumbers) {
    return Array.from({ length: totalPage }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPage);

  const shouldShowLeftDots = leftSiblingIndex > 2;
  const shouldShowRightDots = rightSiblingIndex < totalPage - 1;

  const range: PaginationRange = [];

  if (!shouldShowLeftDots && shouldShowRightDots) {
    const leftRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1);
    range.push(...leftRange, "dots", totalPage);
  } else if (shouldShowLeftDots && !shouldShowRightDots) {
    const rightRange = Array.from({ length: 3 + 2 * siblingCount }, (_, i) => totalPage - (3 + 2 * siblingCount) + 1 + i);
    range.push(1, "dots", ...rightRange);
  } else if (shouldShowLeftDots && shouldShowRightDots) {
    const middleRange = Array.from({ length: 2 * siblingCount + 1 }, (_, i) => leftSiblingIndex + i);
    range.push(1, "dots", ...middleRange, "dots", totalPage);
  }

  return range;
}
