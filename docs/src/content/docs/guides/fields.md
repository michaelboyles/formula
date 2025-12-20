---
title: Fields
description: An introduction to the FormField concept within Formula
---

Within Formula, every part of your form data is considered a field, not just primitive types like `string` that can be 
associated with a form control. That means fields can contain other fields. In the form data type below, `content` is a
field, but so is `tags`, and `tags[n]`, and `tags[n].label`. The `Post` type itself is also a field.

```typescript
type Post = {
    content: string
    tags: Array<{ label: string }>
}
```

Fields are represented by the [`FormField`](/formula/types/FormField) type. They used as arguments to many of Formula's
hooks, and are used as props in many of Formula's components.

A `FormField` is basically a type-safe reference to a slice of the form data. It doesn't contain any data, but it knows
how to get a snapshot of the data and how to subscribe to updates. For that reason, `FormField` has a `getData()`
function, but it cannot have a `.data` property.

## Accessing a field

The form instance returned by [`useForm`](/formula/hooks/useForm) is a function you call to access individual fields in
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

In addition to being a function you can call to obtain a field, `form` also has methods like `submit` and `reset`. This
is perhaps the biggest quirk of Formula's API, as it might be a surprise to some users that
[JavaScript functions can also define properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#:~:text=They%20can%20also%20have%20properties%20and%20methods%20just%20like%20any%20other%20object).

```tsx
const form = useForm({/* ... */});
const usernameField = form("username");
form.reset();
form.submit();
```

For this reason, it very rarely makes sense to immediately destructure the result of `useForm`.

```typescript
const { submit } = useForm({/* ... */}); // ❌ cannot access fields
```

## Nested fields

Fields behave in exactly the same way as the top-level `form` above: they're functions you can invoke to obtain a
subfield, as well as having their own methods.

```tsx
const form = useForm({
    initialValues: {
        address: { number: "", street: "", city: "" }
    }
});
// ✅ type is FormField<string>
const streetField = form("address")("street");
form("address").setData({ number: "123", street: "Fake St", city: "" });
```

## Subscribing to a field's data

As we covered, a field is a reference to a slice of form data, rather than the form data itself. It can provide a
snapshot, but how can we subscribe to the value?

For many simple forms, often you don't need to explicitly subscribe. The built-in controls like
[`<Input>`](/formula/components/Input) accept a `FormField` and will create a subscription and bind the value to the control.

If you need to implement your own controls, or you need to use a value somewhere besides a controlled input, then you
can subscribe to the field's data using the [`useFieldData` hook](/formula/hooks/useFieldData). Other hooks allow you
to subscribe to field's metadata such as errors and blur status.
