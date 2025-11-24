import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";

export type Props<T> = {
    // The field to watch the value for
    field: FormField<T>
    // A render function which will be passed the value
    children: (value: T) => ReactNode
}
export function FieldData<T>(props: Props<T>) {
    const value = useFieldData(props.field);
    return props.children(value);
}
