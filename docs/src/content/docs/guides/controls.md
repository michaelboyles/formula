---
title: Controls
description: An introduction to Formula controls
---

Formula includes wrapper components like [`<Input>`](/formula/components/Input) which you're expected to use in place of
their native equivalents such as `<input>`.

Each Formula control accepts a [FormField](/formula/guides/fields) prop called `field`, which points to the slice of
the form data that should be wired to the control.

```tsx {13} {15}
import { Input, useForm } from "@michaelboyles/formula";

export function LoginForm() {
    const form = useForm({
        initialValues: {
            username: "",
            password: ""
        }
    });
    return (
        <form onSubmit={form.submit}>
            Username:
            <Input field={form("username")} />
            Password:
            <Input field={form("password")} type="password" />
        </form>
    )
}
```

## Built-in controls

| Control                                          | Native control            | Notes                                            |
|--------------------------------------------------|---------------------------|--------------------------------------------------|
| [Checkbox](/formula/components/Checkbox)         | `<input type="checkbox">` | Suitable for boolean values                      |
| [Input](/formula/components/Input)               | `<input>`                 | Suitable for string values: text, password, etc. | 
| [FileInput](/formula/components/FileInput)       | `<input type="file">`     |                                                  |
| [IntegerInput](/formula/components/IntegerInput) | `<input type="number">`   | Numeric input that only permits integers         |
| [NumberInput](/formula/components/NumberInput)   | `<input type="number">`   | Numeric input that permits integers and decimals |
| [RadioButton](/formula/components/RadioButton)   | `<input type="radio">`    |                                                  |
| [Select](/formula/components/Select)             | `<select>`                |                                                  |
| [TextArea](/formula/components/TextArea)         | `<textarea>`              |                                                  |

## Demystifying controls

There's nothing magical about Formula's controls. In fact, you could write your code without them, it would just be
more verbose and re-render more often.

Here's an example of how you could write the same form as above without using `<Input>`:

```tsx
import { useFieldData, useForm } from "@michaelboyles/formula";

export function LoginForm() {
    const form = useForm({
        initialValues: {
            username: "",
            password: ""
        }
    });
    const usernameField = form("username");
    const username = useFieldData(usernameField);
    const passwordField = form("password");
    const password = useFieldData(passwordField);
    return (
        <form onSubmit={form.submit}>
            Username:
            <input
                value={username}
                onChange={e => {
                    usernameField.setData(e.target.value);
                    usernameField.setIsChanged(true);
                }}
                onBlur={() => usernameField.setIsBlurred(true)}
            />
            Password:
            <input
                type="password"
                value={password}
                onChange={e => {
                    passwordField.setData(e.target.value);
                    passwordField.setIsChanged(true);
                }}
                onBlur={() => passwordField.setIsBlurred(true)}
            />
        </form>
    )
}
```

There are a few issues with the code above. Firstly, the wiring for the change and blur listeners is repeated for both
inputs.

Secondly, the use of [`useFieldData`](/formula/hooks/useFieldData) at the form level means that typing in either input
will re-render the entire form. That's not likely to be a problem in this example, but the re-rendering could be isolated
to only a single input.

`<Input>` and the other built-in controls solve both of these problems, by moving the `useFieldData` hook further down
the tree, and automatically applying `onChange` and `onBlur` listeners.

## Writing your own controls

There will be cases where the functionality of the built-in controls is too limited. They're provided for convenience and
aren't expected to cover every use case. You can always write your own controls.

A basic control will:

- Accept a `FormField` prop. Unless there's a good reason not to, name it 'field' for consistency with Formula's controls
- Call `useFieldData` to subscribe to updates to the value
- Call `setData` when the value changes. If no options are provided (2nd parameter), this will automatically mark the
  field as having changed
- Call `setIsBlurred` when the field is blurred (*optional*: blur may not be relevant to all fields)

Here's a simple example of a custom control:

```tsx
import { type FormField, useFieldData, useForm } from "@michaelboyles/formula";

export type ToggleProps = {
    field: FormField<boolean>
}
export function Toggle({ field }: ToggleProps) {
    const isOn = useFieldData(field);
    return (
        <button
            onClick={() => field.setData(prev => !prev)}
        >
            { isOn ? "ON" : "OFF" }
        </button>
    )
}
```

The list above is only the minimum. A more complex custom control may go further. For example, you might use
[`useFieldErrors`](/formula/hooks/useFieldErrors) to add an error indicator to the field.
