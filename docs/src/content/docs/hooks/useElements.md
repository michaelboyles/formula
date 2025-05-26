---
title: useElements
description: A hook for mapping over the elements of an array in Formula
slug: hooks/useElements
---

```typescript
function useElements<T>(field: FormField<T[]>): ReadonlyArray<FormField<T>>
```

`useElements` lets you map over the elements in an array in a typesafe way. It will only rerender when the number
of elements changes. This means the value of a specific element can change without rerendering this hook, which
would cause rerenders of every element.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        tags: ["typescript", "react"]
    }
});
const tagFields = useElements(form.get("tags"));
return (
    <ul>
    {
        tagFields.map((tagField, idx) => <li key={idx}><Input field={tagField} /></li>)
    }
    </ul>
)
```
