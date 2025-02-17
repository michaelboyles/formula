import { StringField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes, useSyncExternalStore } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: StringField
} & Omit<DefaultInputProps, "type" | "onChange" | "value">;
export function Input(props: Props) {
    const { field, ...rest } = props;
    const value = useSyncFormValue(field);
    return <input {...rest} type="text" onChange={e => field.setValue(e.target.value)} value={value} />;
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