---
title: TextArea
description: A textarea component
---

The `<TextArea>` component creates a `<textarea>` with its value field bound, and all the handlers
required for interacting with Formula.

```typescript jsx
<TextArea field={form.get("description")} />
```

## Required props 

### field 

The form field to associate with this control.

## Optional props

### Native attributes

`<TextArea>` supports [all attributes of the native `<textarea>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/textarea#attributes)
