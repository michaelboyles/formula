---
title: useIsSubmitting
description: A Formula hook to monitor submission status
slug: hooks/useIsSubmitting
---

`useIsSubmitting` accepts a form and returns a boolean indicating whether the form is in the process of being submitted.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "" }
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
function useIsSubmitting(form: Form<any>): boolean
```
