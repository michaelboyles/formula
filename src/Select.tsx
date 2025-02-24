import { FormField } from "./FormField";
import { DetailedHTMLProps, SelectHTMLAttributes } from "react";
import { useFormValue } from "./useFormValue";

type DefaultSelectProps = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;

export type Props<T> = {
    field: FormField<T>
    options: Option<T>[]
}
& MapperProps<T>
& Omit<DefaultSelectProps, "type" | "onChange" | "checked">;

type MapperProps<T> =
    [T] extends [string | number] ? {
        mapToValue?: Mapper<T>
    } : {
        mapToValue: Mapper<T>
    };
type Option<T> = {
    label: string
    value: T
}

export function Select<T>(props: Props<T>) {
    let { field, mapToValue, options, ...rest } = props;
    if (mapToValue) {
        mapToValue = safeMapper(mapToValue);
    }
    else {
        mapToValue = safeMapper(val => val.toString());
    }

    const value = useFormValue(field);
    return (
        <select {...rest} value={mapToValue(value)} onChange={e => field.setValue(findOption(e.target.value, mapToValue, options))}>
        {
            options.map((option, idx) => <option key={idx} value={mapToValue(option.value)}>{ option.label }</option>)
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

function findOption<T>(value: string, mapToValue: Mapper<T>, options: Option<T>[]): T {
    for (const option of options) {
        if (mapToValue(option.value) === value) {
            return option.value;
        }
    }
    throw new Error("Value was not amongst options: " + value);
}