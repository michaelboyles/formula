import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";

export type Props<T> = {
    // The field to watch the data for
    field: FormField<T>
    // A render function which will be passed the data
    children: (data: T) => ReactNode
}
export function FieldData<T>(props: Props<T>) {
    const data = useFieldData(props.field);
    return props.children(data);
}
