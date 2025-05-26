---
title: Array fields
description: Using arrays as form data in Formula
---

If you have an array field in Formula, one of the things you'll notice is that `form.get("myArrayField")` will
return a different type to, say, a plain `string` field.

To access the array elements and their child fields in a typesafe way, there are two special ways of iterating
over the elements:

- the [`useElements` hook](/hooks/useElements)
- the [`<ForEachElement>` component](/components/ForEachElement)

Both function the same, so the choice is purely stylistic.

```typescript jsx
type Tag = {
    label: string
}
type TagList = {
    tags: Tag[]
}

const form = useForm({
    initialValues: {
        tags: []
    } as TagList,
    submit: post => createNewPost(post)
});

const tagsField = form.get("tags");
return (
    <form onSubmit={form.submit}>
        <ForEachElement field={tagsField}>
        {
            tagField => <Input field={tagField.property("label")} />
        }
        </ForEachElement>
        <button
            type="button"
            onClick={() => tagsField.push({ label: "" })}
        >
            + Add tag
        </button>
        <button type="submit">Create post</button>
    </form>
)
```

## Adding and removing elements

todo

