import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { NO_ERRORS, noOp } from "../common.ts";
import type { Nullable } from "../types.ts";

export function useFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<string> {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            if (!field) return noOp;
            return field.addErrorListener(() => onStoreChange());
        }, [field]),
        // Get snapshot
        () => field == null ? NO_ERRORS : field.getErrors(),
        // Get server snapshot
        () => field == null ? NO_ERRORS : field.getErrors(),
    );
}
