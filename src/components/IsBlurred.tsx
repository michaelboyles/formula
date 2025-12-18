import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useIsBlurred } from "../hooks/useIsBlurred.ts";

export type Props = {
    // The field to watch the blur status for
    field: FormField<any>
    // A render function which will be passed the blur status
    children: (isBlurred: boolean) => ReactNode
}
export function IsBlurred(props: Props) {
    const isBlurred = useIsBlurred(props.field);
    return props.children(isBlurred);
}
