import type { FormField } from "../FormField.ts";
import { useFieldData } from "../hooks/useFieldData.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    // The field to associate with this input
    field: FormField<number>
} & Omit<DefaultInputProps, "type" | "value">;
export function IntegerInput(props: Props) {
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
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    )
}
