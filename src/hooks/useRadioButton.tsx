import type { FormField } from "../FormField.ts";
import { type DetailedHTMLProps, type InputHTMLAttributes, useCallback, type FC } from "react";
import { type Mapper } from "../controls/mapValue.ts";
import { RadioButton } from "../controls/RadioButton.tsx";

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
& Omit<DefaultInputProps, "type" | "value" | "checked">;

export function useRadioButton<T extends string | number>(field: FormField<T>, opts?: Opts<T>): FC<InputProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts: Opts<T>): FC<InputProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts?: Opts<T>): FC<InputProps<T>> {
    const { name: nameFromHook, mapToValue } = opts ?? {};
    const Radio: FC<InputProps<T>> = useCallback(({ name, ...rest }) => {
        return (
            <RadioButton
                {...rest}
                field={field}
                mapToValue={mapToValue as Mapper<T>}
                name={name ?? nameFromHook}
            />
        )
    }, [field, nameFromHook, mapToValue]);
    Radio.displayName = "useRadioButton.Radio";
    return Radio;
}
