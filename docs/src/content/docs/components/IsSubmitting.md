---
title: IsSubmitting
description: A component for monitoring the submission state of a Formula form
slug: components/IsSubmitting
---

`<IsSubmitting>` subscribes to the `isSubmitting` state of the given form and exposes it to a render prop. You can
use it to watch the submission state without introducing unnecessary rerenders.

The counterpart hook is [`useIsSubmitting`](/hooks/useIsSubmitting).

## Sample usage

```tsx
const form = useForm({
    initialValues: { name: "" },
    submit: values => doSubmit(values)
})
return (
    <form onSubmit={form.submit}>
        Name: <Input field={form("name")} />
        <IsSubmitting form={form}>
            { isSubmitting => <button type="submit" disabled={isSubmitting}>Submit</button> }
        </IsSubmitting>
    </form>
)
```

## Type

```typescript
function IsSubmitting(props: {
    // The form to watch the isSubmitting status for
    form: Form<any>
    // A render function which will be passed the isSubmitting status
    children: (isSubmitting: boolean) => ReactNode
})
```
