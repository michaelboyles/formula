import type { FormField } from "../FormField.ts";
import { useSyncExternalStore } from "react";

export function useElements<T>(field: FormField<T[]>): ReadonlyArray<FormField<T>> {
    if (!field) throw new Error("Field is " + field);
    const lengthOrFieldType = useSyncNumElements(field);
    if (typeof lengthOrFieldType === "string") {
        console.error(`Expected '${field}' to be an array. Found: ${lengthOrFieldType}`);
        return [];
    }
    return Array.from(Array(lengthOrFieldType), (_, idx) => field(idx) as FormField<T>);
}

function useSyncNumElements(field: FormField<any[]>) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribeToValue(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => getSafeLength(field.getValue()),
        // Get server snapshot
        () => getSafeLength(field.getValue())
    );
}

// This function either returns the length of the array, else the name of the invalid type. I wouldn't usually structure
// a function like this. The problem this solves is to log an error when useElements is called on a non-array.
//
// Previously this function logged the error, but that resulted in false positives, when you modify data such that the
// field path is invalidated, i.e. a path led to a valid array, but doesn't any more. After modifying the data, we
// notify subscribers, and React will call getSnapshot to compare the new value to the old.
//
// getSnapshot requires a cached value, so that rules out returning an object unless we want to deal with caching it.
function getSafeLength(array: ReadonlyArray<any>): number | string {
    if (Array.isArray(array)) {
        return array.length;
    }
    return typeof array;
}
