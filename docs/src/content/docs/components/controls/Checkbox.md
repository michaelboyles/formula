---
title: Checkbox
description: A component for creating checkboxes in Formula
slug: components/Checkbox
---

The `Checkbox` component renders an `<input type="checkbox">` element whose value field is bound and includes all
handlers required.

```tsx
<Checkbox field={form.get("isPublic")} data-testid="checkbox" />
```

## Required props

### field

The form field to associate with this control.

## Optional props

`<Checkbox>` supports [all the values of `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes)
except for `checked` (managed automatically) and `type` (always `checkbox`).
