import { useSyncExternalStore } from "react";
import { NumberField, StringField } from "./FormField";

type StringReturn = {
    value: string
}
type NumberReturn = {
    value: number
}

export function useField(field: StringField): StringReturn;
export function useField(field: NumberField): NumberReturn;
export function useField(field) {
    const value = useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            return () => {}
        },
        // Get snapshot
        () => field.getValue()
    );

    return { value };
}