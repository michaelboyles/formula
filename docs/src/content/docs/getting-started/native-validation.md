---
title: Native validation
description: A guide to Formula's native validation
---

Formula ships with native typesafe validation, using the `validate` option of `useForm`. The shape of the validation
mirrors the shape of the form data.

A validator is a function which accepts the field value and returns a `string` or array of `strings` representing any
issues.

```tsx
const form = useForm({
    initialValues: { username: "", password: "" },
    submit: values => login(values.username, values.password),
    validate: {
        username(username) {
            if (!username.length) return "Required";
        }
    }
})
```

All validators are optional. In the above example, the password field is not validated.

## Objects

Objects can be validated just like primitives by providing a validator function, but often you'll want to
validate the subfields of an object individually. You can do that by providing an object which has the same
properties as the object being validated.

In some cases, it may make sense to both validate the object as a whole (perhaps to enforce invariants between
properties), and the individual fields of the object. You can achieve that by using the special `_self` property.

```tsx
const form = useForm({
    initialValues: {
        name: "",
        address: { number: "", street: "", city: "" }
    },
    submit: values => {},
    validate: {
        address: {
            number(number) {
                if (!number.length) return "Required";
            },
            _self({ number, street, city }) {
                if (!number.length || !street.length || !city.length) {
                    return "Incomplete address";
                }
            },
        }
    }
})
```

## Arrays

Array fields are validated similarly to object fields. You can provide a function to validate the whole array at once,
or an object to validate the individual elements, using the special property `_each`.

Like with object fields, if you want to validate both the array as a whole and its individual elements, you
can use the special `_self` property.

```tsx
const form = useForm({
    initialValues: {
        tags: [{ name: "react" }, { name: "" }]
    },
    submit() {},
    validate: {
        tags: {
            _self(tags) {
                if (!tags.length) return "Requires at least 1 tag"
            },
            _each: {
                name(name) {
                    if (!name.length) return "Cannot be blank";
                }
            }
        }
    }
});
```

## Patterns 

Since validators are functions, you can define your own collection of validators for re-use across different forms.
You can even use higher-order functions to define parameterized validators.

This pattern can result in some very declarative validation logic in your forms.

```tsx
function requiredString(value: string) {
    if (!value || !value.length) return "Required";
}

function maxLength(max: number): ValueValidator<string> {
    return (value: string) => {
        if (value.length > max) return `Max is ${max}`;
    }
}

const form = useForm({
    initialValues: { username: "", password: "" },
    submit: values => login(values.username, values.password),
    validate: {
        username: requiredString,
        password: maxLength(100)
    }
})
```
