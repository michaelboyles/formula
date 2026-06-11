---
title: useFieldErrors
description: A hook to get the errors for a form field
slug: hooks/useFieldErrors
---

`useFieldErrors` subscribes to the validation errors for a field. It will only trigger a rerender when the errors
change.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "" }
});
const errors = useFieldErrors(form("username"));
//^? ReadonlyArray<StandardSchemaV1.Issue>
if (errors.length) {
    return (
        <div>
            Issues: { errors.map(error => error.message).join(", ") }
        </div>
    )
}
```

## Type

```typescript
function useFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<StandardSchemaV1.Issue>
```
