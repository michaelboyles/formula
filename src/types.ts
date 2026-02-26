export type Nullable<T> = T | undefined | null;

// A value or replacement function used for updating a value
export type Setter<T> = T | ((old: T) => T)

// The various valid 'type' attributes for <input />
export type InputType = "button" | "checkbox" | "color" | "date" | "datetime" | "email" | "file" | "hidden"
    | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit"
    | "tel" | "text" | "time" | "url" | "week";

export type SetDataOpts = {
    // Whether to validate the data after setting it.
    // Default: will validate if `useForm#validateOnChange` is true.
    shouldValidate?: boolean;

    // The change status for the field after setting the data. 'retain' will leave the
    // change status untouched
    // Default: true
    nextChangeStatus?: boolean | "retain";
}
