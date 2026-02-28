import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { noOp } from "../common.ts";

export function useIsBlurred<T>(field: Nullable<ReadonlyFormField<T>>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback(onStoreChange => {
            if (field == null) return noOp;
            return field.addBlurListener(() => onStoreChange());
        }, [field]),
        // Get snapshot
        () => field == null ? false : field.isBlurred(),
        // Get server snapshot
        () => field == null ? false : field.isBlurred()
    );
}
