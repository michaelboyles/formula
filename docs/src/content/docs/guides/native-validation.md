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

All validators are optional. In the above example, the password field is not validated on the client.

## Objects

Objects can be validated just like primitives by providing a validator function. If you do so, the errors will be
associated with the object field and not with any sub-fields.

```tsx
const form = useForm({
    initialValues: { user: { username: "", email: "" } },
    validate: {
        user(user) {
            if (!user.username.length || !user.email.length)
                return "Please fill in your details";
        }
    }
})
```

Often you'll want to validate the subfields of an object individually. This will associate the errors with those
sub-fields. You can do so by providing an object which has the same properties as the object being validated.

```tsx del={4-6} ins={7-13}
const form = useForm({
    initialValues: { user: { username: "", email: "" } },
    validate: {
        user(user) {
            if (!user.username.length || !user.email.length)
                return "Please fill in your details";
        user: {
            username(username) {
                if (!username.length) return "Required";
            },
            email(email) {
                if (!email.length) return "Required";
            }
        }
    }
})
```

In some cases, it may make sense to both validate the object as a whole (perhaps to enforce invariants between
properties), and the individual fields of the object. You can achieve that by using the special `_self` property.

```tsx ins={5-7}
const form = useForm({
    initialValues: { user: { username: "", email: "" } },
    validate: {
        user: {
            _self({ username, email }) {
                if (username === email) return "Username cannot use your email";
            },
            username(username) {
                if (!username.length) return "Required";
            },
            email(email) {
                if (!email.length) return "Required";
            }
        }
    }
})
```

## Arrays

Array fields are validated similarly to object fields. You can provide a function to validate the whole array at once,
or an object to validate the individual elements, using the special property `_each`.

Like with object fields, if you want to validate both the array as a whole and its individual elements, you
can use the special `_self` property.

```tsx {7} {10}
const form = useForm({
    initialValues: {
        tags: [{ name: "react" }, { name: "" }]
    },
    validate: {
        tags: {
            _self(tags) {
                if (!tags.length) return "Requires at least 1 tag"
            },
            _each: {
                name(name) {
                    if (!name.length) return "Required";
                }
            }
        }
    }
});
```

## Patterns 

If you thought that validation logic in the above examples was verbose then I'd agree with you. The same logic was
repeated multiple times to enforce that a field cannot be blank.

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
    initialValues: { user: { username: "", email: "" } },
    validate: {
        user: {
            username: maxLength(100),
            email: requiredString
        }
    }
})
```
