---
title: useIsBlurred
description: A hook to subscribe to the blur state of a field
slug: hooks/useIsBlurred
---

A hook to subscribe to the blur state of a field. It will only trigger a rerender when the status changes.

[Blur](https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event) is defined as when a field loses focus.

The blur state does not propagate to any parent fields. Blurring a subfield of an object does not apply blur to the
parent object, and blurring an array element does not blur the entire array.

## Sample usage

```tsx
const form = useForm({
    initialValues: { username: "admin" }
});
const isBlurred: boolean = useIsBlurred(form("username"));
```

## Type

```typescript
function useIsBlurred(field: Nullable<FormField<any>>): boolean
```
