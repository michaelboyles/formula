import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useDeepFieldErrors(field: FormField<any>): ReadonlyArray<string> {
    if (!field) throw new Error("Field is " + field);
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = field._internal.addDeepErrorsListener(onStoreChange);
            return () => unsubscribe();
        }, [field]),
        // Get snapshot
        () => field.getDeepErrors(),
        // Get server snapshot
        () => field.getDeepErrors()
    );
}
