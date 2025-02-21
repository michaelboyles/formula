import { useSyncExternalStore } from "react";
import { FormField } from "./FormField";

export function useIsTouched(field: FormField): boolean {
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