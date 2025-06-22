---
title: useFieldValue
description: A hook to get the value for a form field
slug: hooks/useFieldValue
---

`useFieldValue` subscribes to the value of a field. It will only trigger a rerender when the value changes.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "admin" }
});
const username = useFieldValue(form("username"));
//^? string
return (
    <div>Username: { username }</div>
)
```

## Type

```typescript
function useFieldValue<T>(field: FormField<T>): T
```
