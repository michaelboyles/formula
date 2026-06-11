---
title: FieldErrors
description: A component for watching the errors for a Formula field
slug: components/FieldErrors
---

`<FieldErrors>` lets you watch the validation errors for a field. It accepts a field and a render prop as its child,
which is called every time the errors for the field change.

The counterpart hook is [`useFieldErrors`](/formula/hooks/useFieldErrors).

## Sample usage 

```tsx
const form = useForm({
   initialValues: { name: "" }
});
const nameErrors = useFieldErrors(form("name"));
return (
    <FieldErrors field={form("name")}>
    { errors => errors.length ?
        <ul>
            { errors.map((err, idx) => <li key={idx}>{ err.message }</li>) }  
        </ul>
        : null
    }
    </FieldErrors>
)
```

## Type

```typescript
function FieldErrors<T>(props: {
    // The field to watch the errors for
    field: ReadonlyFormField<T>
    // A render function which will be passed the errors
    children: (value: ReadonlyArray<StandardSchemaV1.Issue>) => ReactNode
}): ReactNode
```
