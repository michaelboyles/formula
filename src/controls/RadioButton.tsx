import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import { createMapper, Mapper } from "./mapValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props<T> = {
    // The field to associate with this radio button
    field: FormField<T>
    // The value that will be used if this radio button is selected
    value: T
}
& MapperProps<T>
& Omit<DefaultInputProps, "type" | "value">;

type MapperProps<T> =
    [T] extends [string | number] ? {
        mapToValue?: Mapper<T>
    } : {
        mapToValue: Mapper<T>
    };

export function RadioButton<T>(props: Props<T>) {
    const { field, value, onChange, onBlur, mapToValue, ...rest } = props;
    const mapper = createMapper(mapToValue);

    const selectedValue = useFieldValue(field);
    const isChecked = mapper(value) === mapper(selectedValue);
    return (
        <input
            {...rest}
            type="radio"
            checked={isChecked}
            onChange={e => {
                if (e.target.value === "on") {
                    field.setValue(value);
                }
                onChange?.(e);
            }}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}
