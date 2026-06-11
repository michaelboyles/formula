import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import type { Nullable } from "../types.ts";
import { NO_ERRORS, noOp } from "../common.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A hook to subscribe to the validation errors for a field, as well as any subfields
 *
 * @param field The field to get errors for. If falsey, the result will be an empty array.
 */
export function useDeepFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<StandardSchemaV1.Issue> {
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
