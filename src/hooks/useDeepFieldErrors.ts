import { useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useDeepFieldErrors(field: FormField<any>): ReadonlyArray<string> {
    if (!field) throw new Error("Field is " + field);
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToDeepErrors(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getDeepErrors(),
        // Get server snapshot
        () => field.getDeepErrors()
    );
}
