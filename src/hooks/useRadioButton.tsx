import type { FormField } from "../FormField.ts";
import { useCallback, type FC, type ComponentProps } from "react";
import { type Mapper } from "../controls/mapValue.ts";
import { RadioButton } from "../controls/RadioButton.tsx";

/** useRadioButton options */
export type Opts<T> = {
    /**
     * If you supply a name, the `name` attribute will be set on each `input`. This is
     * a convenience to avoid having to explicitly declare the name on each `input`.
     */
    name?: string
} & ([T] extends [string | number] ? {
    /**
     * If the field type in the form state is a string or number, a mapper is optional. This is used to put different
     * values in the DOM than is stored in form state (e.g. `<input value="mapResult">`).
     */
    mapToValue?: Mapper<T, string | number>
} : {
    /**
     * If the field type is not a string or number, a map function is required to "stringify" the field value into
     * something that can be put in an `<input value="">`.
     */
    mapToValue: Mapper<T, string | number>
});

export type DynamicRadioBtnProps<T> = {
    /** The value that will be used if this radio button is selected */
    value: T
}
& Omit<ComponentProps<"input">, "type" | "value" | "checked">;

/**
 * `useRadioButton` returns a new component for the given `FormField`. It's used to remove the need for duplicate props
 * across `<RadioButton>`s which it does by binding props dynamically.
 *
 * @param field The field to create a component for
 * @param opts Options. Required to specify a mapper if field type is not string or number
 */
export function useRadioButton<T extends string | number>(field: FormField<T>, opts?: Opts<T>): FC<DynamicRadioBtnProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts: Opts<T>): FC<DynamicRadioBtnProps<T>>;
export function useRadioButton<T>(field: FormField<T>, opts?: Opts<T>): FC<DynamicRadioBtnProps<T>> {
    const { name: nameFromHook, mapToValue } = opts ?? {};
    const Radio: FC<DynamicRadioBtnProps<T>> = useCallback(({ name, ...rest }) => {
        return (
            <RadioButton
                {...rest}
                field={field}
                mapToValue={mapToValue as Mapper<T, string | number>}
                name={name ?? nameFromHook}
            />
        )
    }, [field, nameFromHook, mapToValue]);
    Radio.displayName = "useRadioButton.Radio";
    return Radio;
}
