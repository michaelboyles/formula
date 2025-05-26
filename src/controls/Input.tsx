import type { FormField } from "../FormField";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../useFieldValue";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<string>
    type?: "text" | "password" | "email" | "search" | "tel" | "url"
} & Omit<DefaultInputProps, "type" | "value">;
export function Input(props: Props) {
    const { field, type = "text", onChange, onBlur, ...rest } = props;
    const value = useFieldValue(field);
    return (
        <input
            {...rest}
            type={type}
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
