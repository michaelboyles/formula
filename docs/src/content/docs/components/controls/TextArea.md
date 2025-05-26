---
title: TextArea
description: A component for creating textarea controls in Formula
slug: components/TextArea
---

The `<TextArea>` component renders a `<textarea>` element whose value field is bound and includes all handlers
required for interacting with Formula.

```tsx
<TextArea field={form.get("description")} />
```

## Required props 

### field 

The form field to associate with this control.

## Optional props

### Native attributes

`<TextArea>` supports [all attributes of the native `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea#attributes)
