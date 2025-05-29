---
title: ForEachElement
description: A component for safely iterating array elements in a Formula form
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

```tsx
const form = useForm({
   initialValues: {
       tags: ["typescript", "react"]
   }
});
return (
    <ForEachElement field={form("tags")}>
        { tagField => <Input field={tagField} /> }
    </ForEachElement>
)
```
