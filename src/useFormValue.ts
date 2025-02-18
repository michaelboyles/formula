import { useSyncExternalStore } from "react";
import { ArrayField, BooleanField, FormField, NumberField, ObjectField, StringField } from "./FormField";
import { FormSchemaElement, ObjectSchema, SchemaValue } from "./FormSchemaElement";

export function useFormValue(field: StringField): string;
export function useFormValue(field: NumberField): number;
export function useFormValue(field: BooleanField): boolean;
export function useFormValue<T extends FormSchemaElement>(field: ArrayField<T>): SchemaValue<T>[];
export function useFormValue<T extends ObjectSchema>(field: ObjectField<T>): {[K in keyof T]: SchemaValue<T[K]> };

export function useFormValue(field: FormField) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribe(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getValue(),
        // Get server snapshot
        () => field.getValue()
    );
}