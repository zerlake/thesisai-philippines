import { useState, useCallback, useRef, useMemo } from "react";

export interface ValidationRule {
  name: string;
  test: (value: any) => boolean;
  message: string;
  severity?: "error" | "warning"; // error = block submission, warning = allow but alert
}

export interface FieldState {
  value: any;
  touched: boolean;
  dirty: boolean;
  error?: string;
  warning?: string;
  validations: Map<string, boolean>;
}

export interface ValidationConfig {
  mode?: "onBlur" | "onChange" | "onSubmit";
  revalidateMode?: "onChange" | "onBlur" | "onSubmit";
  showSuggestions?: boolean;
}

/**
 * Hook for smart validation with real-time feedback and helpful guidance
 */
export function useSmartValidation<T extends Record<string, any>>(
  initialValues: T,
  rules: Record<string, ValidationRule[]>,
  config?: ValidationConfig
) {
  const [values, setValues] = useState<T>(initialValues);
  const [fields, setFields] = useState<Record<string, FieldState>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dirtyFieldsRef = useRef<Set<string>>(new Set());

  const defaultConfig: Required<ValidationConfig> = {
    mode: "onBlur",
    revalidateMode: "onChange",
    showSuggestions: true,
    ...config,
  };

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    (name: string, value: any): FieldState => {
      const fieldRules = rules[name] || [];
      const validations = new Map<string, boolean>();
      let error: string | undefined;
      let warning: string | undefined;

      for (const rule of fieldRules) {
        const isValid = rule.test(value);
        validations.set(rule.name, isValid);

        if (!isValid) {
          if (rule.severity === "warning") {
            warning = rule.message;
          } else {
            error = rule.message;
            break; // Stop at first error
          }
        }
      }

      const fieldState = fields[name] || { value, touched: false, dirty: false, validations: new Map() };

      return {
        ...fieldState,
        value,
        error,
        warning,
        validations,
      };
    },
    [fields, rules]
  );

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const inputValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setValues((prev) => ({
        ...prev,
        [name]: inputValue,
      }));

      dirtyFieldsRef.current.add(name);

      if (defaultConfig.mode === "onChange") {
        const fieldState = validateField(name, inputValue);
        setFields((prev) => ({
          ...prev,
          [name]: {
            ...fieldState,
            dirty: true,
            touched: true,
          },
        }));
      }
    },
    [validateField, defaultConfig.mode]
  );

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;

      if (defaultConfig.mode === "onBlur") {
        const fieldState = validateField(name, values[name]);
        setFields((prev) => ({
          ...prev,
          [name]: {
            ...fieldState,
            touched: true,
            dirty: dirtyFieldsRef.current.has(name),
          },
        }));
      } else {
        setFields((prev) => ({
          ...prev,
          [name]: {
            ...prev[name],
            touched: true,
          },
        }));
      }
    },
    [validateField, values, defaultConfig.mode]
  );

  /**
   * Validate all fields
   */
  const validateAll = useCallback((): boolean => {
    let isValid = true;
    const newFields: Record<string, FieldState> = {};

    Object.keys(rules).forEach((name) => {
      const fieldState = validateField(name, values[name]);
      newFields[name] = {
        ...fieldState,
        touched: true,
        dirty: true,
      };

      if (fieldState.error) {
        isValid = false;
      }
    });

    setFields(newFields);
    return isValid;
  }, [rules, validateField, values]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    (callback: (values: T) => void | Promise<void>) => {
      return async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateAll()) {
          return;
        }

        setIsSubmitting(true);
        try {
          await callback(values);
          dirtyFieldsRef.current.clear();
        } catch (err) {
          console.error("Submission error", err);
        } finally {
          setIsSubmitting(false);
        }
      };
    },
    [values, validateAll]
  );

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setFields({});
    dirtyFieldsRef.current.clear();
  }, [initialValues]);

  /**
   * Get field props
   */
  const getFieldProps = useCallback(
    (name: string) => ({
      name,
      value: values[name] ?? "",
      onChange: handleChange,
      onBlur: handleBlur,
      "aria-invalid": !!fields[name]?.error,
      "aria-describedby": fields[name]?.error ? `${name}-error` : undefined,
    }),
    [values, handleChange, handleBlur, fields]
  );

  /**
   * Get error message with suggestions
   */
  const getErrorMessage = useCallback(
    (name: string): { message: string; suggestions?: string[] } => {
      const fieldState = fields[name];
      if (!fieldState?.error) {
        return { message: "" };
      }

      const suggestions = generateSuggestions(name, values[name]);
      return {
        message: fieldState.error,
        suggestions: defaultConfig.showSuggestions ? suggestions : undefined,
      };
    },
    [fields, values, defaultConfig.showSuggestions]
  );

  return {
    values,
    fields,
    errors: useMemo(
      () =>
        Object.entries(fields).reduce(
          (acc, [name, field]) => ({
            ...acc,
            [name]: field.error,
          }),
          {} as Record<string, string | undefined>
        ),
      [fields]
    ),
    touched: useMemo(
      () =>
        Object.entries(fields).reduce(
          (acc, [name, field]) => ({
            ...acc,
            [name]: field.touched,
          }),
          {} as Record<string, boolean>
        ),
      [fields]
    ),
    dirty: useMemo(
      () =>
        Object.entries(fields).reduce(
          (acc, [name, field]) => ({
            ...acc,
            [name]: field.dirty,
          }),
          {} as Record<string, boolean>
        ),
      [fields]
    ),
    isValid: Object.values(fields).every((field) => !field.error),
    isSubmitting,
    isValidating: false,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
    getFieldProps,
    getErrorMessage,
    setValue: (name: string, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      dirtyFieldsRef.current.add(name);
    },
  };
}

