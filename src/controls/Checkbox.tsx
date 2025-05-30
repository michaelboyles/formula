import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this checkbox
    field: FormField<boolean>
} & Omit<DefaultCheckboxProps, "type" | "checked">;
export function Checkbox(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const checked = useFieldValue(field);
    return (
        <input
            {...rest}
            type="checkbox"
            onChange={e => {
                field.setValue(e.target.checked);
                onChange?.(e);
            }}
            checked={checked}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
