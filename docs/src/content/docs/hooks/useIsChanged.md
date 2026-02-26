---
title: useIsChanged
description: A hook to get the changed state of a field
slug: hooks/useIsChanged
---

`useIsChanged` subscribes to the changed state of a field. It will only trigger a rerender when the status changes.

'Changed' is defined as having undergone any modification. A field is still considered "changed" even if it has been
changed and subsequently reverted.

A field being changed implies that any parent fields have also been changed.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "admin" }
});
const isChanged: boolean = useIsChanged(form("username"));
```

## Type

```typescript
function useIsChanged(field: Nullable<FormField<any>>): boolean
```
