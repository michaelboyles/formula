import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useIsBlurred(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback(onStoreChange => field.addBlurListener(() => onStoreChange()), [field]),
        // Get snapshot
        () => field.isBlurred(),
        // Get server snapshot
        () => field.isBlurred()
    );
}
