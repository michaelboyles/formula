import type { FormField } from "../FormField.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import { useBlurred } from "../hooks/useBlurred.ts";
import { useFieldErrors } from "../hooks/useFieldErrors.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultPreProps = DetailedHTMLProps<InputHTMLAttributes<HTMLPreElement>, HTMLPreElement>;
export type Props = {
    field: FormField<any>
} & DefaultPreProps;
export function DebugField({ field, ...rest }: Props) {
    const value = useFieldValue(field);
    const blurred = useBlurred(field);
    const errors = useFieldErrors(field);
    const json = {
        path: field.toString(),
        value,
        blurred,
        errors,
    }
    return (
        <pre {...rest}>{ JSON.stringify(json, null, 2) }</pre>
    );
}
