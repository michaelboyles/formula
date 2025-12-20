---
title: useDeepFieldErrors
description: A hook to get the errors for a form field and its subfields
slug: hooks/useDeepFieldErrors
---

`useDeepFieldErrors` subscribes to the validation errors for a field, as well as any subfields.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        members: [{ username: "" }],
    }
});
useEffect(() => {
    form("members").setErrors("Team must include at least 2 users");
    form("members")(0).setErrors("User not found");
}, []);

const errors = useDeepFieldErrors(form("members"));
// ["Team must include at least 2 users", "User not found"]
```

## Type

```typescript
function useDeepFieldErrors(field: FormField<any>): ReadonlyArray<string>
```
