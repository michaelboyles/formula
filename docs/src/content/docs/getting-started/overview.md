---
title: Overview
description: An introduction to Formula
tableOfContents: false
---

Formula is a library for managing forms in React. It supports complex form data structures, including nested objects and
arrays. It's fully type safe and built to only re-render when necessary.

Here's a simple example:

```tsx
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
            <Input field={form("title")} />
            <TextArea field={form("content")} />
            <label>
                Draft?
                <Checkbox field={form("isDraft")} />
            </label>
            <button type="submit">Create post</button>
        </form>
    )
}
```
