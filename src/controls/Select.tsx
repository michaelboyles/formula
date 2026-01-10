import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";
import { stringNumberMapper, type Mapper } from "./mapValue.ts";

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
        // A mapper is optional if the field type is string or number
        mapToValue?: Mapper<T, string | number>
    } : {
        // A mapper is required if the field type is not string or number
        mapToValue: Mapper<T, string | number>
    };
type Option<T> = {
    value: T
} & Omit<DefaultOptionProps, "value">

export function Select<T>(props: Props<T>) {
    const { field, mapToValue, options, onChange, onBlur, ...rest } = props;
    const mapper = stringNumberMapper(mapToValue);

    const data = useFieldData(field);
    return (
        <select
            {...rest}
            value={mapper(data)}
            onChange={e => {
                field.setData(findOption(e.target.value, mapper, options));
                onChange?.(e);
            }}
            onBlur={e => {
                field.setIsBlurred(true);
                onBlur?.(e);
            }}
        >
        {
            options.map(({ value, ...rest }, idx) => <option {...rest} key={idx} value={mapper(value)} />)
        }
        </select>
    );
}

function findOption<T>(value: string, mapToValue: Mapper<T, string | number>, options: ReadonlyArray<Option<T>>): T {
    for (const option of options) {
        if (mapToValue(option.value) === value) {
            return option.value;
        }
    }
    throw new Error("Value was not amongst options: " + value);
}
