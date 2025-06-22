---
title: RadioButton
description: A component for creating radio buttons within Formula
slug: components/RadioButton
---

`<RadioButton>` renders an `<input type="radio">` element whose `checked` state is bound and which includes
all of Formula's required handlers.

By their nature, the relationship of radio buttons to form state is many-to-one, and that results in some duplication
which you might not like stylistically. You may prefer [`useRadioButton`](/hooks/useRadioButton) which removes
that duplication.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        animal: "cat"
    }
});
return (
    <div>
        <RadioButton field={form("animal")} value="cat" />
        <RadioButton field={form("animal")} value="dog" />
    </div>
)
```

If the form field is not a `string` or a `number`, the `mapToValue` prop is required. This should be the same for
each radio button.

```tsx
type Animal = { species: string }
const form = useForm({
    initialValues: {
        animal: { species: "cat" }
    }
});
function mapAnimalToId(animal: Animal) {
    return animal.species;
}
return (
    <div>
        <RadioButton
            field={form("animal")}
            value={{ species: "cat" }}
            mapToValue={mapAnimalToId}
        />
        <RadioButton
            field={form("animal")}
            value={{ species: "dog" }}
            mapToValue={mapAnimalToId}
        />
    </div>
)
```

## Type

```typescript
function RadioButton<T>(props: {
    // The field to associate with this radio button
    field: FormField<T>
    // The value that will be used if this radio button is selected
    value: T
}
& ([T] extends [string | number] ? {
    mapToValue?: Mapper<T>
} : {
    mapToValue: Mapper<T>
})
& Omit<DefaultInputProps, "type" | "value" | "checked">)

type Mapper<T> = (value: T) => string | number
```

### Native props

`<RadioButton>` supports
[all props of the native `<input>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#attributes),
except `value` is widened to allow any type. `type` is hardcoded to `radio` and `checked` is bound automatically.
