import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: FormField<boolean>
} & Omit<DefaultCheckboxProps, "type" | "checked">;
export function Checkbox(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldValue(field);
    return (
        <input
            {...rest}
            type="checkbox"
            onChange={e => {
                field.setValue(e.target.checked);
                onChange?.(e);
            }}
            checked={value}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
