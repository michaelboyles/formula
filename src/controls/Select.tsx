import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { useFieldValue } from "../hooks/useFieldValue.ts";
import { createMapper, Mapper } from "./mapValue.ts";

type DefaultSelectProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
type DefaultOptionProps = DetailedHTMLProps<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;

export type Props<T> = {
    field: FormField<T>
    options: ReadonlyArray<Option<NoInfer<T>>>
}
& MapperProps<T>
& Omit<DefaultSelectProps, "type" | "checked">;

type MapperProps<T> =
    [T] extends [string | number] ? {
        mapToValue?: Mapper<T>
    } : {
        mapToValue: Mapper<T>
    };
type Option<T> = {
    value: T
} & Omit<DefaultOptionProps, "value">

export function Select<T>(props: Props<T>) {
    const { field, mapToValue, options, onChange, ...rest } = props;
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
