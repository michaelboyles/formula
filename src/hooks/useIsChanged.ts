import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

export function useIsChanged(field: FormField<any>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => field.addIsChangedListener(() => onStoreChange()), [field]),
        // Get snapshot
        () => field.isChanged(),
        // Get server snapshot
        () => field.isChanged()
    );
}
