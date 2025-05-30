---
title: Fields
description: An introduction to the Form Field concept within Formula
---

Within Formula, every part of your form data is considered a field, not just primitive types like `string` that can be 
associated with a form control. That means fields can contain other fields. In this form data:

```typescript
type Post = {
    content: string
    tags: Array<{ label: string }>
}
```

... `content` is a field, but so is `tags`, and `tags[0]`, and `tags[0].label`.

## Accessing a field

The form instance returned by [`useForm`](/hooks/useForm) is a function you can call to access individual fields in
a type-safe way.

```typescript
const form = useForm({
    initialValues: {
        username: "",
        password: ""
    },
    submit: values => login(values)
});
// ✅ type is FormField<string>
const usernameField = form("username");

// ❌ Argument of type "title" is not assignable to 
//    parameter of type "username" | "password"
const unknownField = form("title");
```

A field is basically a type-safe reference to a slice of the form data. It doesn't contain any data, but it knows
how to get a snapshot and how to subscribe to updates. For that reason, Fields have a `getValue()` function, but they
don't (and couldn't) have a `.value` property.

The reason the name `form` is used above, rather than say `getField`, is because `form` is also an object with
methods like `submit` and `reset`. It might be a surprise to some beginners that
[JavaScript functions can also define
properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions).

```tsx
const form = useForm({/* ... */});
const usernameField = form("username");
form.reset();
form.submit();
```

## Nested fields

Fields work in exactly the same way as `form` above: they're callable function which also have methods.

```tsx
const form = useForm({
    initialValues: {
        address: { number: "", street: "", city: "" }
    }
});
// ✅ type is FormField<string>
const streetField = form("address")("street");
form("address").setValue({ number: "123", street: "Fake St", city: "" });
```

## Subscribing to a field's value

As we covered, a field is a reference to a slice of form data, rather than the form data itself. It can provide a
snapshot, but how can we subscribe to the value?

For a lot of simple forms, often you don't need to. The built-in controls like [`<Input>`](/components/Input) accept a
`FormField` and will create a subscription and bind that value to the control.

If you need to implement your own controls, or you need to use a value somewhere besides a controlled input, then you
can subscribe to the field's value using the [`useFieldValue` hook](/hooks/useFieldValue).
