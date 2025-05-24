---
title: Checkbox
description: A checkbox component
---

The `Checkbox` component creates an `<input type="checkbox">` with all the handlers
required for interacting with Formula. It accepts all the attributes that `<input>` does, except
`checked` (managed automatically) and `type` (always `checkbox`).

```typescript jsx
<Checkbox field={form.get("isPublic")} data-testid="checkbox" />
```

See also: [input attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes)
