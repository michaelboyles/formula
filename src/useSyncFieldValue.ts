import { useSyncExternalStore } from "react";
import { BooleanField, FormField, StringField } from "./FormField";

export function useSyncFieldValue(field: StringField): string
export function useSyncFieldValue(field: BooleanField): boolean
export function useSyncFieldValue(field: FormField) {
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