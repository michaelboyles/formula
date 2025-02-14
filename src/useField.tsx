import { ReactNode, useCallback, useSyncExternalStore } from "react";
import { FormField, NumberField, StringField } from "./FormField";

type StringReturn = {
    value: string
    setValue: (value: string) => void
    Input: () => ReactNode
}
type NumberReturn = {
    value: number
    setValue: (value: number) => void
}
type Return = StringReturn | NumberReturn;

export function useField(field: StringField): StringReturn;
export function useField(field: NumberField): NumberReturn;
export function useField(field: FormField): Return {
    const value = useSyncFormValue(field);

    const Input = useCallback(() => {
        const value = useSyncFormValue(field);
        if (field instanceof StringField) {
            return <input type="text" onChange={(e) => field.setValue(e.target.value)} value={value}/>
        }
        return <div>unsupported</div>;
    }, [field])

    return {
        value,
        setValue(value: any) {
            field.setValue(value);
        },
        Input
    };
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