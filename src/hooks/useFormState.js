/**
 * @file src/hooks/useFormState.js
 * @description Hook for form state management with validation
 */

import { useState, useCallback } from "react";
import { cleanFormData } from "@/utils/form";

/**
 * Hook for managing form state with validation
 * @param {Object} initialState - Initial form state
 * @param {Function} onSubmit - Submit handler
 * @returns {Object} Form state and methods
 */
export const useFormState = (initialState = {}, onSubmit = null) => {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  }, [errors]);

  const handleFieldChange = useCallback((name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  }, [errors]);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  const setFieldsErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  const reset = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsSubmitting(false);
  }, [initialState]);

  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      
      if (onSubmit) {
        setIsSubmitting(true);
        try {
          await onSubmit(cleanFormData(formData));
        } catch (error) {
          console.error("Form submission error:", error);
        } finally {
          setIsSubmitting(false);
        }
      }
    },
    [formData, onSubmit]
  );

  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    setFormData,
    errors,
    setFieldError,
    setFieldsErrors,
    isSubmitting,
    isLoading,
    setIsLoading,
    handleChange,
    handleFieldChange,
    handleSubmit,
    reset,
    hasErrors,
  };
};

export default useFormState;
