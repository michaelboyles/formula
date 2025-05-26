import { useSyncExternalStore } from "react";
import type { FormField } from "./FormField";

export function useIsTouched(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToTouched(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.isTouched(),
        // Get server snapshot
        () => field.isTouched()
    );
}
