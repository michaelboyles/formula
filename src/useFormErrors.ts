import { useSyncExternalStore } from "react";
import { FormField } from "./FormField";

export function useFormErrors(field: FormField) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToErrors(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getErrors(),
        // Get server snapshot
        () => field.getErrors()
    );
}