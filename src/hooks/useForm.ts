import { useState, ChangeEvent, FormEvent } from 'react'

interface UseFormProps<T, E extends Record<string, any> = Partial<Record<keyof T, string>>> {
  initialValues: T
  onSubmit: (values: T) => void | Promise<void>
  validate?: (values: T) => E
}

export function useForm<T extends Record<string, any>, E extends Record<string, any> = Partial<Record<keyof T, string>>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormProps<T, E>) {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<E>({} as E)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when user starts typing
    if (name in errors) {
      setErrors((prev) => ({
        ...prev,
        [name]: '' as any,
      }))
    }
  }

  const setValue = <K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (validate) {
      const validationErrors = validate(values)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setValues(initialValues)
    setErrors({} as E)
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    reset,
    setValue,
  }
} 