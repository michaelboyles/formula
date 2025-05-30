---
title: ForEachElement
description: A component for safely iterating array elements in a Formula form
slug: components/ForEachElement
---

```typescript
function ForEachElement<T>(props: {
    // The array field to iterate over
    field: FormField<T[]>

    // A render function that will be used for each child
    // `element`: the child to render
    // `idx`: the index of the child to render. Mostly useful for removing by index
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
