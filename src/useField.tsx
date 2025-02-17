import { useSyncExternalStore } from "react";
import { ArrayField, FormField, NumberField, ObjectField, StringField } from "./FormField";
import { ObjectSchema, FormSchemaElement, SchemaValue } from "./FormSchemaElement";

type StringReturn = {
    value: string
    setValue: (value: string) => void
}
type NumberReturn = {
    value: number
    setValue: (value: number) => void
}
type ArrayReturn<T> = {
    value: T[]
    setValue: (value: T[]) => void
}
type ObjectReturn<T> = {
    value: T
    setValue: (value: T) => void
}
type Return = StringReturn | NumberReturn | ArrayReturn<any> | ObjectReturn<any>

export function useField(field: StringField): StringReturn;
export function useField(field: NumberField): NumberReturn;
export function useField<T extends FormSchemaElement>(field: ArrayField<T>): ArrayReturn<SchemaValue<T>>;
export function useField<T extends ObjectSchema>(field: ObjectField<T>): ObjectReturn<{[K in keyof T]: SchemaValue<T[K]> }>;
export function useField(field: FormField): Return {
    const value = useSyncFormValue(field);

    return {
        value,
        setValue(value: any) {
            field.setValue(value);
        }
    };
}

function useSyncFormValue(field: FormField) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribe(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getValue()
    );
}