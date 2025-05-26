---
title: Fields
description: A guide
---

Within Formula form data, everything's considered a field, not just primitive types like `string` that can be 
associated with a form control. That means fields can contain other fields. In this form data

```typescript
type Post = {
    content: string
    tags: Array<{ label: string }>
}
```

... `content` is a field, but so is `tags`, and `tags[0]`, and `tags[0].label`.

## Accessing a field

The form returned by [`useForm`](/hooks/useForm) provides methods to create field instances. These methods are
type-safe, resulting in compiler errors if a field doesn't exist.

```typescript
const form = useForm({
    initialValues: {
        username: "",
        password: ""
    },
    submit: values => login(values)
});
// ✅
const usernameField = form.get("username");

// ❌ Argument of type "title" is not assignable to 
//    parameter of type "username" | "password
const unknownField = form.get("title");
```

A field is basically a type-safe reference to a slice of the form data. It doesn't contain the data, but it knows
how and where to get it. For that reason, Fields have a `getValue()` function, but they don't (and couldn't) have a
`.value` property.

## Subscribing to a field's value

To subscribe to a field's value, use the [`useFieldValue` hook](/hooks/useFormValue), or often you can use
one of the built-in controls, e.g. [`<Select>`](/components/Select).

```tsx
const username = useFieldValue(form.get("username"));
return (
    <div>Username is: { username }</div>
)
```
