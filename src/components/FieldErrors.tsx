import type { ReactNode } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";

export type Props<T> = {
    // The field to get errors for
    field: ReadonlyFormField<T>
    // A render function which will be passed the errors
    children: (value: ReadonlyArray<string>) => ReactNode
}
export function FieldErrors<T>(props: Props<T>) {
    const errors = useFieldErrors(props.field);
    return props.children(errors);
}
