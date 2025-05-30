---
title: Select
description: A component for creating select controls in Formula
slug: components/Select
---

The `Select` component renders a `<select>` element containing a number of `<option>`s. Unlike the native select
element, the value isn't required to be a number or string. It can be anything, provided you provide a mapper with the
`mapToValue` property.

## Sample usage

```tsx
const form = useForm({
    initialValues: { 
        animalId: 1
    }
});
return (
    <Select
        field={form("animalId")}
        options={[
            { label: "Cat", value: 1 },
            { label: "Dog", value: 2 },
            { label: "Mouse", value: 3, disabled: true }
        ]}
    />
)
```

## Type

```typescript
function Select<T>(props: {
    // The field to associate with this 'select' control
    field: FormField<T>
    // The options to be included
    options: Array<Option<T>>
}
& MapperProps<T>
& DefaultSelectProps)

type Option<T> = {
    value: T
} & Omit<DefaultOptionProps, "value">

type MapperProps<T> =
    [T] extends [string | number] ? {
        // A mapper is optional if the value is already a string or number
        mapToValue?: Mapper<T>
    } : {
        // A mapper is required if the value is a complex type
        mapToValue: Mapper<T>
    };
```

### Native props

`<Select>` supports
[all props of the native `<select>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/select#attributes).
