import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this input
    field: FormField<number>
} & Omit<DefaultInputProps, "type" | "value">;
export function NumberInput(props: Props) {
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
