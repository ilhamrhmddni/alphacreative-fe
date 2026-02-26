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
      <DialogContent className="max-w-lg rounded-xl border border-border bg-card p-0 gap-0 shadow-lg overflow-hidden sm:max-w-xl">
        <DialogHeader className="bg-card border-b border-border px-6 pt-6 pb-4">
          <DialogTitle className="text-base font-semibold text-foreground sm:text-lg">{title}</DialogTitle>
          {description && <DialogDescription className="mt-1 text-xs text-muted-foreground sm:text-sm">{description}</DialogDescription>}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col max-h-[75vh]">
          <div className="overflow-y-auto bg-card px-6 py-5 space-y-5">
            {children({ form, handleChange })}
          </div>

          <div className="bg-card flex gap-2 justify-end border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="rounded-md text-xs sm:text-sm"
              onClick={() => onOpenChange?.(false)}
              disabled={isSubmitting || submitting}
            >
              Batal
            </Button>
            <Button type="submit" className="rounded-md text-xs sm:text-sm" disabled={isSubmitting || submitting}>
              {isSubmitting || submitting ? "Memproses..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default BaseFormDialog;
