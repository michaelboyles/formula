---
title: useIsSubmitting
description: A Formula hook to monitor submission status
slug: hooks/useIsSubmitting
---

```typescript
function useIsSubmitting(form: Form<any>): boolean
```

`useIsSubmitting` accepts a form and returns a boolean indicating whether the form is in the process of being submitted.

## Sample usage

```typescript jsx
const form = useForm({
   //... 
});
const isSubmitting = useIsSubmitting(form);
return (
    <form onSubmit={form.submit}>
        {/* ... */}
        <button type="submit" disabled={isSubmitting}>Submit</button>
    </form>
)
```
