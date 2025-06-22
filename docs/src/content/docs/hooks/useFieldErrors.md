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
//^? ReadonlyArray<string>
if (errors.length) {
    return (
        <div>
            Issues: { errors.join(", ") }
        </div>
    )
}
```

## Type

```typescript
function useFieldErrors(field: FormField<any>): ReadonlyArray<string>
```
