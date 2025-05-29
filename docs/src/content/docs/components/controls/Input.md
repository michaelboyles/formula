---
title: Input
description: A component for creating input controls in Formula
slug: components/Input
---

`<Input>` renders a native `<input>` element whose value is bound as a `string` and which includes all of Formula's
required handlers.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        username: "", password: ""
    }
});
return (
    <form onSubmit={form.submit}>
       <Input field={form("username")} />
       <Input field={form("password")} type="password" />
    </form>
)
```

## Unsupported types

Some input types are not supported by `<Input>`. Formally, an input type is supported if a
[`change` event](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/change_event)
for that type has meaningful string value for `event.target.value`. Specifically, that excludes the following:

- `button`, `image`, `reset`, `submit`: these are buttons rather than true inputs
- `checkbox`: An `<input type="checkbox">`'s `value` only represents the "on" value, rather than the current value, which
   is represented by `checked`. Use [Checkbox](/components/Checkbox)
- `radio`: An `<input type="radio">`'s `value` represents the associated value if the radio button is selected, rather
   than the current value for that field. Use [RadioButton](/components/RadioButton)
- `file`: It's not possible to convert it to a meaningful string
