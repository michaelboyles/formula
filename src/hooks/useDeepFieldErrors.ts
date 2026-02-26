import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { NO_ERRORS, noOp } from "../common.ts";

export function useDeepFieldErrors(field: Nullable<FormField<any>>): ReadonlyArray<string> {
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
