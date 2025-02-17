import { StringField } from "./FormField";
import { useSyncExternalStore } from "react";

export type Props = {
    field: StringField
}
export function Input({ field }: Props) {
    const value = useSyncFormValue(field);
    return <input type="text" onChange={(e) => field.setValue(e.target.value)} value={value} />
}

function useSyncFormValue(field: StringField) {
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