---
title: Array fields
description: Using arrays as form data in Formula
---

To ensure type-safety while preventing unnecessary rerenders, array fields in Formula require a little extra
ceremony. Since `form("myArray")` is a reference to a slice of form state, it's not in itself an array that can be
mapped over.

`form("myArray").getValue()` would give you a snapshot that could be mapped over, but it has no reactivity. Your
component won't rerender when the elements change.

For that reason, there are two special ways of iterating over an array's elements:

- the [`useElements` hook](/hooks/useElements)
- the [`<ForEachElement>` component](/components/ForEachElement) (implemented using `useElements`)

The idea is the same in both cases: to take a `FormField<T[]>` and safely convert it to `FormField<T>[]`, and to have
that be recomputed if the array length changes.

```tsx
type Tag = {
    label: string
}

const form = useForm({
    initialValues: {
        tags: [{ label: "typescript" }] as Tag[]
    },
    submit: post => createNewPost(post)
});

const tagsField = form("tags");
return (
    <ForEachElement field={form("tags")}>
    {
        tagField => <Input field={tagField("label")} />
    }
    </ForEachElement>
)
```

## Adding and removing elements

Form fields for array types provide a few extra helper methods for common operations:

 - `push(items: ...E[])`
 - `remove(idx: number)`

```tsx
const form = useForm({
    initialValues: {
        tags: [{ label: "typescript" }] as Tag[]
    },
    submit: post => createNewPost(post)
});
const addTag = () => form("tags").push({ label: "" });
return (
    <form>
        <ForEachElement field={form("tags")}>
        {
            (tagField, idx) => (
                <div>
                    <Input field={tagField("label")} />
                    <button onClick={() => form("tags").remove(idx)}>X</button>
                </div>
            )
        }
        </ForEachElement>
        <button type="button" onClick={() => addTag()}>Add tag</button>
    </form>
)
```
