import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { noOp } from "../common.ts";

export function useIsChanged<T>(field: Nullable<ReadonlyFormField<T>>): boolean {
    return useSyncExternalStore(
        // Subscribe
        useCallback((onStoreChange) => {
            if (field == null) return noOp;
            return field.addIsChangedListener(() => onStoreChange());
        }, [field]),
        // Get snapshot
        () => field == null ? false : field.isChanged(),
        // Get server snapshot
        () => field == null ? false : field.isChanged()
    );
}
