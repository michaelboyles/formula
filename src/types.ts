import type { ValidationError } from "./ValidationError.ts";

export type Nullable<T> = T | undefined | null;

/** A value or replacement function used for updating a value */
export type Setter<T> = T | ((old: T) => T)

/** The various valid 'type' attributes for <input /> */
export type InputType = "button" | "checkbox" | "color" | "date" | "datetime" | "email" | "file" | "hidden"
    | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit"
    | "tel" | "text" | "time" | "url" | "week";

export type SetDataOpts = {
    /**
     * Whether to validate the data after setting it. If not specified,
     * will validate if `useForm#validateOnChange` is true.
     */
    shouldValidate?: boolean;

    /**
     * The change status for the field after setting the data.
     * 'retain' will leave the change status untouched
     * @default true
     */
    nextChangeStatus?: boolean | "retain";
}

/** The result of submitting the Formula form */
export type FormSubmitResult = {
    /** Submission was successful */
    type: "success"
} | {
    /** The form was already part-way through submitting. Subsequent submissions are ignored */
    type: "already-submitting"
} | {
    /** There were validation errors that prevented the form from being submitted */
    type: "validation-error"
    error: ValidationError
}
