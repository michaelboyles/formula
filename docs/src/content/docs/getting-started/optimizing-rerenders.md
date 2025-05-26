---
title: Optimizing rerenders
description: How to optimize rerender behaviour in Formula
---

Formula is built with granular updates in mind. If you're only using built-in controls, then rerendering is already
optimized. In the example below, typing in the input does **not** cause `MyForm` to rerender. The number of renders will
stay at 1 (or 2 in strict mode).

```tsx
function MyForm() {
    const renderCount = useRef(0);
    renderCount.current++;
    const form = useForm({
        initialValues: { name: "" },
        submit: values => doSubmit(values)
    });
    return (
        <form onSubmit={form.submit}>
            <div>MyForm renders: { renderCount.current }</div>
            Name:
            <Input field={form.get("name")} />
        </form>
    )
}
```

As you build more complex forms and make use of Formula's hooks (except for `useForm`), you may introduce unnecessary
rerenders. This isn't always an issue, but it can affect performance. You should write whatever's most readable and
optimize it once you know there's an issue.

Suppose we need the `name` value elsewhere in our form. We modify our code to use the
[`useFieldValue` hook](/hooks/useFieldValue).

```tsx
const renderCount = useRef(0);
renderCount.current++;
const form = useForm({/*...*/});
const name = useFieldValue(form.get("name"));
return (
    <form onSubmit={form.submit}>
        <div>MyForm renders: { renderCount.current }</div>
        Name: <Input field={form.get("name")} />
        <div>Your name is { name }</div>
    </form>
)
```

After this change, typing in the name input rerenders the entirety of `MyForm`, when really only the second `<div>` 
needs to rerender.

As is usually the case for React, optimizing rerenders is about putting things as far down in the tree as possible.
We can pass Formula fields as props, which is shown below. In fact, you could pass the whole form instance if you
wanted to. Accessing a field doesn't create a dependency. Only 

```tsx
function MyForm() {
    const renderCount = useRef(0);
    renderCount.current++;
    const form = useForm({/*...*/});
    return (
        <form onSubmit={form.submit}>
            <div>MyForm renders: { renderCount.current }</div>
            Name: <Input field={form.get("name")} />
            <NameSection nameField={form.get("name")} />
        </form>
    )
}

function NameSection(props: { nameField: FormField<string> }) {
    const name = useFieldValue(props.nameField);
    return (
        <div>Your name is { name }</div>
    )
}
```

The updated code now only rerenders `NameSection` when you type in the input. `MyForm` doesn't need to rerender because
it doesn't depend on the name. Some people might like this code, but it's unfortunate to force you to create an extra
component and force you to structure your code in a specific way.

For this reason, every hook in Formula ships with an equivalent component. You can use these components instead of
defining an otherwise-unnecessary component of your own. The equivalent component for `useFieldValue` is 
[`FieldValue`](/components/FieldValue). The components aren't special. They're simply implemented using their
respective hooks.

```tsx
function MyForm() {
    const renderCount = useRef(0);
    renderCount.current++;
    const form = useForm({/*...*/});
    return (
        <form onSubmit={form.submit}>
            <div>MyForm renders: { renderCount.current }</div>
            Name: <Input field={form.get("name")} />
            <FieldValue field={form.get("name")}>
                { (name: string) => <div>Your name is { name }</div> }
            </FieldValue>
            <NameSection nameField={form.get("name")} />
        </form>
    )
}
```

Like the previous version, this code prevents `MyForm` from rendering, but it's more concise and some people may find
it more readable.

## Hooks and their equivalent components

| Hook                                            | Component                                    |
|-------------------------------------------------|----------------------------------------------|
| [useElements](/hooks/useElements)               | [ForEachElement](/components/ForEachElement) |
| [useFieldErrors](/hooks/useFieldErrors)         |                                              |
| [useFieldValue](/hooks/useFieldValue)           | [FieldValue](/components/FieldValue)         |
| [useIsSubmitting](/hooks/useIsSubmitting)       | [IsSubmitting](/components/IsSubmitting)     |
| [useSubmissionError](/hooks/useSubmissionError) |                                              |
