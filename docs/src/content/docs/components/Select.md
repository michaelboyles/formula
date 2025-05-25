---
title: Select
description: A select component
---

The `Select` component creates a `<select>` containing a number of `<option>`s. Unlike the native select element, the
value isn't required to be a number or string. It can be anything, provided you 

```typescript jsx
<Select
    field={form.get("animal")}
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

If the value of the options isn't string or number, then an additional mapper function is required to convert each
option's value into a string or number.

```typescript jsx
<Select
    field={form.get("animal")}
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
