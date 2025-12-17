import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useBlurred } from "../hooks/useBlurred.ts";

export type Props = {
    // The field to watch the blur status for
    field: FormField<any>
    // A render function which will be passed the blur status
    children: (isBlurred: boolean) => ReactNode
}
export function IsBlurred(props: Props) {
    const isBlurred = useBlurred(props.field);
    return props.children(isBlurred);
}
