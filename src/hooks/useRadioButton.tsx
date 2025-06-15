import type { FormField } from "../FormField.ts";
import { type DetailedHTMLProps, type InputHTMLAttributes, useCallback, type FC } from "react";
import { createMapper, type Mapper } from "../controls/mapValue.ts";
import { useFieldValue } from "../hooks/useFieldValue.ts";

export type Opts<T> = {
    // If you supply a name, the `name` attribute will be set on each `input`. This is a convenience to avoid having
    // to explicitly declare the name on each `input`.
    name?: string
} & ([T] extends [string | number] ? {
    mapToValue?: Mapper<T>
} : {
    mapToValue: Mapper<T>
});

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type InputProps<T> = {
    // The value that will be used if this radio button is selected
    value: T
}
& Omit<DefaultInputProps, "type" | "value">;

export function useRadioButton<T extends string | number>(field: FormField<T>, opts?: Opts<T>): FC<InputProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts: Opts<T>): FC<InputProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts?: Opts<T>): FC<InputProps<T>> {
    const { name: nameFromHook, mapToValue } = opts ?? {};
    return useCallback(({ value, onChange, onBlur, name, ...rest }) => {
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
                name={name ?? nameFromHook}
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
        )
    }, [field, nameFromHook, mapToValue]);
}
