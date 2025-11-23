import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useBlurred(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            const unsubscribe = field._internal.subscribeToBlurred(onStoreChange);
            return () => unsubscribe();
        }, [field]),
        // Get snapshot
        () => field.blurred(),
        // Get server snapshot
        () => field.blurred()
    );
}
