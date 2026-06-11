import type { FormField } from "../FormField.ts";
import type { ComponentProps } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";

export type CheckboxProps = {
    /** The field to associate with this checkbox */
    field: FormField<boolean>
} & Omit<ComponentProps<"input">, "type" | "checked">;
export function Checkbox(props: CheckboxProps) {
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
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
