import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import type { InputType } from "../types.ts";
import { useFieldData } from "../hooks/useFieldData.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this input
    field: FormField<string>
    // The type of the input. Supports all types which have a true string value
    type?: Exclude<InputType, "button" | "checkbox" | "file" | "image" | "radio" | "reset" | "submit">
} & Omit<DefaultInputProps, "type" | "value">;
export function Input(props: Props) {
    const { field, type = "text", onChange, onBlur, ...rest } = props;
    const value = useFieldData(field);
    return (
        <input
            {...rest}
            type={type}
            value={value}
            onChange={e => {
                field.setData(e.target.value);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}
