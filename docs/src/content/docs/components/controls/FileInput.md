---
title: FileInput
description: A component for creating file input controls in Formula
slug: components/FileInput
---

`<FileInput>` renders a native `<input type="file">` element which includes all of Formula's required handlers.

Unlike the other built-in controls, it doesn't bind a value because that's not possible with file inputs in JavaScript.
Instead, it uses `useEffect` to keep the value in-sync.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        file: null as FileList | null
    }
});
return (
    <form onSubmit={form.submit}>
        <FileInput field={form("file")} />
    </form>
)
```

## Type

```typescript
function FileInput(props: {
    // The field to associate with this file input
    field: FormField<FileList | null>
} & Omit<DefaultInputProps, "type">) 
```

### Native props

`<FileInput>` supports
[all props of the native `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes),
except for `type` which is hardcoded to `file`.
