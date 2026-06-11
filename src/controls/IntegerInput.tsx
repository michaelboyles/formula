import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import type { ComponentProps } from "react";

export type IntegerInputProps = {
    /** The field to associate with this input */
    field: FormField<number>
} & Omit<ComponentProps<"input">, "type" | "value">;
export function IntegerInput(props: IntegerInputProps) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldData(field);

    return (
        <input
            {...rest}
            type="number"
            value={Number.isNaN(value) ? "" : value}
            onChange={e => {
                const value = e.target.valueAsNumber;
                if (Number.isSafeInteger(value)) {
                    field.setData(value);
                }
                else {
                    field.setData(Math.round(value));
                }
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
