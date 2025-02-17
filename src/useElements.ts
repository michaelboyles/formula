import { FormSchemaElement } from "./FormSchemaElement";
import { ArrayField } from "./FormField";
import { useSyncExternalStore } from "react";

export function useElements<T extends FormSchemaElement>(field: ArrayField<T>) {
    const length = useSyncFormValue(field);
    return Array.from(Array(length), (_, idx) => field.element(idx));
}

function useSyncFormValue<T extends FormSchemaElement>(field: ArrayField<T>) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribe(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getValue().length
    );
}