import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import { createMapper, type Mapper } from "./mapValue.ts";

type DefaultSelectProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
type DefaultOptionProps = DetailedHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;

export type Props<T> = {
    // The field to associate with this 'select' control
    field: FormField<T>
    // The options to be included
    options: ReadonlyArray<Option<NoInfer<T>>>
}
& MapperProps<T>
& DefaultSelectProps;

type MapperProps<T> =
    [T] extends [string | number] ? {
        // A mapper is optional if the value is already a string or number
        mapToValue?: Mapper<T>
    } : {
        // A mapper is required if the value is a complex type
        mapToValue: Mapper<T>
    };
type Option<T> = {
    value: T
} & Omit<DefaultOptionProps, "value">

export function Select<T>(props: Props<T>) {
    const { field, mapToValue, options, onChange, onBlur, ...rest } = props;
    const mapper = createMapper(mapToValue);

    const value = useFieldValue(field);
    return (
        <select
            {...rest}
            value={mapper(value)}
            onChange={e => {
                field.setValue(findOption(e.target.value, mapper, options));
                onChange?.(e);
            }}
            onBlur={e => {
                field.setBlurred(true);
                onBlur?.(e);
            }}
        >
        {
            options.map(({ value, ...rest }, idx) => <option {...rest} key={idx} value={mapper(value)} />)
        }
        </select>
    );
}

function findOption<T>(value: string, mapToValue: Mapper<T>, options: ReadonlyArray<Option<T>>): T {
    for (const option of options) {
        if (mapToValue(option.value) === value) {
            return option.value;
        }
    }
    throw new Error("Value was not amongst options: " + value);
}
