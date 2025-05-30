import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";

export type Props<T> = {
    // The field to watch the value for
    field: FormField<T>
    // A render function which will be passed the value
    children: (value: T) => ReactNode
}
export function FieldValue<T>(props: Props<T>) {
    const value = useFieldValue(props.field);
    return props.children(value);
}
