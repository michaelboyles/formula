import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";

const noOp = () => {};

export function useFieldData<T>(field: FormField<T>): T;
export function useFieldData(field: null): null;
export function useFieldData(field: undefined): undefined;
export function useFieldData<T>(field: FormField<T> | undefined | null): T | undefined | null {
    return useSyncExternalStore(
        // Subscribe
        useCallback(onStoreChange => {
            if (field == null) return noOp;
            return field._internal.subscribeToData(onStoreChange);
        }, [field]),
        // Get snapshot
        () => field ? field.getData() : field,
        // Get server snapshot
        () => field ? field.getData() : field
    );
}
