/**
 * @file src/hooks/usePagination.js
 * @description Client-side pagination hook — slices a data array for the current page.
 */

import { useState, useMemo } from "react";

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/**
 * @param {Array}  data            - Full (already-filtered) data array.
 * @param {number} defaultPageSize - Initial page size (default: 25).
 */
export function usePagination(data = [], defaultPageSize = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Clamp page automatically when data shrinks (e.g. after filtering)
  const safePage = Math.min(currentPage, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  const startIndex = total === 0 ? 1 : (safePage - 1) * pageSize + 1;

  return {
    currentPage: safePage,
    pageSize,
    totalPages,
    total,
    pageItems,
    startIndex,
    goToPage: (page) =>
      setCurrentPage(Math.max(1, Math.min(page, Math.max(1, Math.ceil(total / pageSize))))),
    setPageSize: (size) => {
      setPageSizeState(size);
      setCurrentPage(1);
    },
  };
}
