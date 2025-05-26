---
title: Checkbox
description: A checkbox component
slug: components/Checkbox
---

The `Checkbox` component creates an `<input type="checkbox">` with its value field bound and all the handlers
required for interacting with Formula.

```tsx
<Checkbox field={form.get("isPublic")} data-testid="checkbox" />
```

## Required props

### field

The form field to associate with this control.

## Optional props

`<Checkbox>` supports [all the values of `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes)
except for `checked` (managed automatically) and `type` (always `checkbox`).
