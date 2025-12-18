import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FieldStateTree.ts";

export function newFormField<Data>(path: FieldPath, formAccess: FormAccess): FormField<Data> {
    const field: FormField<Data> = Object.assign(
        (<K extends keyof Data>(pathKey: K): FormField<Data[K]> => {
            if (typeof pathKey === "string" || typeof pathKey === "number") {
                return newFormField(path.withProperty(pathKey), formAccess);
            }
            throw new Error("Unsupported path key " + pathKey.toString());
        }),
        {
            toString: () => path.toString(),
            getData: () => formAccess.getData(path),
            setData: (value: Data) => {
                formAccess.setData(path, value);
                formAccess.setIsChanged(path, true);
            },
            getErrors: () => formAccess.getErrors(path),
            setErrors: (errors: string | string[] | undefined) => formAccess.setErrors(path, errors),
            getDeepErrors: () => formAccess.getDeepErrors(path),
            blurred: () => formAccess.blurred(path),
            setBlurred: (blurred: boolean) => formAccess.setBlurred(path, blurred),
            isChanged: () => formAccess.isChanged(path),
            setIsChanged: (isChanged: boolean) => formAccess.setIsChanged(path, isChanged),
            narrow: () => field as any,
            _internal: {
                subscribeToValue: (subscriber: Subscriber) => formAccess.subscribeToData(path, subscriber),
                subscribeToErrors: (subscriber: Subscriber) => formAccess.subscribeToErrors(path, subscriber),
                subscribeToDeepErrors: (subscriber: Subscriber) => formAccess.subscribeToDeepErrors(path, subscriber),
                subscribeToBlurred: (subscriber: Subscriber) => formAccess.subscribeToBlurred(path, subscriber),
                subscribeToIsChanged: (subscriber: Subscriber) => formAccess.subscribeToIsChanged(path, subscriber),
            }
        } satisfies BaseField<Data>, {
            push: (...element: any) => {
                formAccess.updateData<unknown[]>(path, value => {
                    const copy = [...value];
                    copy.push(...element);
                    return copy;
                });
            },
            remove: (index: number) => {
                formAccess.updateData<unknown[]>(path, value => {
                    if (index < value.length) {
                        return [...value.slice(0, index), ...value.slice(index + 1)]
                    }
                    else {
                        throw new Error(`Cannot remove element ${index} from array with length ${value.length}`);
                    }
                })
            }
        } satisfies ArrayMethods<any>
    ) as any as FormField<Data>;
    return field;
}

type BaseField<Data, SetData = Data> = {
    // Get the path of the field, joined with periods, e.g. "users.0.username"
    toString: () => string
    // Get the current data for the field
    getData: () => Readonly<Data>
    // Set the data for the field
    setData: (value: SetData) => void
    // Get the current validation errors for this field
    getErrors: () => ReadonlyArray<string>
    // Set the current validation errors for this field
    setErrors: (errors: string | string[] | undefined) => void
    // Get ALL validation errors for this field, including any sub-fields. For example
    // if the field is "users.0.username" and "users" has 1 error, "users.0" has
    // 2 errors, this will return an array containing 3 errors.
    getDeepErrors: () => ReadonlyArray<string>
    // Get the current blur status for this field, i.e. whether the field has lost focus.
    blurred: () => boolean
    // Set the current blur status for this field
    setBlurred: (blurred: boolean) => void
    // Get the current changed status for this field
    isChanged: () => boolean
    // Set the current changed status for this field
    setIsChanged: (isChanged: boolean) => void
    // Narrow the form field's type to a subtype. This is useful when your form data is
    // polymorphic.
    // You can optionally provide a "witness", which is unused except for type inference.
    // The witness is likely the result of observing the field value with useFieldData
    // and narrowing its type based on some condition.
    narrow: <SubType extends Data>(witness?: SubType) => FormField<SubType>
    _internal: {
        subscribeToValue: (subscriber: Subscriber) => Unsubscribe
        subscribeToErrors: (subscriber: Subscriber) => Unsubscribe
        subscribeToDeepErrors: (subscriber: Subscriber) => Unsubscribe
        subscribeToBlurred: (subscriber: Subscriber) => Unsubscribe
        subscribeToIsChanged: (subscriber: Subscriber) => Unsubscribe
    }
}

type GetObjectKey<Data extends object> = <K extends keyof Data>(key: K) => FormField<Data[K]>;

type GetArrayIndex<E> = (idx: number) => FormField<E | undefined, E>;
type ArrayMethods<E> = {
    // Push one or more elements onto the end of the array
    push: (...items: E[]) => void
    // Remove the element at the specified index
    remove: (index: number) => void
}

export type FormField<Data, SetData = Data> =
    BaseField<Data, SetData> &
    (Data extends ReadonlyArray<infer E> ? (GetArrayIndex<E> & ArrayMethods<E>)
        : Data extends object ? GetObjectKey<Data> : {});
