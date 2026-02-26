import { useCallback, useSyncExternalStore } from "react";
import type { FormField } from "../FormField.ts";
import { noOp } from "../common.ts";

export function useFieldData<T>(field: FormField<T>): T;
export function useFieldData(field: null): null;
export function useFieldData(field: undefined): undefined;
export function useFieldData<T>(field: FormField<T> | null): T | null;
export function useFieldData<T>(field: FormField<T> | undefined): T | undefined;
export function useFieldData<T>(field: FormField<T> | undefined | null): T | undefined | null;
export function useFieldData<T>(field: FormField<T> | undefined | null): T | undefined | null {
    return useSyncExternalStore(
        // Subscribe
        useCallback(onStoreChange => {
            if (field == null) return noOp;
            return field.addDataListener(() => onStoreChange());
        }, [field]),
        // Get snapshot
        () => field ? field.getData() : field,
        // Get server snapshot
        () => field ? field.getData() : field
    );
}
