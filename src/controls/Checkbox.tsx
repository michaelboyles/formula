import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this checkbox
    field: FormField<boolean>
} & Omit<DefaultCheckboxProps, "type" | "checked">;
export function Checkbox(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const checked = useFieldData(field);
    return (
        <input
            {...rest}
            type="checkbox"
            onChange={e => {
                field.setData(e.target.checked);
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
