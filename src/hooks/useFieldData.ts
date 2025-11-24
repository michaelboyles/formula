import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useFieldData<T>(field: FormField<T>): T {
    if (!field) throw new Error("Field is " + field);
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = field._internal.subscribeToValue(onStoreChange);
            return () => unsubscribe();
        }, [field]),
        // Get snapshot
        () => field.getData(),
        // Get server snapshot
        () => field.getData()
    );
}
