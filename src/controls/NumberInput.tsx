import type { FormField } from "../FormField.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this input
    field: FormField<number>
} & Omit<DefaultInputProps, "type" | "value">;
export function NumberInput(props: Props) {
    const { field, onChange, onBlur, ...rest } = props;
    const value = useFieldValue(field);

    return (
        <input
            {...rest}
            type="number"
            value={Number.isNaN(value) ? "" : value}
            onChange={e => {
                field.setValue(e.target.valueAsNumber);
                onChange?.(e);
            }}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
