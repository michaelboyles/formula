import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { noOp } from "../common.ts";

/**
 * A hook to subscribe to the change state of a field. It will only trigger a rerender when the state changes.
 *
 * 'Changed' is defined as having undergone any modification. A field is still considered "changed" even if it has been
 * changed and subsequently reverted.
 *
 * A field being changed implies that any parent fields have also been changed.
 *
 * @param field The field to get the change status for. If falsey, the result will be false.
 */
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
