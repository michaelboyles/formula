// A value or replacement function used for updating a value
export type Setter<T> = T | ((old: T) => T)

// The various valid 'type' attributes for <input />
export type InputType = "button" | "checkbox" | "color" | "date" | "datetime" | "email" | "file" | "hidden"
    | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit"
    | "tel" | "text" | "time" | "url" | "week";

