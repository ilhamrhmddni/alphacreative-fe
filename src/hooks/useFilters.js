/**
 * @file src/hooks/useFilters.js
 * @description Hook for filter state management
 */

import { useState, useCallback } from "react";

/**
 * Hook for managing filter state
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and methods
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);
  const [isActive, setIsActive] = useState(false);

  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsActive(true);
  }, []);

  const handleMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setIsActive(true);
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(initialFilters);
    setIsActive(false);
  }, [initialFilters]);

  const hasFilters = Object.keys(filters).length > 0;

  return {
    filters,
    setFilters,
    handleFilterChange,
    handleMultipleFilters,
    clearFilter,
    clearAllFilters,
    hasFilters,
    isActive,
  };
};

export default useFilters;
