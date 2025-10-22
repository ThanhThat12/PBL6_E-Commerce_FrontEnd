import { useState, useCallback } from 'react';

/**
 * Custom hook for form state management
 * Handles form data, errors, validation, and submission
 * 
 * @param {object} initialValues - Initial form values
 * @param {function} onSubmit - Submit handler function
 * @param {function} validate - Validation function
 * 
 * @example
 * const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm(
 *   { email: '', password: '' },
 *   async (values) => { ... },
 *   (values) => { ... }
 * );
 */
export const useForm = (initialValues = {}, onSubmit, validate) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  }, [errors]);

  /**
   * Handle input blur (mark as touched)
   */
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));
    
    // Validate on blur if validate function provided
    if (validate) {
      const validationErrors = validate(values);
      if (validationErrors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: validationErrors[name],
        }));
      }
    }
  }, [values, validate]);

  /**
   * Set field value programmatically
   */
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  /**
   * Set field error programmatically
   */
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Set multiple errors at once
   */
  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        
        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
        setTouched(allTouched);
        
        return;
      }
    }
    
    // Submit form
    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      
      // If error has field-specific errors, set them
      if (error.errors) {
        setFormErrors(error.errors);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, onSubmit, setFormErrors]);

  /**
   * Check if field has error and is touched
   */
  const hasError = useCallback((name) => {
    return touched[name] && errors[name];
  }, [touched, errors]);

  /**
   * Get error message for field
   */
  const getError = useCallback((name) => {
    return hasError(name) ? errors[name] : '';
  }, [hasError, errors]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    
    // Computed
    hasError,
    getError,
    isValid: Object.keys(errors).length === 0,
    
    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Setters
    setFieldValue,
    setFieldError,
    setFormErrors,
    clearErrors,
    resetForm,
  };
};

export default useForm;
