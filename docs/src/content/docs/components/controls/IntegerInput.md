---
title: IntegerInput
description: A component for creating integer inputs within Formula
slug: components/IntegerInput
---

`<IntegerInput>` renders an `<input type="number">` element whose value field is bound and includes all of Formula's
required handlers.

`NaN` is used to represent a blank field. It's also used for "intermediate values": strings which aren't themselves
a valid number but might become one after additional keystrokes. For example, `+`, `-`, or `-.`.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        myNum: NaN // start as blank
    }
});
return (
    <IntegerInput field={form.get("myNum")} />
)
```
