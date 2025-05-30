---
title: Checkbox
description: A component for creating checkboxes in Formula
slug: components/Checkbox
---

The `<Checkbox>` component renders an `<input type="checkbox">` element whose value field is bound and which includes
all of Formula's required handlers.

## Sample usage

```tsx
const form = useForm({
    initialValues: { isPublic: true }
});
return (
    <Checkbox field={form("isPublic")} className="my-checkbox" />
)
```

## Type

```typescript
function Checkbox(props: {
    // The field to associate with this checkbox
    field: FormField<boolean>
}
& Omit<DefaultCheckboxProps, "type" | "checked">)
```

### Native props

`<Checkbox>` supports [all the values of `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes)
except for `checked` (managed automatically) and `type` (always `checkbox`).
