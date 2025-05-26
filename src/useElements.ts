import { ArrayField, FieldFromNative } from "./FormField";
import { useSyncExternalStore } from "react";

export function useElements<T>(field: ArrayField<T>): ReadonlyArray<FieldFromNative<T>> {
    const length = useSyncNumElements(field);
    return Array.from(Array(length), (_, idx) => field.element(idx) as FieldFromNative<T>);
}

function useSyncNumElements(field: ArrayField<any>) {
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
