import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import type { InputType } from "./types.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<string>
    type?: Exclude<InputType, "button" | "checkbox" | "file" | "image" | "radio" | "reset" | "submit">
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
