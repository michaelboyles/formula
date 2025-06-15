---
title: useForm
description: Formula useForm documentation
slug: hooks/useForm
---

`useForm` is the entry point to Formula. It creates a new form.

## Sample usage

```tsx
const form = useForm({
    initialValue: { username: "", password: "" },
    submit: data => login(data.username, data.password),
    onSuccess: ({ data }) => {
        toast("Logged in");
    },
    onError: ({ error }) => {
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
    // The initial values for the form. This is the only required option.
    initialValues: Data | (() => Data)

    // A function invoked when the form is submitted. This can be omitted if you want to use native form submission
    submit?: (data: Data) => SubmitResponse | Promise<SubmitResponse>

    // A callback invoked when the form was successfully submitted
    // `result`: the value returned from `submit`
    // `data`: the form data that was submitted
    // `form`: a reference to the Formula form instance
    onSuccess?: (args: { result: NoInfer<SubmitResponse>, data: Data, form: Form<Data> }) => void

    // A callback invoked when there is a form submission error.
    // `error`: The error that was thrown. If a non-Error was thrown, then it will be wrapped in one, and Error.cause
    //          will be set.
    // `data`: the form data that was submitted
    // `form`: a reference to the Formula form instance
    onError?: (args: { error: Error, data: Data, form: Form<Data> }) => void

    // A Formula native validator
    validate?: Validator<NoInfer<Data>, NoInfer<Data>>

    // A list of Standard Schema validators (e.g. Zod)
    validators?: ReadonlyArray<StandardSchemaV1<Partial<Data>>>

    // Whether to perform validation after a field is blurred. Default: false
    validateOnBlur?: boolean

    // Whether to perform validation after a field is changed. Default: false
    validateOnChange?: boolean
}): Form<Data>

type Form<Data> = (<K extends keyof Omit<Data, symbol>>(key: K) => FormField<Data[K]>) & {
    // Submits the form. You will likely wire this to `<form onSubmit={form.submit}>`, but there may be cases
    // where you call it programmatically.
    submit: (e?: FormEvent) => void

    // Get a field, ignoring type-safety. Generally you should use 'get' instead.
    getUnsafeField: (path: (string | number)[]) => FormField<unknown>

    // Get the current form data
    getData: () => Data

    // Set the current form data
    setData: (data: Data) => void

    // Discards the current form state and sets the value using `initialValues`
    reset: () => void
}

type BaseForm = Record<string | number, any>
```
