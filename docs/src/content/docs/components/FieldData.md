---
title: FieldData
description: A component for watching a value in a Formula form
slug: components/FieldData
---

`<FieldData>` lets you watch the value of a field's data. It accepts a field and a render prop as its child, which
is called every time the data changes.

The counterpart hook is [`useFieldData`](/formula/hooks/useFieldData).

## Sample usage 

```tsx
const form = useForm({
   initialValues: { name: "" }
});
return (
    <FieldData field={form("name")}>
        { name => <div>Your name is: {name} </div> }
    </FieldData>
)
```

## Type

```typescript
function FieldData<T>(props: {
    // The field to watch the value for
    field: FormField<T>
    // A render function which will be passed the value
    children: (value: T) => ReactNode
}): ReactNode
```
