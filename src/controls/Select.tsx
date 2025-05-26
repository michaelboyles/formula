import type { FormField } from "../FormField.ts";
import type { DetailedHTMLProps, OptionHTMLAttributes, SelectHTMLAttributes } from "react";
import { useFieldValue } from "../useFieldValue.ts";

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
    let { field, mapToValue, options, onChange, ...rest } = props;
    if (mapToValue) {
        mapToValue = safeMapper(mapToValue);
    }
    else {
        mapToValue = safeMapper(val => val.toString());
    }

    const value = useFieldValue(field);
    return (
        <select
            {...rest}
            value={mapToValue(value)}
            onChange={e => {
                field.setValue(findOption(e.target.value, mapToValue, options));
                onChange?.(e);
            }}
        >
        {
            options.map(({ value, ...rest }, idx) => <option {...rest} key={idx} value={mapToValue(value)} />)
        }
        </select>
    );
}

// Wraps a possible Mapper in a function which checks that the result is string or number
function safeMapper<T>(delegate: (value: T) => unknown): Mapper<T> {
    return value => {
        const strValue = delegate(value);
        if (typeof strValue !== "string") {
            throw new Error("Value in Select must be a string: " + strValue);
        }
        return strValue;
    }
}

type Mapper<T> = (value: T) => string;

function findOption<T>(value: string, mapToValue: Mapper<T>, options: ReadonlyArray<Option<T>>): T {
    for (const option of options) {
        if (mapToValue(option.value) === value) {
            return option.value;
        }
    }
    throw new Error("Value was not amongst options: " + value);
}
