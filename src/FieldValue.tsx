import type { ReactNode } from "react";
import type { FormField } from "./FormField.ts";
import { useFieldValue } from "./hooks/useFieldValue.ts";

export type Props<T> = {
    field: FormField<T>
    children: (value: T) => ReactNode
}
export function FieldValue<T>(props: Props<T>) {
    const value = useFieldValue(props.field);
    return props.children(value);
}
