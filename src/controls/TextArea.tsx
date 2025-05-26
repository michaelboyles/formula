import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
export type Props = {
    field: FormField<string>
} & Omit<DefaultInputProps, "value">;
export function TextArea(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldValue(field);
    return (
        <textarea
            {...rest}
            value={value}
            onChange={e => {
                field.setValue(e.target.value);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setTouched(true);
                onBlur?.(e);
            }}
        />
    );
}
