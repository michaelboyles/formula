import { FormField, StringField } from "./FormField";
import { useCallback, useSyncExternalStore } from "react";

export function useInput(field: StringField) {
    return useCallback(() => {
        const value = useSyncFormValue(field);
        return <input type="text" onChange={(e) => field.setValue(e.target.value)} value={value} />
    }, [field])
}

function useSyncFormValue(field: FormField) {
    return useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            const unsubscribe = field.subscribe(onStoreChange);
            return () => {
                unsubscribe();
            }
        },
        // Get snapshot
        () => field.getValue()
    );
}