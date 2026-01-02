/**
 * @file src/hooks/usePagination.js
 * @description Hook for pagination state management
 */

import { useState, useCallback } from "react";

/**
 * Hook for managing pagination state
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Object} Pagination state and methods
 */
export const usePagination = (initialPage = 1, pageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  }, [totalPages]);

  const handleNext = useCallback(() => {
    handlePageChange(page + 1);
  }, [page, handlePageChange]);

  const handlePrevious = useCallback(() => {
    handlePageChange(page - 1);
  }, [page, handlePageChange]);

  const reset = useCallback(() => {
    setPage(initialPage);
  }, [initialPage]);

  return {
    page,
    pageSize,
    total,
    setTotal,
    totalPages,
    handlePageChange,
    handleNext,
    handlePrevious,
    reset,
    isFirstPage: page === 1,
    isLastPage: page === totalPages,
  };
};

export default usePagination;
