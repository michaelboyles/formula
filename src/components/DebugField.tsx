import type { ReadonlyFormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import { useIsBlurred } from "../hooks/useIsBlurred.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";
import { useIsChanged } from "../hooks/useIsChanged.ts";
import type { ComponentProps } from "react";

export type DebugFieldProps<T> = {
    /** The field to print debug info for */
    field: ReadonlyFormField<T>
} & ComponentProps<"pre">;
export function DebugField<T>({ field, ...rest }: DebugFieldProps<T>) {
    const data = useFieldData(field);
    const isBlurred = useIsBlurred(field);
    const isChanged = useIsChanged(field);
    const errors = useFieldErrors(field);
    const json = {
        path: field.toString(),
        data,
        isBlurred,
        isChanged,
        errors,
    }
    return (
        <pre {...rest}>{ JSON.stringify(json, null, 2) }</pre>
    );
}
