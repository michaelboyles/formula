import { BooleanField } from "./FormField";
import { useSyncExternalStore } from "react";

export type Props = {
    field: BooleanField
}
export function Checkbox({ field }: Props) {
    const value = useSyncFormValue(field);
    return <input type="checkbox" onChange={e => field.setValue(e.target.checked)} checked={value} />
}

function useSyncFormValue(field: BooleanField) {
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