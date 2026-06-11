import type { ReactNode } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { useIsChanged } from "../hooks/useIsChanged.ts";

export type IsChangedProps<T> = {
    /** The field to watch the change status for */
    field: ReadonlyFormField<T>
    /** A render function which will be passed the change status */
    children: (isChanged: boolean) => ReactNode
}
export function IsChanged<T>(props: IsChangedProps<T>) {
    const isChanged = useIsChanged(props.field);
    return props.children(isChanged);
}
