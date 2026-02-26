---
title: FormField
description: A type representing a field in Formula
slug: types/FormField
---

A `FormField` is a reference to a slice of your form's state. Many of Formula's hooks accept a `FormField` as a
parameter, and the in-built form control components all accept a `FormField` as a prop.

The return value of [`useForm`](/formula/hooks/useForm) is a `FormField`, just with a few additional capabilities
compared to other `FormField`s.

## Type

```typescript
type FormField<Data, SetData = Data> = {
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
}

type Setter<T> = T | ((prevData: T) => T)

type SetDataOpts = {
    // Whether to validate the data after setting it.
    // Default: will validate if `useForm#validateOnChange` is true.
    shouldValidate?: boolean;

    // The change status for the field after setting the data. 'retain' will leave the
    // change status untouched
    // Default: true
    nextChangeStatus?: boolean | "retain";
}
```

## Object fields

If `Data` is an object, the type of `FormField` is additionally a function which can be called with keys of the object
to obtain a `FormField` for the subfield.

```typescript
type GetObjectKey<Data extends object> =
    <K extends keyof Data>(key: K) => FormField<Data[K]>
```

## Array fields

If `Data` is an array, the type of `FormField` is additionally a function which can be called with an array index
to obtain a `FormField` for that element.

There are also convenience methods for common operations.

```typescript
type GetArrayIndex<E> = (idx: number) => FormField<E | undefined, E>;
type ArrayMethods<E> = {
    // Push one or more elements onto the end of the array
    push: (...items: E[]) => void
    // Remove the element at the specified index
    remove: (index: number) => void
}
```
