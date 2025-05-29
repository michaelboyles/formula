---
title: useFieldErrors
description: A hook to get the errors for a form field
slug: hooks/useFieldErrors
---

```typescript
function useFieldErrors(field: FormField<any>): ReadonlyArray<string>
```

`useFieldErrors` subscribes to the validation errors for a field. It will only trigger a rerender when the value
changes.

## Sample usage

```tsx
const form = useForm({
   //... 
});
const errors = useFieldErrors(form("username"));
//^? ReadonlyArray<string> | undefined
if (errors && errors.length) {
    return (
        <div>
            Issues:
            <ul>
            {
                errors.map((err, idx) => <li key={idx}>{ err }</li>)
            }
            </ul>
        </div>
    )
}
```
