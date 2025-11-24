import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FormStateTree.ts";

export function newFormField<T>(path: FieldPath, formAccess: FormAccess): FormField<T> {
    const field: FormField<T> = Object.assign(
        (<K extends keyof T>(pathKey: K): FormField<T[K]> => {
            if (typeof pathKey === "string" || typeof pathKey === "number") {
                return newFormField(path.withProperty(pathKey), formAccess);
            }
            throw new Error("Unsupported path key " + pathKey.toString());
        }),
        {
            toString: () => path.toString(),
            getValue: () => formAccess.getValue(path),
            setValue: (value: T) => formAccess.setValue(path, value),
            getErrors: () => formAccess.getErrors(path),
            setErrors: (errors: string | string[] | undefined) => formAccess.setErrors(path, errors),
            getDeepErrors: () => formAccess.getDeepErrors(path),
            blurred: () => formAccess.blurred(path),
            setBlurred: (blurred: boolean) => formAccess.setBlurred(path, blurred),
            narrow: () => field as any,
            _internal: {
                subscribeToValue: (subscriber: Subscriber) => formAccess.subscribeToValue(path, subscriber),
                subscribeToErrors: (subscriber: Subscriber) => formAccess.subscribeToErrors(path, subscriber),
                subscribeToDeepErrors: (subscriber: Subscriber) => formAccess.subscribeToDeepErrors(path, subscriber),
                subscribeToBlurred: (subscriber: Subscriber) => formAccess.subscribeToBlurred(path, subscriber),
            }
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
    return field;
}

type BaseField<Value, SetValue = Value> = {
    // Get the path of the field, joined with periods, e.g. "users.0.username"
    toString: () => string

    // Get the current value of the field
    getValue: () => Readonly<Value>
    // Set the current value of the field
    setValue: (value: SetValue) => void
    // Get the current validation errors for this field
    getErrors: () => ReadonlyArray<string>
    // Set the current validation errors for this field
    setErrors: (errors: string | string[] | undefined) => void
    // Get ALL validation errors for this field, including any sub-fields. For example if the field is
    // "users.0.username" and "users" has 1 error, "users.0" has 2 error", this will return an array containing 3
    // errors.
    getDeepErrors: () => ReadonlyArray<string>
    // Get the current blur status for this field, i.e. whether the field has lost focus.
    blurred: () => boolean
    // Set the current blur status for this field
    setBlurred: (blurred: boolean) => void
    // Narrow the form field's type to a subtype. This is useful when your form data is polymorphic.
    // You can optionally provide a "witness", which is unused except for type inference. The witness is likely the
    // result of observing the field value with useFieldValue and narrowing its type based on some condition.
    narrow: <SubType extends Value>(witness?: SubType) => FormField<SubType>
    _internal: {
        subscribeToValue: (subscriber: Subscriber) => Unsubscribe
        subscribeToErrors: (subscriber: Subscriber) => Unsubscribe
        subscribeToDeepErrors: (subscriber: Subscriber) => Unsubscribe
        subscribeToBlurred: (subscriber: Subscriber) => Unsubscribe
    }
}

type GetObjectKey<T extends object> = <K extends keyof T>(key: K) => FormField<T[K]>;

type GetArrayIndex<E> = (idx: number) => FormField<E | undefined, E>;
type ArrayMethods<E> = {
    push: (...items: E[]) => void
    remove: (index: number) => void
}

export type FormField<T, SetValue = T> =
    BaseField<T, SetValue> &
    (T extends ReadonlyArray<infer E> ? (GetArrayIndex<E> & ArrayMethods<E>)
        : T extends object ? GetObjectKey<T> : {});
