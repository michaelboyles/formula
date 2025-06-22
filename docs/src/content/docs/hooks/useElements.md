---
title: useElements
description: A hook for mapping over the elements of an array in Formula
slug: hooks/useElements
---

`useElements` lets you map over the elements in an array in a typesafe way. It effectively converts `FormField<T[]>`
to `FormField<T>[]`.

This hook will only trigger a rerender when the number of elements changes. Changes to the values in the array will not
trigger a rerender.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        tags: ["typescript", "react"]
    }
});
const tagFields = useElements(form("tags"));
return (
    <ul>
    {
        tagFields.map((tagField, idx) =>
            <li key={idx}><Input field={tagField} /></li>
        )
    }
    </ul>
)
```

## Type

```typescript
function useElements<T>(field: FormField<T[]>): ReadonlyArray<FormField<T>>
```
