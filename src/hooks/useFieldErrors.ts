import { useCallback, useSyncExternalStore } from "react";
import type { ReadonlyFormField } from "../FormField.ts";
import { NO_ERRORS, noOp } from "../common.ts";
import type { Nullable } from "../types.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

/**
 * A hook which subscribes to the validation errors for a field. It will only trigger a rerender when the errors
 * change.
 *
 * @param field The field to get errors for. If falsey, the result will be an empty array.
 */
export function useFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<StandardSchemaV1.Issue> {
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
