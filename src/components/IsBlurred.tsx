import type { ReactNode } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { useIsBlurred } from "../hooks/useIsBlurred.ts";

export type Props<T> = {
    // The field to watch the blur status for
    field: ReadonlyFormField<T>
    // A render function which will be passed the blur status
    children: (isBlurred: boolean) => ReactNode
}
export function IsBlurred<T>(props: Props<T>) {
    const isBlurred = useIsBlurred(props.field);
    return props.children(isBlurred);
}
