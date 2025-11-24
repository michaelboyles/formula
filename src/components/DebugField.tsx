import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import { useBlurred } from "../hooks/useBlurred.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultPreProps = DetailedHTMLProps<InputHTMLAttributes<HTMLPreElement>, HTMLPreElement>;
export type Props = {
    // The field to print debug info for
    field: FormField<any>
} & DefaultPreProps;
export function DebugField({ field, ...rest }: Props) {
    const data = useFieldData(field);
    const blurred = useBlurred(field);
    const errors = useFieldErrors(field);
    const json = {
        path: field.toString(),
        data,
        blurred,
        errors,
    }
    return (
        <pre {...rest}>{ JSON.stringify(json, null, 2) }</pre>
    );
}
