import { BooleanField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes, useSyncExternalStore } from "react";

type DefaultCheckboxProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: BooleanField
} & Omit<DefaultCheckboxProps, "type" | "onChange" | "checked">;
export function Checkbox(props: Props) {
    const { field, ...rest } = props;
    const value = useSyncFormValue(field);
    return <input {...rest} type="checkbox" onChange={e => field.setValue(e.target.checked)} checked={value} />
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