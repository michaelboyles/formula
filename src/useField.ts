import { useSyncExternalStore } from "react";
import { NumberField, StringField } from "./FormField";

type StringReturn = {
    value: string
    setValue: (value: string) => void
}
type NumberReturn = {
    value: number
    setValue: (value: number) => void
}
type Return = StringReturn | NumberReturn;

export function useField(field: StringField): StringReturn;
export function useField(field: NumberField): NumberReturn;
export function useField(field): Return {
    const value = useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            return () => {}
        },
        // Get snapshot
        () => field.getValue()
    );

    return {
        value,
        setValue(value: any) {
            field.setValue(value);
        }
    };
}