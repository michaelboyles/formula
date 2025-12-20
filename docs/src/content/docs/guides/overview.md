---
title: Overview
description: An introduction to Formula
tableOfContents: false
---

Formula is a library for managing forms in React. It supports complex form data structures, including nested objects and
arrays, and polymorphic data. It's fully type safe and built to only re-render when necessary.

Here's a simple example:

```tsx
import { Checkbox, Input, TextArea, useForm } from "@michaelboyles/formula";

type BlogPost = {
    title: string
    content: string
    isDraft: boolean
}

function NewBlogPostPage() {
    const form = useForm({
        initialValues: {
            title: "",
            content: "",
            isDraft: false
        } satisfies BlogPost,
        submit: post => createNewPost(post)
    });
    return (
        <form onSubmit={form.submit}>
            <Input field={form("title")} />
            <TextArea field={form("content")} />
            <label>
                Draft?
                <Checkbox field={form("isDraft")} />
            </label>
            <button type="submit">Create post</button>
        </form>
    )
}
```

There are 3 main concepts to understand: `useForm`, `FormField`s and form controls.

The [`useForm`](/formula/hooks/useForm) hook creates and stores the form state. The only required parameter is
`initialValues`, which defines the default values for each of the form's fields.

[`FormField`s](/formula/guides/fields) are obtained by in the above example by call the `form` function e.g.
`form("title")`. They're passed as props to the various form controls, so the controls know which values to bind.

Form controls. A control accepts a `FormField`, subscribes to the data and binds the value to a native version of
the control. Formula provides a set of built-in controls which wrap the native controls, or you can write your own.
