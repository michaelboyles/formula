import type { ReactNode } from "react";
import type { FormField } from "./FormField";
import { useFieldValue } from "./useFieldValue";

export type Props<T> = {
    field: FormField<T>
    children: (value: T) => ReactNode
}
export function FieldValue<T>(props: Props<T>) {
    const value = useFieldValue(props.field);
    return props.children(value);
}
