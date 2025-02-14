import { useSyncExternalStore } from "react";
import { StringField } from "./lib";

export function useField(field: StringField) {
    const value = useSyncExternalStore(
        // Subscribe
        (onStoreChange) => {
            return () => {}
        },
        // Get snapshot
        () => field.getValue()
    );

    return { value };
}