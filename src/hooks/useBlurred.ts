import { useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useBlurred(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToBlurred(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.blurred(),
        // Get server snapshot
        () => field.blurred()
    );
}
