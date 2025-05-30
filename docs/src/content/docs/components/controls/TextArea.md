---
title: TextArea
description: A component for creating textarea controls in Formula
slug: components/TextArea
---

The `<TextArea>` component renders a `<textarea>` element whose value field is bound and which includes
all of Formula's required handlers.

## Sample usage

```tsx
const form = useForm({
    initialValues: { content: "" }
});
return (
    <TextArea field={form("content")} />
)
```

## Type

```typescript
function TextArea(props: {
    // The field to associate with this textarea
    field: FormField<string>
} & Omit<DefaultInputProps, "value">)
```

### Native props

`<TextArea>` supports [all props of the native `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea#attributes), except for `value` which is bound automatically.
