---
title: useForm
description: Formula useForm documentation
slug: hooks/useForm
---

`useForm` is the entry point to Formula. It creates a new form.

```typescript
const form = useForm({
    initialValues: {
        username: "",
        password: ""
    },
    submit: values => login(values.username, values.password)
});
```

## Return value

todo

## Required options

### initialValues 

Use to specify the initial values to the form. This can be either an object or a supplier function.

### submit

A function which should submit the form. It accepts the values of the form and returns some result.

## Optional options

### onSuccess

A callback which is invoked when the form submission is successful.

### onError

A callback which is invoked when the form submission failed.

### validate

Native Formula validation

### validators

An array of [standard-schema-compliant](https://github.com/standard-schema/standard-schema?tab=readme-ov-file#what-schema-libraries-implement-the-spec)
validators, e.g. [Zod](https://zod.dev/), [Valibot](https://valibot.dev/), [ArkType](https://arktype.io/).
