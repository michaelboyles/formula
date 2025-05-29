import type { FormField } from "../FormField.ts";
import { useSyncExternalStore } from "react";

export function useElements<T>(field: FormField<T[]>): ReadonlyArray<FormField<T>> {
    if (!field) throw new Error("Field is " + field);
    const length = useSyncNumElements(field);
    return Array.from(Array(length), (_, idx) => field.element(idx) as FormField<T>);
}

function useSyncNumElements(field: FormField<any[]>) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToValue(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => getSafeLength(field.getValue()),
        // Get server snapshot
        () => getSafeLength(field.getValue())
    );
}

function getSafeLength(array: ReadonlyArray<any>): number {
    if (Array.isArray(array)) {
        return array.length;
    }
    console.error(`Expected an array but got ${typeof array}`, array);
    return 0;
}
