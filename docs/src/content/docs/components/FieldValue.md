---
title: FieldValue
description: A component for watching a value in a Formula form
slug: components/FieldValue
---

`<FieldValue>` lets you watch the value of a field. It accepts a field and a render prop as its child, which
is called every time the value changes.

The counterpart hook is [`useFieldValue`](/hooks/useFieldValue).

## Sample usage 

```tsx
const form = useForm({
   initialValues: { name: "" }
});
return (
    <FieldValue field={form("name")}>
        { name => <div>Your name is: {name} </div> }
    </FieldValue>
)
```

## Type

```typescript
function FieldValue<T>(props: {
    // The field to watch the value for
    field: FormField<T>
    // A render function which will be passed the value
    children: (value: T) => ReactNode
})
```
