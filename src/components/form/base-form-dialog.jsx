/**
 * @file src/components/form/base-form-dialog.jsx
 * @description Reusable form dialog wrapper with state management
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Reusable form dialog wrapper
 * @param {Object} props - Component props
 * @param {boolean} props.open - Dialog open state
 * @param {Function} props.onOpenChange - Callback when dialog opens/closes
 * @param {string} props.title - Dialog title
 * @param {string} props.description - Dialog description
 * @param {Object} props.initialData - Initial form data
 * @param {Function} props.createInitialForm - Function to create initial form state from data
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.children - Form fields renderer (receives { form, handleChange })
 * @param {boolean} props.submitting - Loading state
 * @param {string} props.submitLabel - Submit button label (default: "Simpan")
 * @returns {JSX.Element} Form dialog component
 */
export function BaseFormDialog({
  open,
  onOpenChange,
  title,
  description,
  initialData,
  createInitialForm,
  onSubmit,
  children,
  submitting = false,
  submitLabel = "Simpan",
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const initialFormState = useMemo(
    () => createInitialForm(initialData),
    [initialData, createInitialForm]
  );
  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    setForm(initialFormState);
    setIsSubmitting(false);
  }, [initialFormState, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      onOpenChange?.(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {children({ form, handleChange })}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting || submitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting || submitting}>
              {isSubmitting || submitting ? "Memproses..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BaseFormDialog;
