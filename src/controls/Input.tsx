import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import type { InputType } from "./types.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this input
    field: FormField<string>
    // The type of the input. Supports all types which have a true string value
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
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}
