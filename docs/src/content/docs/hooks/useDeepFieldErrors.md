---
title: useDeepFieldErrors
description: A hook to subscribe to the validation errors for a field, as well as any subfields
slug: hooks/useDeepFieldErrors
---

A hook to subscribe to the validation errors for a field, as well as any subfields.

## Sample usage

```tsx
const form = useForm({
    initialValues: {
        members: [{ username: "" }],
    }
});
useEffect(() => {
    form("members").setErrors(["Team must include at least 2 users"]);
    form("members")(0).setErrors(["User not found"]);
}, []);

const errors = useDeepFieldErrors(form("members"));
// [
//   { path: ["members],     message: "Team must include at least 2 users" },
//   { path: ["members", 0], message: "User not found"
// ]
```

## Type

```typescript
function useDeepFieldErrors<T>(field: Nullable<ReadonlyFormField<T>>): ReadonlyArray<StandardSchemaV1.Issue>
```
