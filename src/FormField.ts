import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FieldStateTree.ts";
import type { SetDataOpts, Setter } from "./types.ts";

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
            getData: () => formAccess.getData(path) as Data,
            setData: (setter, opts) => formAccess.setData(path, setter, opts),
            addDataListener: listener => formAccess.addDataListener(path, listener as Listener<unknown>),

            getErrors: () => formAccess.getErrors(path),
            setErrors: (errors: string | string[] | undefined) => formAccess.setErrors(path, errors),
            addErrorListener: listener => formAccess.addErrorListener(path, listener),

            getDeepErrors: () => formAccess.getDeepErrors(path),

            isBlurred: () => formAccess.isBlurred(path),
            setIsBlurred: (isBlurred: boolean) => formAccess.setIsBlurred(path, isBlurred),
            addBlurListener: listener => formAccess.addBlurListener(path, listener),

            isChanged: () => formAccess.isChanged(path),
            setIsChanged: (isChanged: boolean) => formAccess.setIsChanged(path, isChanged),
            addIsChangedListener: listener => formAccess.addIsChangedListener(path, listener),

            narrow: () => field as any,
            _internal: {
                addDeepErrorsListener: (subscriber: Subscriber) => formAccess.addDeepErrorsListener(path, subscriber),
            }
        } satisfies BaseField<Data>, {
            push: (...element: any) => {
                formAccess.setData(path, (data: unknown[]) => {
                    const copy = [...data];
                    copy.push(...element);
                    return copy;
                });
            },
            remove: (index: number) => {
                formAccess.setData(path, (data: any[]) => {
                    if (index < data.length) {
                        return [...data.slice(0, index), ...data.slice(index + 1)]
                    }
                    else {
                        throw new Error(`Cannot remove element ${index} from array with length ${data.length}`);
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
    setData: (setter: Setter<SetData>, opts?: SetDataOpts) => void
    // Add a callback which will be called when the data for this field changes
    addDataListener: (listener: Listener<Data>) => Unsubscribe

    // Get the current validation errors for this field
    getErrors: () => ReadonlyArray<string>
    // Set the current validation errors for this field
    setErrors: (errors: string | string[] | undefined) => void
    // Add a callback which will be called when the errors for this field change
    addErrorListener: (listener: Listener<ReadonlyArray<string>>) => Unsubscribe
    // Get ALL validation errors for this field, including any subfields. For example
    // if the field is "users.0.username" and "users" has 1 error, "users.0" has
    // 2 errors, this will return an array containing 3 errors.
    getDeepErrors: () => ReadonlyArray<string>

    // Get the current blur status for this field, i.e. whether the field has lost focus.
    isBlurred: () => boolean
    // Set the current blur status for this field
    setIsBlurred: (blurred: boolean) => void
    // Add a callback which will be called when the blur status for this field changes
    addBlurListener: (listener: Listener<boolean>) => Unsubscribe

    // Get the current changed status for this field
    isChanged: () => boolean
    // Set the current changed status for this field
    setIsChanged: (isChanged: boolean) => void
    // Add a callback which will be called when the change status for this field changes
    addIsChangedListener: (listener: Listener<boolean>) => Unsubscribe

    // Narrow the form field's type to a subtype. This is useful when your form data is
    // polymorphic.
    // You can optionally provide a "witness", which is unused except for type inference.
    // The witness is likely the result of observing the field data with useFieldData
    // and narrowing its type based on some condition.
    narrow: <SubType extends Data>(witness?: SubType) => FormField<SubType>

    _internal: {
        addDeepErrorsListener: (subscriber: Subscriber) => Unsubscribe
    }
}

export type Listener<T> = (value?: T) => void;

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