/**
 * Generate helpful suggestions based on validation failure
 */
function generateSuggestions(name: string, value: any): string[] {
  const suggestions: string[] = [];

  // Email suggestions
  if (name.toLowerCase().includes("email") && typeof value === "string") {
    if (value.includes(" ")) {
      suggestions.push("Remove spaces from your email address");
    }
    if (!value.includes("@")) {
      suggestions.push("Email addresses need an @ symbol");
    }
    if (value.includes("@") && !value.includes(".")) {
      suggestions.push("Email needs a domain (e.g., @example.com)");
    }
  }

  // Password suggestions
  if (name.toLowerCase().includes("password") && typeof value === "string") {
    if (value.length < 8) {
      suggestions.push("Use at least 8 characters for a secure password");
    }
    if (!/[A-Z]/.test(value)) {
      suggestions.push("Add uppercase letters for better security");
    }
    if (!/[0-9]/.test(value)) {
      suggestions.push("Add numbers for a stronger password");
    }
    if (!/[!@#$%^&*]/.test(value)) {
      suggestions.push("Special characters (!@#$%) make passwords stronger");
    }
  }

  // Phone suggestions
  if (name.toLowerCase().includes("phone") && typeof value === "string") {
    if (value.replace(/\D/g, "").length < 10) {
      suggestions.push("Phone numbers need at least 10 digits");
    }
  }

  // URL suggestions
  if (name.toLowerCase().includes("url") && typeof value === "string") {
    if (!value.startsWith("http://") && !value.startsWith("https://")) {
      suggestions.push('URLs should start with "http://" or "https://"');
    }
  }

  // File suggestions
  if (name.toLowerCase().includes("file") && value instanceof File) {
    if (value.size > 10000000) {
      // 10MB
      suggestions.push("File is larger than 10MB. Try compressing it.");
    }
  }

  return suggestions;
}

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    name: "required",
    test: (value) => value !== "" && value !== null && value !== undefined,
    message,
  }),

  email: (message = "Please enter a valid email"): ValidationRule => ({
    name: "email",
    test: (value) =>
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
    message,
  }),

  minLength: (length: number, message?: string): ValidationRule => ({
    name: "minLength",
    test: (value) => !value || value.length >= length,
    message: message || `Minimum ${length} characters`,
  }),

  maxLength: (length: number, message?: string): ValidationRule => ({
    name: "maxLength",
    test: (value) => !value || value.length <= length,
    message: message || `Maximum ${length} characters`,
  }),

  pattern: (pattern: RegExp, message = "Invalid format"): ValidationRule => ({
    name: "pattern",
    test: (value) => !value || pattern.test(value),
    message,
  }),

  url: (message = "Please enter a valid URL"): ValidationRule => ({
    name: "url",
    test: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  match: (otherValue: any, message = "Fields must match"): ValidationRule => ({
    name: "match",
    test: (value) => value === otherValue,
    message,
  }),
};
