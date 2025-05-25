---
title: Overview
description: A guide
---

Formula is a library for managing forms in React. It supports complex form data structures, including nested objects and
arrays. It's fully type safe and built to re-render only when necessary.

Here's a simple example:

```typescript jsx
type BlogPost = {
    title: string
    content: string
    isDraft: boolean
}

function NewBlogPostPage() {
    const form = useForm({
        initialValues: {
            title: "",
            content: "",
            isDraft: false
        } satisfies BlogPost,
        submit: post => createNewPost(post)
    });
    return (
        <form onSubmit={form.submit}>
            <Input field={form.get("title")} />
            <TextArea field={form.get("content")} />
            <label>
                Draft?
                <Checkbox field={form.get("isDraft")} />
            </label>
            <button type="submit">Create post</button>
        </form>
    )
}
```
