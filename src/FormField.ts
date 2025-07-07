import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FormStateTree.ts";

export function newFormField<T>(path: FieldPath, formAccess: FormAccess): BaseField<T> & ArrayMethods<any> {
    const field = (...args: [string | number]) => {
        const pathKey = args[0];
        if (typeof pathKey === "string") {
            return newFormField(path.withProperty(args[0]), formAccess);
        }
        else if (typeof pathKey === "number") {
            return newFormField(path.withArrayIndex(pathKey), formAccess);
        }
        throw new Error("Unsupported path key " + pathKey);
    }
    field.toString = () => path.toString();
    // Value
    field.getValue = () => formAccess.getValue(path);
    field.setValue = (value: T) => formAccess.setValue(path, value);
    field.subscribeToValue = (subscriber: Subscriber) => formAccess.subscribeToValue(path, subscriber);
    // Errors
    field.getErrors = () => formAccess.getErrors(path);
    field.setErrors = (errors: string | string[] | undefined) => formAccess.setErrors(path, errors);
    field.subscribeToErrors = (subscriber: Subscriber) => formAccess.subscribeToErrors(path, subscriber);
    // Deep errors
    field.getDeepErrors = () => formAccess.getDeepErrors(path);
    field.subscribeToDeepErrors = (subscriber: Subscriber) => formAccess.subscribeToDeepErrors(path, subscriber);
    // Blurred
    field.blurred = () => formAccess.blurred(path);
    field.setBlurred = (blurred: boolean) => formAccess.setBlurred(path, blurred);
    field.subscribeToBlurred = (subscriber: Subscriber) => formAccess.subscribeToBlurred(path, subscriber);

    // Array methods
    field.push = (...element: any) => {
        formAccess.updateValue<unknown[]>(path, value => {
            const copy = [...value];
            copy.push(...element);
            return copy;
        });
    }
    field.remove = (index: number) => {
        formAccess.updateValue<unknown[]>(path, value => {
            if (index < value.length) {
                return [...value.slice(0, index), ...value.slice(index + 1)]
            }
            else {
                throw new Error(`Cannot remove element ${index} from array with length ${value.length}`);
            }
        })
    }
    return field;
}

type BaseField<Value, SetValue = Value> = {
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

type ArrayMethods<E> = ((idx: number) => FormField<E | undefined, E>) & {
    push: (...items: E[]) => void
    remove: (index: number) => void
}

export type FormField<T, SetValue = T> =
    BaseField<T, SetValue> &
    (T extends ReadonlyArray<infer E> ? ArrayMethods<E>
        : T extends object ? ObjectMethods<T> : {});
