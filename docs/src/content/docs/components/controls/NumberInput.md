---
title: NumberInput
description: A component for creating numeric inputs within Formula
slug: components/NumberInput
---

`<NumberInput>` renders an `<input type="number">` element whose value field is bound and which includes
all of Formula's required handlers.

The value `NaN` is used when the field is blank. It's also used for "intermediate values": strings which aren't
themselves a valid number but might become one after additional keystrokes. For example, `+`, `-`, or `-.`.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        myNum: NaN // start as blank
    }
});
return (
    <NumberInput field={form("myNum")} />
)
```

## Type

```typescript
function NumberInput(props: {
    // The field to associate with this input
    field: FormField<number>
} & Omit<DefaultInputProps, "type" | "value">)
```

### Native props

`<NumberInput>` supports
[all props of the native `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes),
except `type` which is hardcoded to `number`, and `value` which is bound automatically.
