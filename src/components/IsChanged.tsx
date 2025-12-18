import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useIsChanged } from "../hooks/useIsChanged.ts";

export type Props = {
    // The field to watch the change status for
    field: FormField<any>
    // A render function which will be passed the change status
    children: (isChanged: boolean) => ReactNode
}
export function IsChanged(props: Props) {
    const isChanged = useIsChanged(props.field);
    return props.children(isChanged);
}
