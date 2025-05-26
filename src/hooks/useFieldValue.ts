import { useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useFieldValue<T>(field: FormField<T>): T {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToValue(onStoreChange);
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
