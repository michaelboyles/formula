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
    <IntegerInput field={form("myNum")} />
)
```

## Type

```typescript
function IntegerInput(props: {
    // The field to associate with this input
    field: FormField<number>
} & Omit<DefaultInputProps, "type" | "value">)
```

### Native props

`<IntegerInput>` supports
[all props of the native `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes),
except `type` which is hardcoded to `number`, and `value` which is bound automatically.
