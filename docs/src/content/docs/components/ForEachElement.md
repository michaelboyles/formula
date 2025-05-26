---
title: ForEachElement
description: todo
slug: components/ForEachElement
---

```typescript
function ForEachElement<T>(props: {
    field: FormField<T[]>
    children: (element: FormField<T>, idx: number) => ReactNode
})
```

`<ForEachElement>` safely iterates array elements. It accepts an array field and a render prop as its child, which
is called once for each element.

The counterpart hook is [`useElements`](/hooks/useElements).

## Sample usage 

```typescript jsx
const form = useForm({
   initialValues: {
       tags: ["typescript", "react"]
   }
});
return (
    <ForEachElement field={form.get("tags")}>
        { tagField => <Input field={tagField} /> }
    </ForEachElement>
)
```
