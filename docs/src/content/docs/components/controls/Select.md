---
title: Select
description: A component for creating select controls in Formula
slug: components/Select
---

The `Select` component renders a `<select>` element containing a number of `<option>`s. Unlike the native select
element, the value isn't required to be a number or string. It can be anything, provided you provide a mapper with the
`mapToValue` property.

```tsx
<Select
    field={form("animal")}
    options={[
        { label: "Cat", value: 1 },
        { label: "Dog", value: 2 },
        { label: "Mouse", value: 3, disabled: true }
    ]}
/>
```

## Required props

### field

The form field to associate with this control.

### options

The available options for the select. Each option can specify
[any of the attributes of the native `<option>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/option#attributes)

## Optional props

### mapToValue

If option values aren’t strings or numbers, you must provide a mapper function to convert each value into a string or
number.

```tsx
<Select
    field={form("animal")}
    options={[
        { label: "Cat", value: { type: "cat" } },
        { label: "Dog", value: { type: "dog" } },
    ]}
    mapToValue={val => val.type}
/>
```

### Native attributes

`<Select>` supports
[all attributes of the native `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#attributes)
