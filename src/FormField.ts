import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FormStateTree.ts";

export function newFormField<T>(path: FieldPath, formAccess: FormAccess): FormField<T> {
    return Object.assign(
        (<K extends keyof T>(pathKey: K): FormField<T[K]> => {
            if (typeof pathKey === "string") {
                return newFormField(path.withProperty(pathKey), formAccess);
            }
            else if (typeof pathKey === "number") {
                return newFormField(path.withArrayIndex(pathKey), formAccess);
            }
            throw new Error("Unsupported path key " + pathKey.toString());
        }),
        {
            toString: () => path.toString(),
            // Value
            getValue: () => formAccess.getValue(path),
            setValue: (value: T) => formAccess.setValue(path, value),
            subscribeToValue: (subscriber: Subscriber) => formAccess.subscribeToValue(path, subscriber),
            // Errors
            getErrors: () => formAccess.getErrors(path),
            setErrors: (errors: string | string[] | undefined) => formAccess.setErrors(path, errors),
            subscribeToErrors: (subscriber: Subscriber) => formAccess.subscribeToErrors(path, subscriber),
            // Deep errors
            getDeepErrors: () => formAccess.getDeepErrors(path),
            subscribeToDeepErrors: (subscriber: Subscriber) => formAccess.subscribeToDeepErrors(path, subscriber),
            // Blurred
            blurred: () => formAccess.blurred(path),
            setBlurred: (blurred: boolean) => formAccess.setBlurred(path, blurred),
            subscribeToBlurred: (subscriber: Subscriber) => formAccess.subscribeToBlurred(path, subscriber),
        } satisfies BaseField<T>, {
            push: (...element: any) => {
                formAccess.updateValue<unknown[]>(path, value => {
                    const copy = [...value];
                    copy.push(...element);
                    return copy;
                });
            },
            remove: (index: number) => {
                formAccess.updateValue<unknown[]>(path, value => {
                    if (index < value.length) {
                        return [...value.slice(0, index), ...value.slice(index + 1)]
                    }
                    else {
                        throw new Error(`Cannot remove element ${index} from array with length ${value.length}`);
                    }
                })
            }
        } satisfies ArrayMethods<any>
    ) as any as FormField<T>;
}

type BaseField<Value, SetValue = Value> = {
    toString: () => string

    getValue: () => Readonly<Value>
    setValue: (value: SetValue) => void
    subscribeToValue: (subscriber: Subscriber) => Unsubscribe

    getErrors: () => ReadonlyArray<string>
    setErrors: (errors: string | string[] | undefined) => void
    subscribeToErrors: (subscriber: Subscriber) => Unsubscribe

    getDeepErrors: () => ReadonlyArray<string>
    subscribeToDeepErrors: (subscriber: Subscriber) => Unsubscribe

    blurred: () => boolean
    setBlurred: (blurred: boolean) => void
    subscribeToBlurred: (subscriber: Subscriber) => Unsubscribe
}

type ObjectMethods<T extends object> = <K extends keyof T>(key: K) => FormField<T[K]>;

type ArrayIndex<E> = (idx: number) => FormField<E | undefined, E>;
type ArrayMethods<E> = {
    push: (...items: E[]) => void
    remove: (index: number) => void
}

export type FormField<T, SetValue = T> =
    BaseField<T, SetValue> &
    (T extends ReadonlyArray<infer E> ? (ArrayIndex<E> & ArrayMethods<E>)
        : T extends object ? ObjectMethods<T> : {});
