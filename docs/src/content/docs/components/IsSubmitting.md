---
title: IsSubmitting
description: A component for monitoring the submission state of a Formula form
slug: components/IsSubmitting
---

```typescript
function IsSubmitting(props: {
    form: Form<any>
    children: (isSubmitting: boolean) => ReactNode
})
```

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
        Name: <Input field={form.get("name")} />
        <IsSubmitting form={form}>
            { isSubmitting => <button type="submit" disabled={isSubmitting}>Submit</button> }
        </IsSubmitting>
    </form>
)
```
