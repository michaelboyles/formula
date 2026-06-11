import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { noOp } from "../common.ts";

/**
 * A hook to subscribe to the blur state of a field. It will only trigger a rerender when the status changes.
 *
 * Blur is defined as when a field loses focus.
 *
 * The blur state does not propagate to any parent fields. Blurring a subfield of an object does not apply blur to the
 * parent object, and blurring an array element does not blur the entire array.
 *
 * @param field
 */
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
