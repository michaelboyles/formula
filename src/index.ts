// noinspection JSUnusedGlobalSymbols

export type { Form } from "./hooks/useForm.ts"
export type { FormField, ReadonlyFormField } from "./FormField.ts"
export type { FormSubmitResult } from "./types.ts"

// Hooks

export { useDeepFieldErrors } from "./hooks/useDeepFieldErrors.ts"
export { useElements } from "./hooks/useElements.ts"
export { useFieldData } from "./hooks/useFieldData.ts"
export { useFieldErrors } from "./hooks/useFieldErrors.ts"
export { useForm } from "./hooks/useForm.ts"
export { useIsBlurred } from "./hooks/useIsBlurred.ts"
export { useIsChanged } from "./hooks/useIsChanged.ts"
export { useIsSubmitting } from "./hooks/useIsSubmitting.ts"
export { useRadioButton } from "./hooks/useRadioButton.tsx"
export { useSubmissionError } from "./hooks/useSubmissionError.ts"

// Components

export { Checkbox, type CheckboxProps } from "./controls/Checkbox.tsx"
export { FileInput, type FileInputProps } from "./controls/FileInput.tsx"
export { Input, type InputProps } from "./controls/Input.tsx"
export { IntegerInput, type IntegerInputProps } from "./controls/IntegerInput.tsx"
export { NumberInput, type NumberInputProps } from "./controls/NumberInput.tsx"
export { RadioButton, type RadioButtonProps } from "./controls/RadioButton.tsx"
export { Select, type SelectProps } from "./controls/Select.tsx"
export { TextArea, type TextAreaProps } from "./controls/TextArea.tsx"

export { DebugField, type DebugFieldProps } from "./components/DebugField.tsx"
export { FieldData, type FieldDataProps } from "./components/FieldData.tsx"
export { FieldErrors, type FieldErrorsProps } from "./components/FieldErrors.tsx"
export { ForEachElement, type ForEachElementProps } from "./components/ForEachElement.tsx"
export { IsBlurred, type IsBlurredProps } from "./components/IsBlurred.tsx"
export { IsChanged, type IsChangedProps } from "./components/IsChanged.tsx"
export { IsSubmitting, type IsSubmittingProps } from "./components/IsSubmitting.tsx"
export { SubmissionError, type SubmissionErrorProps } from "./components/SubmissionError.tsx"

// Validation

export type { Validator, ValueValidator, ObjectValidator, ArrayValidator } from "./validate.ts"
export { ValidationError } from "./ValidationError.ts"
