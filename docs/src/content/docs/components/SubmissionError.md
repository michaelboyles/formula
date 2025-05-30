---
title: SubmissionError
description: A component for monitoring the submission error of a Formula form
slug: components/SubmissionError
---

`<SubmissionError>` subscribes to the latest submission error of the given form (if any) and exposes it to a
render prop. You can use it to watch for submission errors without introducing unnecessary rerenders.

The counterpart hook is [`useSubmissionError`](/hooks/useSubmissionError).

## Sample usage

```tsx
const form = useForm({
    initialValues: { name: "" },
    submit: values => {
        throw new Error("Failed to submit");
    }
})
return (
    <form onSubmit={form.submit}>
        Name: <Input field={form("name")} />
        <button type="submit">Submit</button>
        <SubmissionError form={form}>
            { error => error ? "Failed to submit" : null }
        </SubmissionError>
    </form>
)
```

## Type 

```typescript
function SubmissionError(props: {
    // The form to watch for submission errors
    form: Form<any>
    // A render function which will be passed the submission error, if any
    children: (submissionError: Error | undefined) => ReactNode
})
```
