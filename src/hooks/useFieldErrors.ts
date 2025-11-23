import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useFieldErrors(field: FormField<any>): ReadonlyArray<string> {
    if (!field) throw new Error("Field is " + field);
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = field._internal.subscribeToErrors(onStoreChange);
            return () => unsubscribe();
        }, [field]),
        // Get snapshot
        () => field.getErrors(),
        // Get server snapshot
        () => field.getErrors()
    );
}
