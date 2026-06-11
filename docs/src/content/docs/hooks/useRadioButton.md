---
title: useRadioButton
description: Formula useRadioButton hook
slug: hooks/useRadioButton
---

`useRadioButton` returns a new component for the given `FormField`. It's used to remove the need for duplicate props
across [`<RadioButton>`s](/formula/components/controls/RadioButton), which it does by binding props dynamically.

## Sample usage

```tsx
const form = useForm({
    initialValues: { animal: "dog" }
})
const AnimalRadioButton = useRadioButton(form("animal"));
return (
    <form onSubmit={form.submit}>
        <AnimalRadioButton value="cat" />
        <AnimalRadioButton value="dog" />
    </form>
)
```

If your field is not a string or a number, you must provide a mapping function that converts it to a string or number.

You can also optionally provide a `name` attribute that will be applied to all radio buttons.

```tsx {9-10}
type Vehicle = { type: "bike" } | { type: "car" }

const form = useForm({
    initialValues: {
        vehicle: { type: "car" } as Vehicle
    }
});
const VehicleRadioButton = useRadioButton(form("vehicle"), {
    mapToValue: vehicle => vehicle.type,
    name: "vehicle"
});
return (
    <form>
        <VehicleRadioButton value={{ type: "bike" }} />
        <VehicleRadioButton value={{ type: "car" }} />
    </form>
)
```

## Type

```typescript
// `opts` can be omitted if the field is a simple string or number
function useRadioButton<T extends string | number>(field: FormField<T>, opts?: Opts<T>): FC<InputProps<T>>;
// else a mapper is required
function useRadioButton<T>(field: FormField<T>, opts: Opts<T>): FC<InputProps<T>>;

/** useRadioButton options */
export type Opts<T> = {
    /**
     * If you supply a name, the `name` attribute will be set on each `input`. This is
     * a convenience to avoid having to explicitly declare the name on each `input`.
     */
    name?: string
} & ([T] extends [string | number] ? {
    /**
     * If the field type in the form state is a string or number, a mapper is optional. This is used to put different
     * values in the DOM than is stored in form state (e.g. `<input value="mapResult">`).
     */
    mapToValue?: Mapper<T, string | number>
} : {
    /**
     * If the field type is not a string or number, a map function is required to "stringify" the field value into
     * something that can be put in an `<input value="">`.
     */
    mapToValue: Mapper<T, string | number>
});

type DynamicRadioBtnProps<T> = {
    /** The value that will be used if this radio button is selected */
    value: T
}
& Omit<ComponentProps<"input">, "type" | "value" | "checked">;
```
