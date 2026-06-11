import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { noOp } from "../common.ts";

/**
 * A hook to subscribe to a field's data. It will only trigger a rerender when the value changes.
 *
 * @param field The field to get the current data for. If falsey, the result will be the supplied value.
 */
export function useFieldData<T>(field: ReadonlyFormField<T>): T;
export function useFieldData(field: null): null;
export function useFieldData(field: undefined): undefined;
export function useFieldData<T>(field: ReadonlyFormField<T> | null): T | null;
export function useFieldData<T>(field: ReadonlyFormField<T> | undefined): T | undefined;
export function useFieldData<T>(field: ReadonlyFormField<T> | undefined | null): T | undefined | null;
export function useFieldData<T>(field: ReadonlyFormField<T> | undefined | null): T | undefined | null {
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
