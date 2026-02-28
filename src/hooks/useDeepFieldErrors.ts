import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { NO_ERRORS, noOp } from "../common.ts";

export function useDeepFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<string> {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            if (field == null) return noOp;
            return field._internal.addDeepErrorsListener(onStoreChange);
        }, [field]),
        // Get snapshot
        () => field == null ? NO_ERRORS : field.getDeepErrors(),
        // Get server snapshot
        () => field == null ? NO_ERRORS : field.getDeepErrors(),
    );
}
