import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useIsChanged(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => field._internal.subscribeToIsChanged(onStoreChange), [field]),
        // Get snapshot
        () => field.isChanged(),
        // Get server snapshot
        () => field.isChanged()
    );
}
