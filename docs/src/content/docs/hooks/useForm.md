---
title: useForm
description: Formula useForm documentation
slug: hooks/useForm
---

`useForm` is the entry point to Formula. It creates a new form.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "", password: "" },
    submit: data => login(data.username, data.password),
    onSubmitSuccess: ({ data }) => {
        toast(`Logged in as ${data.username}`);
    },
    onSubmitFailure: ({ error }) => {
        console.error("Failed to login", error);
    }
});
return (
    <form onSubmit={form.submit}>
        <Input field={form("username")} />
        <Input field={form("password")} type="password" />
        <button type="submit">Login</button>
    </form>
)
```

## Type

```tsx
function useForm<Data extends BaseForm, SubmitResponse>(opts: {
    /** The initial values for the form. This is the only required option. */
    initialValues: Data | (() => Data)

    /**
     * A function invoked when the form is submitted. This can be omitted if you want to
     * use native form submission
     */
    submit?: (data: Data) => SubmitResponse | Promise<SubmitResponse>

    /** A callback invoked when the form was successfully submitted */
    onSubmitSuccess?: (args: {
        /** The value returned from `submit` */
        result: NoInfer<SubmitResponse>
        /** The form data that was submitted */
        data: Data
        /** The same form instance returned by `useForm` */
        form: Form<Data>
    }) => void

    /** A callback invoked when submitting the form fails */
    onSubmitFailure?: (args: {
        /**
         * The error that was thrown. If submission failed because of validation
         * issues, this will be a ValidationError. If a non-Error was thrown,
         * then it will be wrapped in one, and Error#cause will be set.
         */
        error: Error
        /** The form data that was submitted */
        data: Data
        /** The same form instance returned by `useForm` */
        form: Form<Data>
    }) => void

    /** A Formula native validator */
    validate?: Validator<NoInfer<Data>, NoInfer<Data>>

    /** A list of Standard Schema validators (e.g. Zod) */
    validators?: ReadonlyArray<StandardSchemaV1<Partial<Data>>>

    /**
     * Whether to perform validation after a field is blurred
     * @default false
     */
    validateOnBlur?: boolean

    /**
     * Whether to perform validation after a field is changed
     * @default false
     */
    validateOnChange?: boolean

    /** Undo/redo options */
    history?: {
        /**
         * The max number of changes to store in the undo history
         * @default 0 (no history)
         */
        maxSize?: number
    }
}): Form<Data>

type Form<Data> = FormField<Data> & {
    /**
     * Submits the form. You will likely wire this to `<form onSubmit={form.submit}>`,
     * but there may be cases where you call it programmatically.
     *
     * If an event is provided, `preventDefault` will be called on it.
     *
     * The returned promise can be used to know whether submission succeeded when
     * you submit programmatically, and can be safely ignored otherwise.
     */
    submit: (e?: FormEvent) => Promise<FormSubmitResult>

    /** Get a field, ignoring type-safety. Generally you should use 'get' instead */
    getUnsafeField: (path: (string | number)[]) => FormField<unknown>

    /** Discards the current form state and sets the value using `initialValues` */
    reset: () => void

    /**
     * Performs validation of the current form data. Returns a promise indicating
     * whether the data was valid
     */
    validate: () => Promise<boolean>

    /** Undo/redo state and functions */
    history: {
        canUndo: boolean
        undo: () => void
        canRedo: boolean
        redo: () => void
    }
}
```

As shown above, the `Form` is also [`FormField`](/formula/types/FormField) itself, so all the methods of `FormField`
are available on the form.
