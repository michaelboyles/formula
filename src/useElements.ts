import type { FormField } from "./FormField";
import { useSyncExternalStore } from "react";

export function useElements<T>(field: FormField<T[]>): ReadonlyArray<FormField<T>> {
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
        () => field.getValue().length,
        // Get server snapshot
        () => field.getValue().length
    );
}
