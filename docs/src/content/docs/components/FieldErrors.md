---
title: FieldErrors
description: A component for watching the errors for a Formula field
slug: components/FieldErrors
---

```typescript
function FieldErrors<T>(props: {
    field: FormField<T>
    children: (value: ReadonlyArray<string>) => ReactNode
})
```

`<FieldErrors>` lets you watch the errors for a field. It accepts a field and a render prop as its child, which
is called every time the errors for the field change.

The counterpart hook is [`useFieldErrors`](/hooks/useFieldErrors).

## Sample usage 

```tsx
const form = useForm({
   initialValues: { name: "" }
});
const nameErrors = useFieldErrors(form.get("name"));
return (
    <FieldErrors field={form.get("name")}>
    { errors => errors && errors.length ?
        <ul>
            { errors.map((err, idx) => <li key={idx}>{ err }</li>) }  
        </ul>
        : null
    }
    </FieldErrors>
)
```
