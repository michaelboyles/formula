import type { FormAccess } from "./hooks/useForm.ts";
import type { FieldPath } from "./FieldPath.ts";
import type { Subscriber, Unsubscribe } from "./FieldStateTree.ts";
import type { SetDataOpts, Setter } from "./types.ts";
import type { StandardSchemaV1 } from "@standard-schema/spec";

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
            setErrors: errors => formAccess.setErrors(path, errors),
            addErrorListener: listener => formAccess.addErrorListener(path, listener),

            getDeepErrors: () => formAccess.getDeepErrors(path),

            isBlurred: () => formAccess.isBlurred(path),
            setIsBlurred: isBlurred => formAccess.setIsBlurred(path, isBlurred),
            addBlurListener: listener => formAccess.addBlurListener(path, listener),

            isChanged: () => formAccess.isChanged(path),
            setIsChanged: isChanged => formAccess.setIsChanged(path, isChanged),
            addIsChangedListener: listener => formAccess.addIsChangedListener(path, listener),

            narrow: () => field as any,
            _internal: {
                addDeepErrorsListener: (subscriber: Subscriber) => formAccess.addDeepErrorsListener(path, subscriber),
            }
        } satisfies BaseField<Data, true>, {
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

type BaseField<Data, Writable extends boolean> = {
    /** Get the path of the field, joined with periods, e.g. "users.0.username" */
    toString: () => string

    /** Get the current data for the field */
    getData: () => Readonly<Data>
    /** Add a callback which will be called when the data for this field changes */
    addDataListener: (listener: Listener<Data>) => Unsubscribe

    /** Get the current validation errors for this field */
    getErrors: () => ReadonlyArray<StandardSchemaV1.Issue>
    /** Set the current validation errors for this field */
    setErrors: (errors: ReadonlyArray<string | StandardSchemaV1.Issue>) => void
    /** Add a callback which will be called when the errors for this field change */
    addErrorListener:
        (listener: Listener<ReadonlyArray<StandardSchemaV1.Issue>>) => Unsubscribe
    /** Get ALL validation errors for this field, including errors for subfields */
    getDeepErrors: () => ReadonlyArray<StandardSchemaV1.Issue>

    /**
     * Get the current blur status for this field, i.e. whether the field has lost
     * focus
     */
    isBlurred: () => boolean
    /** Set the current blur status for this field */
    setIsBlurred: (blurred: boolean) => void
    /**
     * Add a callback which will be called when the blur status for this field
     * changes
     */
    addBlurListener: (listener: Listener<boolean>) => Unsubscribe

    /** Get the current changed status for this field */
    isChanged: () => boolean
    /** Set the current changed status for this field */
    setIsChanged: (isChanged: boolean) => void
    /**
     * Add a callback which will be called when the change status for this field
     * changes
     */
    addIsChangedListener: (listener: Listener<boolean>) => Unsubscribe

    /**
     * Narrow the form field's type to a subtype. This is useful when your form data is
     * polymorphic.
     *
     * @param witness (optional). This is unused except for type inference. The witness
     *   is likely the result of observing the field data with `useFieldData` and
     *   narrowing its type based on some condition
     */
    narrow: <SubType extends Data>(witness?: SubType) => FormField<SubType>

    _internal: {
        addDeepErrorsListener: (subscriber: Subscriber) => Unsubscribe
    }
} & (Writable extends true ? {
    /** Set the data for the field */
    setData: (setter: Setter<Data>, opts?: SetDataOpts) => void
} : {});

export type Listener<T> = (value: T) => void;

type IsUnion<T, U = T> =
    T extends any ? ([U] extends [T] ? false : true) : never;

type DistributeOmit<T, K extends PropertyKey> =
    T extends any ? Omit<T, K> : never;

type MemberValue<T, K extends PropertyKey> =
    T extends any ? (K extends keyof T ? T[K] : never) : never;

// Safe-to-set rule for object key K on (possibly-union) object Data
type KeyWritable<Data extends object, K extends keyof Data> =
    IsUnion<Data> extends true
        ? (
            // does the property's value type vary across union members?
            IsUnion<MemberValue<Data, K>> extends true
                // if yes, only writable if the rest of the object does NOT vary
                ? (IsUnion<DistributeOmit<Data, K>> extends true ? false : true)
                // if value doesn't vary, writable
                : true
            )
        // non-union object: writable
        : true;

type GetObjectKey<Data extends object, Writable extends boolean> =
    <K extends keyof Data>(key: K) => FormField<Data[K], Writable extends true ? KeyWritable<Data, K> : false>;

type GetArrayIndex<E> = (idx: number) => FormField<E | undefined, false>;
type ArrayMethods<E> = {
    /** Push one or more elements onto the end of the array */
    push: (...items: E[]) => void
    /** Remove the element at the specified index */
    remove: (index: number) => void
}

export type FormField<Data, Writable extends boolean = true> =
    BaseField<Data, Writable> &
    ([Data] extends [ReadonlyArray<infer E>]
        ? (GetArrayIndex<E> & (Writable extends true ? ArrayMethods<E> : {}))
        : [Data] extends [object]
            ? GetObjectKey<Extract<Data, object>, Writable>
            : {});

export type ReadonlyFormField<Data> = FormField<Data, false>;
