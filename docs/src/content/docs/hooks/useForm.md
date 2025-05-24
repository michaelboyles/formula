---
title: useForm
description: Formula useForm documentation
---

This tells you about `useForm`

```typescript
const form = useForm({
    initialValues: {
        username: "",
        password: ""
    },
    submit: values => login(values.username, values.password)
});
```

## Required Options

### initialValues 

Use to specify the initial values to the form. This can be either an object or a supplier function.

### submit

A function which should submit the form. It accepts the values of the form and returns some result.

## Optional Options

