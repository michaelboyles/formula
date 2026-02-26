import type { ReactNode } from "react";
import type { FormField } from "../FormField.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";

export type Props = {
    // The field to get errors for
    field: FormField<any>
    // A render function which will be passed the errors
    children: (value: ReadonlyArray<string>) => ReactNode
}
export function FieldErrors(props: Props) {
    const errors = useFieldErrors(props.field);
    return props.children(errors);
}
