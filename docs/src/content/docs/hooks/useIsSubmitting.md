---
title: useIsSubmitting
description: A Formula hook to monitor submission status
slug: hooks/useIsSubmitting
---

A hook which returns whether the given form is in the process of being submitted. This includes pre-submission
validation and submission itself (e.g. async API request).

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "" },
    submit: data => sendRequest(data)
});
const isSubmitting: boolean = useIsSubmitting(form);
return (
    <form onSubmit={form.submit}>
        {/* ... */}
        <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
)
```

## Type

```typescript
function useIsSubmitting(form: Nullable<Form<any>>): boolean
```
