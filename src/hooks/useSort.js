/**
 * @file src/hooks/useSort.js
 * @description Hook for sorting state management
 */

import { useState, useCallback } from "react";

/**
 * Hook for managing sort state
 * @param {string} initialField - Initial sort field
 * @param {string} initialOrder - Initial sort order (asc/desc)
 * @returns {Object} Sort state and methods
 */
export const useSort = (initialField = "", initialOrder = "asc") => {
  const [sortBy, setSortBy] = useState(initialField);
  const [sortOrder, setSortOrder] = useState(initialOrder);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field with asc order
      setSortBy(field);
      setSortOrder("asc");
    }
  }, [sortBy]);

  const reset = useCallback(() => {
    setSortBy(initialField);
    setSortOrder(initialOrder);
  }, [initialField, initialOrder]);

  const getSortParams = useCallback(() => {
    return {
      sortBy,
      sortOrder,
    };
  }, [sortBy, sortOrder]);

  return {
    sortBy,
    sortOrder,
    handleSort,
    reset,
    getSortParams,
  };
};

export default useSort;
