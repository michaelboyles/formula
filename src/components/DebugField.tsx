import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import { useIsBlurred } from "../hooks/useIsBlurred.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";
import { useIsChanged } from "../hooks/useIsChanged.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultPreProps = DetailedHTMLProps<InputHTMLAttributes<HTMLPreElement>, HTMLPreElement>;
export type Props = {
    // The field to print debug info for
    field: FormField<any>
} & DefaultPreProps;
export function DebugField({ field, ...rest }: Props) {
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
