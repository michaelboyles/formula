import type { FormField } from "../FormField.ts";
import type { ComponentProps } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";
import { type Mapper, stringNumberMapper } from "./mapValue.ts";

export type RadioButtonProps<T> = {
    /** The field to associate with this radio button */
    field: FormField<T>
    /** The value that will be used if this radio button is selected */
    value: T
}
& ([T] extends [string | number] ? {
    mapToValue?: Mapper<T, string | number>
} : {
    mapToValue: Mapper<T, string | number>
})
& Omit<ComponentProps<"input">, "type" | "value" | "checked">

export function RadioButton<T>(props: RadioButtonProps<T>) {
    const { field, value, onChange, onBlur, mapToValue, ...rest } = props;
    const mapper = stringNumberMapper(mapToValue);
    const selectedValue = useFieldData(field);
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
                    field.setData(value);
                }
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        />
    );
}
