import type { ReactNode } from "react";
import type { FormField } from "./FormField.ts";
import { useFieldErrors } from "./hooks/useFieldErrors.ts";

export type Props<T> = {
    field: FormField<T>
    children: (value: ReadonlyArray<string>) => ReactNode
}
export function FieldErrors<T>(props: Props<T>) {
    const errors = useFieldErrors(props.field);
    return props.children(errors);
}
