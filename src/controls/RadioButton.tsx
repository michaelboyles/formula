import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import { createMapper, type Mapper } from "./mapValue.ts";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props<T> = {
    // The field to associate with this radio button
    field: FormField<T>
    // The value that will be used if this radio button is selected
    value: T
}
& ([T] extends [string | number] ? {
    mapToValue?: Mapper<T>
} : {
    mapToValue: Mapper<T>
})
& Omit<DefaultInputProps, "type" | "value">

export function RadioButton<T>(props: Props<T>) {
    const { field, value, onChange, onBlur, mapToValue, ...rest } = props;
    const mapper = createMapper(mapToValue);
    const selectedValue = useFieldValue(field);
    const mappedValue = mapper(value);
    const isChecked = mappedValue === mapper(selectedValue);
    return (
        <input
            {...rest}
            type="radio"
            checked={isChecked}
            value={mappedValue}
            onChange={e => {
                if (e.target.checked) {
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
