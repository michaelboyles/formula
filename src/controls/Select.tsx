import type { FormField } from "../FormField.ts";
import type { ComponentProps } from "react";
import { useFieldData } from "../hooks/useFieldData.ts";
import { type Mapper, stringNumberMapper } from "./mapValue.ts";

export type SelectProps<T> = {
    /** The field to associate with this 'select' control */
    field: FormField<T>
    /** The options to be included */
    options: ReadonlyArray<Option<NoInfer<T>>>
}
& MapperProps<T>
& ComponentProps<"select">;

type MapperProps<T> =
    [T] extends [string | number] ? {
        /** A mapper is optional if the field type is string or number */
        mapToValue?: Mapper<T, string | number>
    } : {
        /** A mapper is required if the field type is not string or number */
        mapToValue: Mapper<T, string | number>
    };
type Option<T> = {
    /**
     * The (unmapped) value to use for this option. Unlike a native option,
     * this is not required to be string-ish, since non-strings can be mapped.
     */
    value: T
} & Omit<ComponentProps<"option">, "value">

export function Select<T>(props: SelectProps<T>) {
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
