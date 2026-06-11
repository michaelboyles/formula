import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import type { ComponentProps } from "react";

export type NumberInputProps = {
    /** The field to associate with this input */
    field: FormField<number>
} & Omit<ComponentProps<"input">, "type" | "value">;
export function NumberInput(props: NumberInputProps) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldData(field);

    return (
        <input
            {...rest}
            type="number"
            value={Number.isNaN(value) ? "" : value}
            onChange={e => {
                field.setData(e.target.valueAsNumber);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
