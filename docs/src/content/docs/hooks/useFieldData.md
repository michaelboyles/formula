---
title: useFieldData
description: A hook to get the value for a form field
slug: hooks/useFieldData
---

A hook to subscribe to a field's data. It will only trigger a rerender when the value changes.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "admin" }
});
const username = useFieldData(form("username"));
//^? string
return (
    <div>Username: { username }</div>
)
```

## Type

```typescript
function useFieldData<T>(field: FormField<T>): T;
function useFieldData(field: null): null;
function useFieldData(field: undefined): undefined;
```
