import type { FormField } from "../FormField";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFormValue } from "../useFormValue";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<string>
    type?: "text" | "password" | "email" | "search" | "tel" | "url"
} & Omit<DefaultInputProps, "type" | "value">;
export function Input(props: Props) {
    let { field, type, onChange, onBlur, ...rest } = props;
    const value = useFormValue(field);
    if (!type) type = "text";
    return (
        <input
            {...rest} type={type} value={value}
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
