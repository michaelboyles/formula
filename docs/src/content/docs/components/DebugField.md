---
title: DebugField
description: A component for debugging a Formula field
slug: components/DebugField
---

`<DebugField>` renders a `<pre>` element containing the entire state of the given field as JSON. Like the name suggests,
it's designed to help you debug issues with your form.

## Sample usage 

```tsx
const form = useForm({
   initialValues: { name: "" }
});
return (
    <DebugField field={form("name")} />
)
```

### Sample output

```json
{
  "path": "name",
  "data": "",
  "blurred": false,
  "isChanged": false,
  "errors": []
}
```

## Type

```typescript
function DebugField(props: {
    // The field to print debug info for
    field: FormField<any>
}): ReactNode
```
