import { useSyncExternalStore } from "react";
import type { FormField } from "./FormField";

export function useFieldErrors(field: FormField<any>): ReadonlyArray<string> | undefined {
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
