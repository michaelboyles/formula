import { StringField } from "./FormField";
import { DetailedHTMLProps, InputHTMLAttributes, useSyncExternalStore } from "react";

type DefaultInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
export type Props = {
    field: StringField
    type?: "text" | "password" | "email" | "search" | "tel" | "url"
} & Omit<DefaultInputProps, "type" | "onChange" | "value">;
export function Input(props: Props) {
    let { field, type, ...rest } = props;
    const value = useSyncFormValue(field);
    if (!type) type = "text";
    return <input {...rest} type={type} onChange={e => field.setValue(e.target.value)} value={value} />;
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